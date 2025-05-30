const User = require('../models/User');
const Nonce = require('../models/Nonce');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// Email service for password reset
const sendEmail = require('../utils/sendEmail');

// Wallet utilities
const {
  verifyEvmSignature,
  verifySolanaSignature,
  generateNonce,
  createAuthMessage,
  normalizeWalletAddress
} = require('../utils/walletUtils');

// Google OAuth utilities
const {
  generateAuthUrl,
  exchangeCodeForTokens,
  verifyGoogleToken,
  isGoogleOAuthConfigured
} = require('../utils/googleUtils');

// Helper function to create and send JWT token
const sendToken = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    // Create token and send response
    sendToken(user, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password'
      });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Create token and send response
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Always return success regardless of whether email exists (security)
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // If user doesn't exist, still return success (security)
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Password reset email sent if account exists'
      });
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();

    // Save the updated user with reset token
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password reset token',
        message
      });

      res.status(200).json({
        success: true,
        message: 'Password reset email sent if account exists'
      });
    } catch (err) {
      // If email fails, clear reset fields and return error
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return res.status(500).json({
        success: false,
        message: 'Email could not be sent'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // Find user by reset token and check if token is expired
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // Save user with new password
    await user.save();

    // Return success message (user will need to login again)
    res.status(200).json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get nonce for wallet authentication
// @route   POST /api/auth/wallet/nonce
// @access  Public
exports.getNonce = async (req, res, next) => {
  try {
    const { walletAddress, walletType } = req.body;

    // Validate input
    if (!walletAddress || !walletType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wallet address and wallet type'
      });
    }

    if (!['evm', 'solana'].includes(walletType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet type. Must be "evm" or "solana"'
      });
    }

    // Normalize wallet address
    const normalizedAddress = normalizeWalletAddress(walletAddress, walletType);

    // Generate new nonce
    const nonce = generateNonce();

    // Save nonce to database (this will automatically expire old ones)
    await Nonce.create({
      walletAddress: normalizedAddress,
      nonce
    });

    // Create message to be signed
    const message = createAuthMessage(nonce);

    res.status(200).json({
      success: true,
      data: {
        nonce,
        message
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Authenticate with wallet signature
// @route   POST /api/auth/wallet
// @access  Public
exports.walletLogin = async (req, res, next) => {
  try {
    const { walletAddress, signature, message, walletType } = req.body;

    // Validate input
    if (!walletAddress || !signature || !message || !walletType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide wallet address, signature, message, and wallet type'
      });
    }

    if (!['evm', 'solana'].includes(walletType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid wallet type. Must be "evm" or "solana"'
      });
    }

    // Normalize wallet address
    const normalizedAddress = normalizeWalletAddress(walletAddress, walletType);

    // Extract nonce from message
    const nonceMatch = message.match(/Nonce: ([a-f0-9]+)/);
    if (!nonceMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid message format'
      });
    }
    const nonce = nonceMatch[1];

    // Verify nonce exists and hasn't been used
    const nonceDoc = await Nonce.findOne({
      walletAddress: normalizedAddress,
      nonce,
      used: false
    });

    if (!nonceDoc) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired nonce'
      });
    }

    // Verify signature based on wallet type
    let isValidSignature = false;

    if (walletType === 'evm') {
      isValidSignature = verifyEvmSignature(message, signature, normalizedAddress);
    } else if (walletType === 'solana') {
      isValidSignature = verifySolanaSignature(message, signature, walletAddress);
    }

    if (!isValidSignature) {
      return res.status(401).json({
        success: false,
        message: 'Invalid signature'
      });
    }

    // Mark nonce as used
    nonceDoc.used = true;
    await nonceDoc.save();

    // Find or create user
    let user = await User.findOne({ walletAddress: normalizedAddress });

    if (!user) {
      // Create new user with wallet
      user = await User.create({
        walletAddress: normalizedAddress,
        walletType,
        walletAuthenticated: true
      });
    } else {
      // Update existing user
      user.walletAuthenticated = true;
      await user.save();
    }

    // Create token and send response
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Authenticate with Google OAuth
// @route   POST /api/auth/google
// @access  Public
exports.googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    // Validate input
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Please provide Google ID token'
      });
    }

    // Check if Google OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured'
      });
    }

    // Verify Google token and extract user info
    let googleUserInfo;
    try {
      googleUserInfo = await verifyGoogleToken(token);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired Google token'
      });
    }

    const { googleId, email, name } = googleUserInfo;

    // Find or create user
    let user = await User.findOne({ googleId });

    if (!user) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.googleAuthenticated = true;
        user = await existingUser.save();
      } else {
        // Create new user
        user = await User.create({
          googleId,
          email,
          username: name ? name.replace(/\s+/g, '').toLowerCase() : `user_${googleId.slice(-8)}`,
          googleAuthenticated: true
        });
      }
    } else {
      // Update existing Google user
      user.googleAuthenticated = true;
      await user.save();
    }

    // Create token and send response
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get Google OAuth authorization URL
// @route   GET /api/auth/google/url
// @access  Public
exports.getGoogleAuthUrl = async (req, res, next) => {
  try {
    // Check if Google OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured'
      });
    }

    const authUrl = generateAuthUrl();

    res.status(200).json({
      success: true,
      data: {
        authUrl
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Handle Google OAuth callback
// @route   POST /api/auth/google/callback
// @access  Public
exports.googleCallback = async (req, res, next) => {
  try {
    const { code } = req.body;

    // Validate input
    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide authorization code'
      });
    }

    // Check if Google OAuth is configured
    if (!isGoogleOAuthConfigured()) {
      return res.status(500).json({
        success: false,
        message: 'Google OAuth is not configured'
      });
    }

    let result;
    try {
      result = await exchangeCodeForTokens(code);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired authorization code'
      });
    }

    const { userInfo } = result;
    const { googleId, email, name } = userInfo;

    // Find or create user (same logic as googleLogin)
    let user = await User.findOne({ googleId });

    if (!user) {
      const existingUser = await User.findOne({ email });

      if (existingUser) {
        // Link Google account to existing user
        existingUser.googleId = googleId;
        existingUser.googleAuthenticated = true;
        user = await existingUser.save();
      } else {
        // Create new user
        user = await User.create({
          googleId,
          email,
          username: name ? name.replace(/\s+/g, '').toLowerCase() : `user_${googleId.slice(-8)}`,
          googleAuthenticated: true
        });
      }
    } else {
      // Update existing Google user
      user.googleAuthenticated = true;
      await user.save();
    }

    // Create token and send response
    sendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};