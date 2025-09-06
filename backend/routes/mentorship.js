const express = require('express');
const MentorshipRequest = require('../models/MentorshipRequest');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { validateMentorshipRequest, validatePagination, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/mentorship/requests
// @desc    Get mentorship requests (sent and received)
// @access  Private
router.get('/requests', [authenticateToken, validatePagination], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {
      $or: [
        { mentee: req.user._id },
        { mentor: req.user._id }
      ]
    };
    
    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }
    
    // Filter by type (sent or received)
    if (req.query.type === 'sent') {
      filter.$or = [{ mentee: req.user._id }];
    } else if (req.query.type === 'received') {
      filter.$or = [{ mentor: req.user._id }];
    }
    
    const requests = await MentorshipRequest.find(filter)
      .populate('mentee', 'name email avatar role company batch')
      .populate('mentor', 'name email avatar role company batch mentorshipProfile')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await MentorshipRequest.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          currentPage: page,
          totalPages,
          totalRequests: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get mentorship requests error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mentorship requests'
    });
  }
});

// @route   GET /api/mentorship/requests/:id
// @desc    Get specific mentorship request
// @access  Private
router.get('/requests/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id)
      .populate('mentee', 'name email avatar role company batch')
      .populate('mentor', 'name email avatar role company batch mentorshipProfile');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is involved in this request
    if (request.mentee._id.toString() !== req.user._id.toString() && 
        request.mentor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    res.json({
      success: true,
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Get mentorship request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mentorship request'
    });
  }
});

// @route   POST /api/mentorship/requests
// @desc    Create new mentorship request
// @access  Private
router.post('/requests', [authenticateToken, validateMentorshipRequest], async (req, res) => {
  try {
    const { mentor, subject, message, mentorshipType, preferredMeetingType, goals, timeline, expertise } = req.body;
    
    // Check if mentor exists and is available for mentorship
    const mentorUser = await User.findById(mentor);
    if (!mentorUser) {
      return res.status(404).json({
        success: false,
        message: 'Mentor not found'
      });
    }
    
    if (!mentorUser.preferences.mentorshipAvailable) {
      return res.status(400).json({
        success: false,
        message: 'This user is not available for mentorship'
      });
    }
    
    // Check if user is trying to request mentorship from themselves
    if (mentor === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot request mentorship from yourself'
      });
    }
    
    // Check if there's already a pending request between these users
    const existingRequest = await MentorshipRequest.findOne({
      mentee: req.user._id,
      mentor: mentor,
      status: { $in: ['pending', 'accepted'] }
    });
    
    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending or active mentorship request with this mentor'
      });
    }
    
    const requestData = {
      mentee: req.user._id,
      mentor,
      subject,
      message,
      mentorshipType,
      preferredMeetingType,
      goals: goals || [],
      timeline: timeline || 'flexible',
      expertise: expertise || []
    };
    
    const mentorshipRequest = new MentorshipRequest(requestData);
    await mentorshipRequest.save();
    
    // Populate the request
    await mentorshipRequest.populate([
      { path: 'mentee', select: 'name email avatar role company batch' },
      { path: 'mentor', select: 'name email avatar role company batch' }
    ]);
    
    // Emit notification to mentor via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${mentor}`).emit('new-mentorship-request', {
        request: mentorshipRequest,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Mentorship request sent successfully',
      data: {
        request: mentorshipRequest
      }
    });
  } catch (error) {
    console.error('Create mentorship request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating mentorship request'
    });
  }
});

// @route   PUT /api/mentorship/requests/:id/accept
// @desc    Accept mentorship request
// @access  Private (mentor only)
router.put('/requests/:id/accept', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { responseMessage } = req.body;
    
    const request = await MentorshipRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is the mentor
    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentor can accept this request'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been responded to'
      });
    }
    
    await request.accept(responseMessage);
    
    // Populate the request
    await request.populate([
      { path: 'mentee', select: 'name email avatar role company batch' },
      { path: 'mentor', select: 'name email avatar role company batch' }
    ]);
    
    // Emit notification to mentee
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${request.mentee._id}`).emit('mentorship-request-accepted', {
        request,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Mentorship request accepted successfully',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Accept mentorship request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error accepting mentorship request'
    });
  }
});

// @route   PUT /api/mentorship/requests/:id/decline
// @desc    Decline mentorship request
// @access  Private (mentor only)
router.put('/requests/:id/decline', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { responseMessage } = req.body;
    
    const request = await MentorshipRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is the mentor
    if (request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentor can decline this request'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been responded to'
      });
    }
    
    await request.decline(responseMessage);
    
    // Populate the request
    await request.populate([
      { path: 'mentee', select: 'name email avatar role company batch' },
      { path: 'mentor', select: 'name email avatar role company batch' }
    ]);
    
    // Emit notification to mentee
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${request.mentee._id}`).emit('mentorship-request-declined', {
        request,
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      message: 'Mentorship request declined',
      data: {
        request
      }
    });
  } catch (error) {
    console.error('Decline mentorship request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error declining mentorship request'
    });
  }
});

