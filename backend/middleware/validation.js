const { body, param, query, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  body('batch')
    .trim()
    .notEmpty()
    .withMessage('Graduation year is required')
    .matches(/^\d{4}$/)
    .withMessage('Graduation year must be a 4-digit year'),
  
  body('role')
    .trim()
    .notEmpty()
    .withMessage('Current role is required')
    .isLength({ max: 100 })
    .withMessage('Role cannot exceed 100 characters'),
  
  handleValidationErrors
];

const validateUserLogin = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

const validateUserUpdate = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters'),
  
  body('company')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Company name cannot exceed 100 characters'),
  
  body('location')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Location cannot exceed 100 characters'),
  
  body('linkedin')
    .optional()
    .trim()
    .isURL()
    .withMessage('LinkedIn must be a valid URL'),
  
  body('skills')
    .optional()
    .isArray()
    .withMessage('Skills must be an array'),
  
  body('skills.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each skill must be between 1 and 50 characters'),
  
  handleValidationErrors
];

// Event validation rules
const validateEventCreation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Event title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Event description is required')
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters'),
  
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .custom(value => {
      if (new Date(value) <= new Date()) {
        throw new Error('Event date must be in the future');
      }
      return true;
    }),
  
  body('time')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Please provide time in HH:MM format'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Event location is required')
    .isLength({ max: 200 })
    .withMessage('Location cannot exceed 200 characters'),
  
  body('maxAttendees')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('Maximum attendees must be between 1 and 1000'),
  
  body('category')
    .optional()
    .isIn(['networking', 'career', 'social', 'educational', 'sports', 'cultural', 'other'])
    .withMessage('Invalid event category'),
  
  body('isVirtual')
    .optional()
    .isBoolean()
    .withMessage('isVirtual must be a boolean'),
  
  body('virtualLink')
    .if(body('isVirtual').equals(true))
    .notEmpty()
    .withMessage('Virtual link is required for virtual events')
    .isURL()
    .withMessage('Virtual link must be a valid URL'),
  
  handleValidationErrors
];

// Chat message validation
const validateChatMessage = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Message content is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  
  body('messageType')
    .optional()
    .isIn(['text', 'image', 'file'])
    .withMessage('Invalid message type'),
  
  handleValidationErrors
];

// Mentorship request validation
const validateMentorshipRequest = [
  body('mentor')
    .notEmpty()
    .withMessage('Mentor ID is required')
    .isMongoId()
    .withMessage('Invalid mentor ID'),
  
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required')
    .isLength({ max: 200 })
    .withMessage('Subject cannot exceed 200 characters'),
  
  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ max: 1000 })
    .withMessage('Message cannot exceed 1000 characters'),
  
  body('mentorshipType')
    .isIn(['one-time', 'short-term', 'long-term'])
    .withMessage('Invalid mentorship type'),
  
  body('preferredMeetingType')
    .isIn(['video-call', 'phone-call', 'in-person', 'chat', 'email'])
    .withMessage('Invalid meeting type'),
  
  body('goals')
    .optional()
    .isArray()
    .withMessage('Goals must be an array'),
  
  body('timeline')
    .optional()
    .isIn(['1-week', '2-weeks', '1-month', '3-months', '6-months', 'flexible'])
    .withMessage('Invalid timeline'),
  
  handleValidationErrors
];

// Parameter validation
const validateObjectId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`Invalid ${paramName}`),
  
  handleValidationErrors
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

const validateSearch = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters'),
  
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateEventCreation,
  validateChatMessage,
  validateMentorshipRequest,
  validateObjectId,
  validatePagination,
  validateSearch
};
