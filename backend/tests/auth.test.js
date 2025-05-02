const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { register, login, forgotPassword, resetPassword } = require('../controllers/authController');

// Mock dependencies
jest.mock('../utils/sendEmail', () => jest.fn());
jest.mock('jsonwebtoken');

// Mock request and response objects
const mockRequest = () => {
  const req = {};
  req.body = jest.fn().mockReturnValue(req);
  req.params = {};
  req.protocol = 'http';
  req.get = jest.fn().mockReturnValue('localhost');
  return req;
};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  describe('Register', () => {
    it('should register a new user and return a token', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return null (user doesn't exist)
      User.findOne = jest.fn().mockResolvedValue(null);

      // Mock User.create to return a new user
      const mockUser = {
        _id: 'mockid123',
        username: 'testuser',
        email: 'test@example.com',
        password: undefined
      };
      User.create = jest.fn().mockResolvedValue(mockUser);

      // Mock jwt.sign to return a token
      jwt.sign = jest.fn().mockReturnValue('mocktoken123');

      // Execute
      await register(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        $or: [{ email: 'test@example.com' }, { username: 'testuser' }]
      });
      expect(User.create).toHaveBeenCalledWith({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'mockid123' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mocktoken123',
        user: mockUser
      });
    });

    it('should return 400 if email is already in use', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        username: 'testuser',
        email: 'existing@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return an existing user
      User.findOne = jest.fn().mockResolvedValue({
        email: 'existing@example.com',
        username: 'existinguser'
      });

      // Execute
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already in use'
      });
    });

    it('should return 400 if username is already taken', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        username: 'existinguser',
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return an existing user
      User.findOne = jest.fn().mockResolvedValue({
        email: 'existing@example.com',
        username: 'existinguser'
      });

      // Execute
      await register(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Username already taken'
      });
    });
  });

  describe('Login', () => {
    it('should login a user and return a token', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        email: 'test@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return a user
      const mockUser = {
        _id: 'mockid123',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(true),
        password: undefined
      };
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Mock jwt.sign to return a token
      jwt.sign = jest.fn().mockReturnValue('mocktoken123');

      // Execute
      await login(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.matchPassword).toHaveBeenCalledWith('password123');
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: 'mockid123' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        token: 'mocktoken123',
        user: mockUser
      });
    });

    it('should return 401 if user does not exist', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      // Mock User.findOne to return null
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(null)
      });

      // Execute
      await login(req, res);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });

    it('should return 401 if password is incorrect', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Mock User.findOne to return a user
      const mockUser = {
        _id: 'mockid123',
        email: 'test@example.com',
        matchPassword: jest.fn().mockResolvedValue(false)
      };
      User.findOne = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser)
      });

      // Execute
      await login(req, res);

      // Assert
      expect(mockUser.matchPassword).toHaveBeenCalledWith('wrongpassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid credentials'
      });
    });
  });

  describe('Forgot Password', () => {
    it('should generate a reset token and send email', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        email: 'test@example.com'
      };

      // Mock User.findOne to return a user
      const mockUser = {
        email: 'test@example.com',
        getResetPasswordToken: jest.fn().mockReturnValue('resettoken123'),
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Mock sendEmail
      const sendEmail = require('../utils/sendEmail');
      sendEmail.mockResolvedValue(true);

      // Execute
      await forgotPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
      expect(mockUser.getResetPasswordToken).toHaveBeenCalled();
      expect(mockUser.save).toHaveBeenCalledWith({ validateBeforeSave: false });
      expect(sendEmail).toHaveBeenCalledWith({
        email: 'test@example.com',
        subject: 'Password reset token',
        message: expect.stringContaining('You are receiving this email because you')
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset email sent if account exists'
      });
    });

    it('should return success even if email does not exist', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.body = {
        email: 'nonexistent@example.com'
      };

      // Mock User.findOne to return null
      User.findOne = jest.fn().mockResolvedValue(null);

      // Execute
      await forgotPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password reset email sent if account exists'
      });
    });
  });

  describe('Reset Password', () => {
    it('should reset password with valid token', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.params.token = 'validtoken123';
      req.body = {
        password: 'newpassword123'
      };

      // Mock crypto.createHash
      const crypto = require('crypto');
      const mockHashedToken = 'hashedtoken123';
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockHashedToken)
      });

      // Mock User.findOne to return a user
      const mockUser = {
        resetPasswordToken: mockHashedToken,
        resetPasswordExpire: Date.now() + 3600000, // 1 hour in the future
        password: '',
        save: jest.fn().mockResolvedValue(true)
      };
      User.findOne = jest.fn().mockResolvedValue(mockUser);

      // Execute
      await resetPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: mockHashedToken,
        resetPasswordExpire: { $gt: expect.any(Number) }
      });
      expect(mockUser.password).toBe('newpassword123');
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpire).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password updated successfully'
      });
    });

    it('should return 400 for invalid or expired token', async () => {
      // Setup
      const req = mockRequest();
      const res = mockResponse();
      req.params.token = 'invalidtoken123';
      req.body = {
        password: 'newpassword123'
      };

      // Mock crypto.createHash
      const crypto = require('crypto');
      const mockHashedToken = 'hashedtoken123';
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(mockHashedToken)
      });

      // Mock User.findOne to return null (token invalid or expired)
      User.findOne = jest.fn().mockResolvedValue(null);

      // Execute
      await resetPassword(req, res);

      // Assert
      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: mockHashedToken,
        resetPasswordExpire: { $gt: expect.any(Number) }
      });
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid or expired token'
      });
    });
  });
});