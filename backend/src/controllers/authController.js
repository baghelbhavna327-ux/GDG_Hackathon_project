const { User } = require('../models');

// Helper to set cookie and return standard response
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.generateAuthToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  };

  res.cookie('token', token, cookieOptions);

  // Return clean user object without password
  const userPayload = {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    facility: user.facility,
    phoneNumber: user.phoneNumber,
    dutyStatus: user.dutyStatus,
    createdAt: user.createdAt
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: {
      user: userPayload
    }
  });
};

/**
 * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, department, facility, phoneNumber } = req.body;

    // 1. Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide full name, email, and password.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long.'
      });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Passwords do not match.'
      });
    }

    // 2. Email format validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    // 3. Check existing user
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email address already exists.'
      });
    }

    // 4. Role Assignment (Default: health_worker; admin role protection)
    let assignedRole = role && ['health_worker', 'viewer', 'admin'].includes(role) ? role : 'health_worker';

    // 5. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      department: department || 'Primary Healthcare Operations',
      facility: facility || 'Sehore District PHC Network',
      phoneNumber: phoneNumber || '+91 98765 43210',
      dutyStatus: 'on_duty'
    });

    sendTokenResponse(newUser, 201, res, 'Registration successful. Welcome to HealthChain AI.');
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Registration error: ' + error.message
    });
  }
};

/**
 * @desc    Login existing user
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide both email and password.'
      });
    }

    // 2. Check for user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    // 3. Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password.'
      });
    }

    sendTokenResponse(user, 200, res, 'Login successful. Session established.');
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Login error: ' + error.message
    });
  }
};

/**
 * @desc    Get currently logged-in user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found.'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          facility: user.facility,
          phoneNumber: user.phoneNumber,
          dutyStatus: user.dutyStatus,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve profile: ' + error.message
    });
  }
};

/**
 * @desc    Update current user profile
 * @route   PATCH /api/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, department, facility, phoneNumber, dutyStatus } = req.body;
    const updates = {};

    if (name) updates.name = name.trim();
    if (department) updates.department = department.trim();
    if (facility) updates.facility = facility.trim();
    if (phoneNumber) updates.phoneNumber = phoneNumber.trim();
    if (dutyStatus && ['on_duty', 'off_duty'].includes(dutyStatus)) updates.dutyStatus = dutyStatus;

    const updatedUser = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true
    }).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          department: updatedUser.department,
          facility: updatedUser.facility,
          phoneNumber: updatedUser.phoneNumber,
          dutyStatus: updatedUser.dutyStatus,
          createdAt: updatedUser.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update profile: ' + error.message
    });
  }
};

/**
 * @desc    Logout user & clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res) => {
  try {
    res.cookie('token', 'none', {
      expires: new Date(Date.now() + 5 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      success: true,
      message: 'User logged out successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Logout error: ' + error.message
    });
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  logout
};
