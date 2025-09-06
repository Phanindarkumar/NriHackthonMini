const mongoose = require('mongoose');

const mentorshipRequestSchema = new mongoose.Schema({
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined', 'completed', 'cancelled'],
    default: 'pending'
  },
  mentorshipType: {
    type: String,
    enum: ['one-time', 'short-term', 'long-term'],
    required: true
  },
  preferredMeetingType: {
    type: String,
    enum: ['video-call', 'phone-call', 'in-person', 'chat', 'email'],
    required: true
  },
  goals: [{
    type: String,
    trim: true,
    maxlength: [200, 'Goal cannot exceed 200 characters']
  }],
  timeline: {
    type: String,
    enum: ['1-week', '2-weeks', '1-month', '3-months', '6-months', 'flexible'],
    default: 'flexible'
  },
  expertise: [{
    type: String,
    trim: true
  }],
  responseMessage: {
    type: String,
    trim: true,
    maxlength: [500, 'Response message cannot exceed 500 characters']
  },
  respondedAt: Date,
  scheduledMeetings: [{
    date: Date,
    duration: Number, // in minutes
    meetingLink: String,
    notes: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    }
  }],
  feedback: {
    menteeRating: {
      type: Number,
      min: 1,
      max: 5
    },
    mentorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    menteeReview: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    },
    mentorReview: {
      type: String,
      maxlength: [500, 'Review cannot exceed 500 characters']
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
mentorshipRequestSchema.index({ mentee: 1 });
mentorshipRequestSchema.index({ mentor: 1 });
mentorshipRequestSchema.index({ status: 1 });
mentorshipRequestSchema.index({ createdAt: -1 });

// Method to accept request
mentorshipRequestSchema.methods.accept = function(responseMessage) {
  this.status = 'accepted';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  return this.save();
};

// Method to decline request
mentorshipRequestSchema.methods.decline = function(responseMessage) {
  this.status = 'declined';
  this.responseMessage = responseMessage;
  this.respondedAt = new Date();
  return this.save();
};

// Method to schedule meeting
mentorshipRequestSchema.methods.scheduleMeeting = function(meetingData) {
  this.scheduledMeetings.push(meetingData);
  return this.save();
};

// Method to complete mentorship
mentorshipRequestSchema.methods.complete = function() {
  this.status = 'completed';
  return this.save();
};

// Method to add feedback
mentorshipRequestSchema.methods.addFeedback = function(feedbackData, userType) {
  if (userType === 'mentee') {
    this.feedback.menteeRating = feedbackData.rating;
    this.feedback.menteeReview = feedbackData.review;
  } else if (userType === 'mentor') {
    this.feedback.mentorRating = feedbackData.rating;
    this.feedback.mentorReview = feedbackData.review;
  }
  return this.save();
};

module.exports = mongoose.model('MentorshipRequest', mentorshipRequestSchema);
