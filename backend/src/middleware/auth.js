const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Middleware to protect routes and verify JWT token
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 2. Check cookies
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this resource. Please log in.'
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'healthchain_jwt_secret_dev_key_2026_secure';
    const decoded = jwt.verify(token, secret);

    // Find user in database
    const currentUser = await User.findById(decoded.id).select('-password');
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        error: 'The user belonging to this token no longer exists.'
      });
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid authentication token. Please log in again.'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Your session has expired. Please log in again.'
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Authentication error: ' + error.message
    });
  }
};

/**
 * Middleware to restrict route access by role
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role '${req.user?.role || 'unknown'}' is not authorized to access this route.`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
