const express = require('express');
const Event = require('../models/Event');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateEventCreation, validatePagination, validateSearch, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/events
// @desc    Get all events with filtering and pagination
// @access  Public (with optional auth)
router.get('/', [optionalAuth, validatePagination, validateSearch], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { 
      status: 'published',
      isPublic: true,
      date: { $gte: new Date() } // Only future events by default
    };
    
    // Include past events if requested
    if (req.query.includePast === 'true') {
      delete filter.date;
    }
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
        { tags: { $in: [searchRegex] } }
      ];
    }
    
    // Filter by category
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Filter by date range
    if (req.query.startDate || req.query.endDate) {
      filter.date = {};
      if (req.query.startDate) {
        filter.date.$gte = new Date(req.query.startDate);
      }
      if (req.query.endDate) {
        filter.date.$lte = new Date(req.query.endDate);
      }
    }
    
    // Filter by virtual/in-person
    if (req.query.isVirtual !== undefined) {
      filter.isVirtual = req.query.isVirtual === 'true';
    }
    
    // Filter by availability (events with available spots)
    if (req.query.availableOnly === 'true') {
      // This will be handled in the aggregation pipeline
    }
    
    // Execute query with population
    const events = await Event.find(filter)
      .populate('organizer', 'name email avatar role company')
      .populate('attendees.user', 'name avatar')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
    
    // Filter events with available spots if requested
    let filteredEvents = events;
    if (req.query.availableOnly === 'true') {
      filteredEvents = events.filter(event => !event.isFull);
    }
    
    // Get total count
    const total = await Event.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        events: filteredEvents,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching events'
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get event by ID
// @access  Public
router.get('/:id', [optionalAuth, validateObjectId('id')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name email avatar role company')
      .populate('attendees.user', 'name avatar role company')
      .populate('comments.user', 'name avatar');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if event is public or user has access
    if (!event.isPublic && (!req.user || req.user._id.toString() !== event.organizer._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'This event is private'
      });
    }
    
    res.json({
      success: true,
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching event'
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Private
router.post('/', [authenticateToken, validateEventCreation], async (req, res) => {
  try {
    const eventData = {
      ...req.body,
      organizer: req.user._id
    };
    
    const event = new Event(eventData);
    await event.save();
    
    // Populate organizer info
    await event.populate('organizer', 'name email avatar role company');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: {
        event
      }
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating event'
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Private (organizer only)
router.put('/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can update this event'
      });
    }
    
    // Don't allow updating certain fields if event has attendees
    const restrictedFields = ['date', 'time', 'location'];
    if (event.attendees.length > 0) {
      const hasRestrictedUpdates = restrictedFields.some(field => req.body[field] !== undefined);
      if (hasRestrictedUpdates) {
        return res.status(400).json({
          success: false,
          message: 'Cannot update date, time, or location after users have registered'
        });
      }
    }
    
    const allowedUpdates = [
      'title', 'description', 'date', 'time', 'location', 'maxAttendees',
      'category', 'tags', 'image', 'isVirtual', 'virtualLink', 
      'registrationDeadline', 'isPublic', 'requiresApproval'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('organizer', 'name email avatar role company');
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: {
        event: updatedEvent
      }
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating event'
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete/Cancel event
// @access  Private (organizer only)
router.delete('/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Check if user is the organizer
    if (event.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the event organizer can delete this event'
      });
    }
    
    // If event has attendees, mark as cancelled instead of deleting
    if (event.attendees.length > 0) {
      event.status = 'cancelled';
      await event.save();
      
      res.json({
        success: true,
        message: 'Event cancelled successfully'
      });
    } else {
      await Event.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Event deleted successfully'
      });
    }
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting event'
    });
  }
});

// @route   POST /api/events/:id/register
// @desc    Register for event
// @access  Private
router.post('/:id/register', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (event.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this event'
      });
    }
    
    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Registration deadline has passed'
      });
    }
    
    // Check if event is in the past
    if (event.date < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for past events'
      });
    }
    
    try {
      await event.addAttendee(req.user._id);
      
      // Populate attendee info
      await event.populate('attendees.user', 'name avatar');
      
      res.json({
        success: true,
        message: 'Successfully registered for event',
        data: {
          event
        }
      });
    } catch (attendeeError) {
      return res.status(400).json({
        success: false,
        message: attendeeError.message
      });
    }
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error registering for event'
    });
  }
});

// @route   DELETE /api/events/:id/register
// @desc    Unregister from event
// @access  Private
router.delete('/:id/register', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.isUserAttending(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: 'You are not registered for this event'
      });
    }
    
    await event.removeAttendee(req.user._id);
    
    res.json({
      success: true,
      message: 'Successfully unregistered from event'
    });
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error unregistering from event'
    });
  }
});

// @route   POST /api/events/:id/comments
// @desc    Add comment to event
// @access  Private
router.post('/:id/comments', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }
    
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    await event.addComment(req.user._id, content.trim());
    
    // Populate the new comment
    await event.populate('comments.user', 'name avatar');
    
    // Get the latest comment
    const latestComment = event.comments[event.comments.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: latestComment
      }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding comment'
    });
  }
});

// @route   GET /api/events/my/organized
// @desc    Get events organized by current user
// @access  Private
router.get('/my/organized', [authenticateToken, validatePagination], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = { organizer: req.user._id };
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    const events = await Event.find(filter)
      .populate('organizer', 'name email avatar')
      .populate('attendees.user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Event.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get organized events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching organized events'
    });
  }
});

// @route   GET /api/events/my/attending
// @desc    Get events user is attending
// @access  Private
router.get('/my/attending', [authenticateToken, validatePagination], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const events = await Event.find({
      'attendees.user': req.user._id,
      'attendees.status': 'registered'
    })
      .populate('organizer', 'name email avatar role company')
      .populate('attendees.user', 'name avatar')
      .sort({ date: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Event.countDocuments({
      'attendees.user': req.user._id,
      'attendees.status': 'registered'
    });
    
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages,
          totalEvents: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get attending events error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching attending events'
    });
  }
});

module.exports = router;
