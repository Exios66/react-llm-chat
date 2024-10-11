import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import config from 'config';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  },
  avatar: {
    type: String,
    default: 'default-avatar.png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    },
    notifications: {
      type: Boolean,
      default: true
    },
    language: {
      type: String,
      default: 'en'
    }
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(config.get('security.bcryptSaltRounds'));
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
UserSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { 
      id: this._id, 
      role: this.role,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
      preferences: this.preferences
    },
    config.get('jwt.secret'),
    { expiresIn: config.get('jwt.expiresIn') }
  );
};

// Method to get user's public profile
UserSchema.methods.getPublicProfile = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    avatar: this.avatar,
    role: this.role,
    createdAt: this.createdAt,
    lastLogin: this.lastLogin,
    preferences: this.preferences
  };
};

// Static method to find user by email or username
UserSchema.statics.findByCredentials = async function(login) {
  const user = await this.findOne({
    $or: [{ email: login }, { username: login }]
  });
  return user;
};

const User = mongoose.model('User', UserSchema);

export default User;

