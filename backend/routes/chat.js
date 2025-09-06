const express = require('express');
const ChatMessage = require('../models/ChatMessage');
const { authenticateToken } = require('../middleware/auth');
const { validateChatMessage, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/chat/messages
// @desc    Get chat messages with pagination
// @access  Private
router.get('/messages', [authenticateToken, validatePagination], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const filter = { isDeleted: false };
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.createdAt = {};
      if (req.query.startDate) {
        filter.createdAt.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.createdAt.$lte = new Date(req.query.endDate);
      }
    }
    
    // Search in message content
    if (req.query.search) {
      filter.content = new RegExp(req.query.search, 'i');
    }
    
    // Filter by message type
    if (req.query.messageType) {
      filter.messageType = req.query.messageType;
    }
    
    const messages = await ChatMessage.find(filter)
      .populate('sender', 'name avatar role company')
      .populate('mentions', 'name avatar')
      .populate('replyTo', 'content sender')
      .populate('reactions.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ChatMessage.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          currentPage: page,
          totalPages,
          totalMessages: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching messages'
    });
  }
});

// @route   POST /api/chat/messages
// @desc    Send a new message
// @access  Private
router.post('/messages', [authenticateToken, validateChatMessage], async (req, res) => {
  try {
    const { content, messageType = 'text', mentions = [], replyTo } = req.body;
    
    // Create message
    const messageData = {
      sender: req.user._id,
      content: content.trim(),
      messageType,
      mentions,
      replyTo: replyTo || undefined
    };
    
    const message = new ChatMessage(messageData);
    await message.save();
    
    // Populate message data
    await message.populate([
      { path: 'sender', select: 'name avatar role company' },
      { path: 'mentions', select: 'name avatar' },
      { path: 'replyTo', select: 'content sender', populate: { path: 'sender', select: 'name' } }
    ]);
    
    // Emit to all connected clients via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('new-message', {
        message,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error sending message'
    });
  }
});

// @route   PUT /api/chat/messages/:id
// @desc    Edit a message
// @access  Private (sender only)
router.put('/messages/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }
    
    const message = await ChatMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit deleted message'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own messages'
      });
    }
    
    // Check if message is too old to edit (e.g., 15 minutes)
    const editTimeLimit = 15 * 60 * 1000; // 15 minutes in milliseconds
    if (Date.now() - message.createdAt.getTime() > editTimeLimit) {
      return res.status(400).json({
        success: false,
        message: 'Message is too old to edit'
      });
    }
    
    await message.editMessage(content.trim());
    
    // Populate message data
    await message.populate([
      { path: 'sender', select: 'name avatar role company' },
      { path: 'mentions', select: 'name avatar' }
    ]);
    
    // Emit update to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('message-edited', {
        messageId: message._id,
        content: message.content,
        isEdited: message.isEdited,
        editedAt: message.editedAt
      });
    }
    
    res.json({
      success: true,
      message: 'Message edited successfully',
      data: {
        message
      }
    });
  } catch (error) {
    console.error('Edit message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error editing message'
    });
  }
});

// @route   DELETE /api/chat/messages/:id
// @desc    Delete a message
// @access  Private (sender only)
router.delete('/messages/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const message = await ChatMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Message is already deleted'
      });
    }
    
    // Check if user is the sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }
    
    await message.softDelete();
    
    // Emit deletion to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('message-deleted', {
        messageId: message._id,
        content: message.content
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting message'
    });
  }
});

// @route   POST /api/chat/messages/:id/reactions
// @desc    Add reaction to message
// @access  Private
router.post('/messages/:id/reactions', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }
    
    const message = await ChatMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    if (message.isDeleted) {
      return res.status(400).json({
        success: false,
        message: 'Cannot react to deleted message'
      });
    }
    
    try {
      await message.addReaction(req.user._id, emoji);
      
      // Populate reactions
      await message.populate('reactions.user', 'name avatar');
      
      // Emit reaction to all connected clients
      const io = req.app.get('io');
      if (io) {
        io.emit('message-reaction-added', {
          messageId: message._id,
          reaction: {
            user: {
              _id: req.user._id,
              name: req.user.name,
              avatar: req.user.avatar
            },
            emoji,
            createdAt: new Date()
          }
        });
      }
      
      res.json({
        success: true,
        message: 'Reaction added successfully',
        data: {
          reactions: message.reactions
        }
      });
    } catch (reactionError) {
      return res.status(400).json({
        success: false,
        message: reactionError.message
      });
    }
  } catch (error) {
    console.error('Add reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding reaction'
    });
  }
});

// @route   DELETE /api/chat/messages/:id/reactions
// @desc    Remove reaction from message
// @access  Private
router.delete('/messages/:id/reactions', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { emoji } = req.body;
    
    if (!emoji) {
      return res.status(400).json({
        success: false,
        message: 'Emoji is required'
      });
    }
    
    const message = await ChatMessage.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    await message.removeReaction(req.user._id, emoji);
    
    // Emit reaction removal to all connected clients
    const io = req.app.get('io');
    if (io) {
      io.emit('message-reaction-removed', {
        messageId: message._id,
        userId: req.user._id,
        emoji
      });
    }
    
    res.json({
      success: true,
      message: 'Reaction removed successfully'
    });
  } catch (error) {
    console.error('Remove reaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error removing reaction'
    });
  }
});

// @route   GET /api/chat/stats
// @desc    Get chat statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const totalMessages = await ChatMessage.countDocuments({ isDeleted: false });
    
    // Messages by current user
    const userMessages = await ChatMessage.countDocuments({
      sender: req.user._id,
      isDeleted: false
    });
    
    // Messages today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const messagesToday = await ChatMessage.countDocuments({
      createdAt: { $gte: today },
      isDeleted: false
    });
    
    // Most active users (top 10)
    const activeUsers = await ChatMessage.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$sender', messageCount: { $sum: 1 } } },
      { $sort: { messageCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          messageCount: 1,
          'user.name': 1,
          'user.avatar': 1,
          'user.role': 1
        }
      }
    ]);
    
    // Messages by type
    const messagesByType = await ChatMessage.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: '$messageType', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      data: {
        totalMessages,
        userMessages,
        messagesToday,
        activeUsers,
        messagesByType
      }
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching chat statistics'
    });
  }
});

// @route   GET /api/chat/search
// @desc    Search messages
// @access  Private
router.get('/search', [authenticateToken, validatePagination], async (req, res) => {
  try {
    const { query, sender, dateFrom, dateTo } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }
    
    const filter = {
      isDeleted: false,
      content: new RegExp(query, 'i')
    };
    
    // Filter by sender
    if (sender) {
      filter.sender = sender;
    }
    
    // Filter by date range
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        filter.createdAt.$lte = new Date(dateTo);
      }
    }
    
    const messages = await ChatMessage.find(filter)
      .populate('sender', 'name avatar role company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await ChatMessage.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        messages,
        pagination: {
          currentPage: page,
          totalPages,
          totalResults: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Search messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error searching messages'
    });
  }
});

module.exports = router;
