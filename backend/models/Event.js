const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please enter time in HH:MM format']
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered'
    }
  }],
  maxAttendees: {
    type: Number,
    min: [1, 'Maximum attendees must be at least 1'],
    max: [1000, 'Maximum attendees cannot exceed 1000']
  },
  category: {
    type: String,
    enum: ['networking', 'career', 'social', 'educational', 'sports', 'cultural', 'other'],
    default: 'networking'
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  image: {
    type: String,
    default: ''
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: {
    type: String,
    trim: true,
    validate: {
      validator: function(value) {
        if (this.isVirtual && !value) return false;
        if (value && !/^https?:\/\/.*/.test(value)) return false;
        return true;
      },
      message: 'Virtual link is required for virtual events and must be a valid URL'
    }
  },
  registrationDeadline: {
    type: Date,
    validate: {
      validator: function(value) {
        if (value) return value < this.date;
        return true;
      },
      message: 'Registration deadline must be before event date'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'published'
  },
  comments: [commentSchema],
  isPublic: {
    type: Boolean,
    default: true
  },
  requiresApproval: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
eventSchema.index({ date: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ tags: 1 });
eventSchema.index({ status: 1 });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees.filter(attendee => attendee.status === 'registered').length;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.maxAttendees) return null;
  return this.maxAttendees - this.attendeeCount;
});

// Virtual for is full
eventSchema.virtual('isFull').get(function() {
  if (!this.maxAttendees) return false;
  return this.attendeeCount >= this.maxAttendees;
});

// Check if user is attending
eventSchema.methods.isUserAttending = function(userId) {
  return this.attendees.some(attendee => 
    attendee.user.toString() === userId.toString() && 
    attendee.status === 'registered'
  );
};

// Add attendee
eventSchema.methods.addAttendee = function(userId) {
  if (this.isUserAttending(userId)) {
    throw new Error('User is already registered for this event');
  }
  
  if (this.isFull) {
    throw new Error('Event is full');
  }
  
  this.attendees.push({ user: userId });
  return this.save();
};

// Remove attendee
eventSchema.methods.removeAttendee = function(userId) {
  this.attendees = this.attendees.filter(attendee => 
    attendee.user.toString() !== userId.toString()
  );
  return this.save();
};

// Add comment
eventSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);
