const express = require('express');
const User = require('../models/User');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const { validateUserUpdate, validatePagination, validateSearch, validateObjectId } = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users/alumni with filtering and pagination
// @access  Public (with optional auth for enhanced features)
router.get('/', [optionalAuth, validatePagination, validateSearch], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { isActive: true };
    
    // Search functionality
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      filter.$or = [
        { name: searchRegex },
        { role: searchRegex },
        { company: searchRegex },
        { skills: { $in: [searchRegex] } },
        { location: searchRegex }
      ];
    }
    
    // Filter by batch
    if (req.query.batch) {
      filter.batch = req.query.batch;
    }
    
    // Filter by skills
    if (req.query.skills) {
      const skillsArray = Array.isArray(req.query.skills) ? req.query.skills : [req.query.skills];
      filter.skills = { $in: skillsArray };
    }
    
    // Filter by company
    if (req.query.company) {
      filter.company = new RegExp(req.query.company, 'i');
    }
    
    // Filter by location
    if (req.query.location) {
      filter.location = new RegExp(req.query.location, 'i');
    }
    
    // Filter by mentorship availability
    if (req.query.mentorshipAvailable === 'true') {
      filter['preferences.mentorshipAvailable'] = true;
    }
    
    // Privacy filter - only show users based on their privacy settings
    if (!req.user) {
      filter['preferences.profileVisibility'] = 'public';
    } else if (req.user) {
      filter['preferences.profileVisibility'] = { $in: ['public', 'alumni-only'] };
    }
    
    // Execute query
    const users = await User.find(filter)
      .select('-password -__v')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Get total count for pagination
    const total = await User.countDocuments(filter);
    
    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: total,
          hasNextPage,
          hasPrevPage,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Public (with privacy restrictions)
router.get('/:id', [optionalAuth, validateObjectId('id')], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -__v');
    
    if (!user || !user.isActive) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check privacy settings
    if (user.preferences.profileVisibility === 'private') {
      return res.status(403).json({
        success: false,
        message: 'This profile is private'
      });
    }
    
    if (user.preferences.profileVisibility === 'alumni-only' && !req.user) {
      return res.status(403).json({
        success: false,
        message: 'This profile is only visible to alumni'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user profile
// @access  Private (own profile only)
router.put('/:id', [authenticateToken, validateObjectId('id'), validateUserUpdate], async (req, res) => {
  try {
    // Check if user is updating their own profile
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own profile'
      });
    }
    
    const allowedUpdates = [
      'name', 'bio', 'skills', 'company', 'location', 'linkedin', 
      'github', 'website', 'phone', 'preferences', 'mentorshipProfile'
    ];
    
    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Deactivate user account
// @access  Private (own account only)
router.delete('/:id', [authenticateToken, validateObjectId('id')], async (req, res) => {
  try {
    // Check if user is deactivating their own account
    if (req.params.id !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only deactivate your own account'
      });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password -__v');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deactivating account'
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get alumni statistics
// @access  Public
router.get('/stats/overview', async (req, res) => {
  try {
    const totalAlumni = await User.countDocuments({ isActive: true });
    
    // Get batch distribution
    const batchStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $sort: { _id: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top companies
    const companyStats = await User.aggregate([
      { $match: { isActive: true, company: { $ne: '' } } },
      { $group: { _id: '$company', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get top skills
    const skillStats = await User.aggregate([
      { $match: { isActive: true } },
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);
    
    // Get location distribution
    const locationStats = await User.aggregate([
      { $match: { isActive: true, location: { $ne: '' } } },
      { $group: { _id: '$location', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get mentorship availability
    const mentorshipStats = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { 
        _id: '$preferences.mentorshipAvailable', 
        count: { $sum: 1 } 
      }}
    ]);
    
    res.json({
      success: true,
      data: {
        totalAlumni,
        batchDistribution: batchStats,
        topCompanies: companyStats,
        topSkills: skillStats,
        locationDistribution: locationStats,
        mentorshipAvailability: mentorshipStats
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching statistics'
    });
  }
});

// @route   GET /api/users/mentors/available
// @desc    Get available mentors
// @access  Private
router.get('/mentors/available', [authenticateToken, validatePagination], async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const filter = {
      isActive: true,
      'preferences.mentorshipAvailable': true,
      _id: { $ne: req.user._id } // Exclude current user
    };
    
    // Filter by expertise
    if (req.query.expertise) {
      const expertiseArray = Array.isArray(req.query.expertise) ? req.query.expertise : [req.query.expertise];
      filter['mentorshipProfile.expertise'] = { $in: expertiseArray };
    }
    
    // Filter by availability level
    if (req.query.availability) {
      filter['mentorshipProfile.availability'] = req.query.availability;
    }
    
    const mentors = await User.find(filter)
      .select('name email role company location skills mentorshipProfile preferences.mentorshipAvailable avatar')
      .sort({ 'mentorshipProfile.availability': -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);
    
    res.json({
      success: true,
      data: {
        mentors,
        pagination: {
          currentPage: page,
          totalPages,
          totalMentors: total,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
          limit
        }
      }
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching mentors'
    });
  }
});

module.exports = router;
