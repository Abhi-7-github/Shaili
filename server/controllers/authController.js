const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

// Helper to ensure DB is connected before handling auth requests
const ensureDbConnection = async () => {
  // 1. If already connected
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  // 2. If currently connecting, wait up to 10 seconds for readyState === 1
  if (mongoose.connection.readyState === 2) {
    console.log('Mongoose is currently connecting... waiting for connection to establish.');
    for (let i = 0; i < 20; i++) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      if (mongoose.connection.readyState === 1) {
        return true;
      }
      if (mongoose.connection.readyState === 0) {
        break; // connection failed
      }
    }
  }

  // 3. If disconnected (0), trigger connectDB()
  console.log('🔄 Triggering database connection setup...');
  await connectDB();
  return mongoose.connection.readyState === 1;
};

const DB_ERROR_MESSAGE =
  'MongoDB connection is establishing or unavailable. If using MongoDB Atlas, please ensure your IP address is whitelisted (0.0.0.0/0) in MongoDB Atlas under Network Access.';

// Helper to generate JWT token using environment variables
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is missing');
  }
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register (or /signup)
// @access  Public
const registerUser = async (req, res) => {
  try {
    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return res.status(503).json({
        success: false,
        message: DB_ERROR_MESSAGE,
      });
    }

    const { name, email, password, gender } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email address',
      });
    }

    const userGender = (gender || 'women').toLowerCase();

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      gender: userGender,
    });

    if (user) {
      const token = generateToken(user._id);
      return res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          gender: user.gender,
          createdAt: user.createdAt,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid user data received',
      });
    }
  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
};

// @desc    Authenticate a user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return res.status(503).json({
        success: false,
        message: DB_ERROR_MESSAGE,
      });
    }

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user email (explicitly selecting password)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check password match
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender || 'women',
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const dbConnected = await ensureDbConnection();
    if (!dbConnected) {
      return res.status(503).json({
        success: false,
        message: DB_ERROR_MESSAGE,
      });
    }

    const user = await User.findById(req.user._id);
    return res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        gender: user.gender || 'women',
        createdAt: user.createdAt,
      },
    });

  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user profile',
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
};
