const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  batch: {
    type: String,
    required: [true, 'Graduation year is required'],
    trim: true
  },
  role: {
    type: String,
    required: [true, 'Current role is required'],
    trim: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  skills: [{
    type: String,
    trim: true
  }],
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters'],
    default: ''
  },
  avatar: {
    type: String,
    default: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  linkedin: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL']
  },
  github: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
  },
  website: {
    type: String,
    trim: true,
    match: [/^https?:\/\/.*/, 'Please enter a valid website URL']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    profileVisibility: {
      type: String,
      enum: ['public', 'alumni-only', 'private'],
      default: 'alumni-only'
    },
    mentorshipAvailable: {
      type: Boolean,
      default: false
    }
  },
  mentorshipProfile: {
    expertise: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      maxlength: [1000, 'Experience description cannot exceed 1000 characters']
    },
    availability: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ batch: 1 });
userSchema.index({ skills: 1 });
userSchema.index({ company: 1 });
userSchema.index({ 'preferences.mentorshipAvailable': 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Get public profile (without sensitive data)
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

// Update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
