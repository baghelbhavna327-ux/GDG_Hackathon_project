const express = require('express');
const { globalSearch } = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Optional authentication middleware for search so it detects user role if logged in
const optionalAuth = async (req, res, next) => {
  if (req.headers.authorization || (req.cookies && req.cookies.token)) {
    return protect(req, res, next);
  }
  req.user = { role: 'viewer' };
  next();
};

router.get('/', optionalAuth, globalSearch);

module.exports = router;