// @route   PUT /api/mentorship/requests/:id/complete
// @desc    Mark mentorship as completed
// @access  Private (mentor or mentee)
router.put('/requests/:id/complete', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is involved in this mentorship
    if (request.mentee.toString() !== req.user._id.toString() && 
        request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Only accepted mentorships can be completed'
      });
    }
    
    await request.complete();
    
    res.json({
      success: true,
      message: 'Mentorship marked as completed'
    });
  } catch (error) {
    console.error('Complete mentorship error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error completing mentorship'
    });
  }
});

// @route   POST /api/mentorship/requests/:id/meetings
// @desc    Schedule a meeting
// @access  Private (mentor or mentee)
router.post('/requests/:id/meetings', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { date, duration, meetingLink, notes } = req.body;
    
    if (!date || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Date and duration are required'
      });
    }
    
    const request = await MentorshipRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is involved in this mentorship
    if (request.mentee.toString() !== req.user._id.toString() && 
        request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (request.status !== 'accepted') {
      return res.status(400).json({
        success: false,
        message: 'Can only schedule meetings for accepted mentorships'
      });
    }
    
    const meetingData = {
      date: new Date(date),
      duration: parseInt(duration),
      meetingLink: meetingLink || '',
      notes: notes || ''
    };
    
    await request.scheduleMeeting(meetingData);
    
    // Notify the other party
    const otherUserId = request.mentee.toString() === req.user._id.toString() 
      ? request.mentor.toString() 
      : request.mentee.toString();
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${otherUserId}`).emit('meeting-scheduled', {
        mentorshipId: request._id,
        meeting: meetingData,
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Meeting scheduled successfully',
      data: {
        meeting: meetingData
      }
    });
  } catch (error) {
    console.error('Schedule meeting error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error scheduling meeting'
    });
  }
});

// @route   POST /api/mentorship/requests/:id/feedback
// @desc    Add feedback for mentorship
// @access  Private (mentor or mentee)
router.post('/requests/:id/feedback', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const { rating, review } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const request = await MentorshipRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is involved in this mentorship
    if (request.mentee.toString() !== req.user._id.toString() && 
        request.mentor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    if (request.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only add feedback for completed mentorships'
      });
    }
    
    const userType = request.mentee.toString() === req.user._id.toString() ? 'mentee' : 'mentor';
    
    // Check if user has already provided feedback
    if ((userType === 'mentee' && request.feedback.menteeRating) ||
        (userType === 'mentor' && request.feedback.mentorRating)) {
      return res.status(400).json({
        success: false,
        message: 'You have already provided feedback for this mentorship'
      });
    }
    
    await request.addFeedback({ rating, review }, userType);
    
    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: {
        feedback: request.feedback
      }
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error adding feedback'
    });
  }
});

// @route   GET /api/mentorship/stats
// @desc    Get mentorship statistics
// @access  Private
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    // User's mentorship stats
    const sentRequests = await MentorshipRequest.countDocuments({ mentee: req.user._id });
    const receivedRequests = await MentorshipRequest.countDocuments({ mentor: req.user._id });
    const acceptedAsMentee = await MentorshipRequest.countDocuments({ 
      mentee: req.user._id, 
      status: 'accepted' 
    });
    const acceptedAsMentor = await MentorshipRequest.countDocuments({ 
      mentor: req.user._id, 
      status: 'accepted' 
    });
    const completedAsMentee = await MentorshipRequest.countDocuments({ 
      mentee: req.user._id, 
      status: 'completed' 
    });
    const completedAsMentor = await MentorshipRequest.countDocuments({ 
      mentor: req.user._id, 
      status: 'completed' 
    });
    
    // Overall platform stats
    const totalRequests = await MentorshipRequest.countDocuments();
    const totalMentors = await User.countDocuments({ 'preferences.mentorshipAvailable': true });
    
    // Average rating as mentor
    const mentorFeedback = await MentorshipRequest.aggregate([
      { $match: { mentor: req.user._id, 'feedback.mentorRating': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.mentorRating' } } }
    ]);
    
    // Average rating as mentee
    const menteeFeedback = await MentorshipRequest.aggregate([
      { $match: { mentee: req.user._id, 'feedback.menteeRating': { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$feedback.menteeRating' } } }
    ]);
    
    res.json({
      success: true,
      data: {
        userStats: {
          sentRequests,
          receivedRequests,
          acceptedAsMentee,
          acceptedAsMentor,
          completedAsMentee,
          completedAsMentor,
          avgRatingAsMentor: mentorFeedback[0]?.avgRating || null,
          avgRatingAsMentee: menteeFeedback[0]?.avgRating || null
        },
        platformStats: {
          totalRequests,
          totalMentors
        }
      }
    });
  } catch (error) {
    console.error('Get mentorship stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mentorship statistics'
    });
  }
});

// @route   DELETE /api/mentorship/requests/:id
// @desc    Cancel mentorship request
// @access  Private (mentee only, and only if pending)
router.delete('/requests/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found'
      });
    }
    
    // Check if user is the mentee
    if (request.mentee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the mentee can cancel the request'
      });
    }
    
    if (request.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only cancel pending requests'
      });
    }
    
    request.status = 'cancelled';
    await request.save();
    
    res.json({
      success: true,
      message: 'Mentorship request cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel mentorship request error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error cancelling mentorship request'
    });
  }
});

module.exports = router;
