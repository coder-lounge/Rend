const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: function () {
      // Username required only if no wallet and no Google auth
      return !this.walletAddress && !this.googleId;
    },
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  email: {
    type: String,
    required: function () {
      return !this.walletAddress && !this.googleId;
    },
    unique: true,
    sparse: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ],
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return !this.walletAddress && !this.googleId;
    },
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  walletAddress: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  walletType: {
    type: String,
    enum: ['evm', 'solana'],
    required: function () {
      return !!this.walletAddress;
    }
  },
  walletAuthenticated: {
    type: Boolean,
    default: false
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  googleAuthenticated: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['creator', 'reviewer'],
    required: true
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving to database
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // Generate salt
    const salt = await bcrypt.genSalt(10);
    // Hash password with salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  // Set expire time (1 hour)
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);