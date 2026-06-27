const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

const User = require('../models/User');

dotenv.config();

// Generate JWT
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// @desc    Register a new user
// @route   POST /api/v1/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existinguser = await User.findOne({ email });
    if (existinguser) {
      return res.status(409).json({
        error: { code: 'DUPLICATE_EMAIL', email: 'Email already registered' },
      });
    }

    // Create user
    const user = await User.create({ fullName, email, password });

    // Generate token
    const token = generateToken(user);

    // Send response (exclude password)
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      message: 'User registerted successfully',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Check if user is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: { code: 'ACCOUNT_INACTIVE', message: 'Account is not active' },
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
      });
    }

    // Generate token
    const token = generateToken(user);

    // Send response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };
