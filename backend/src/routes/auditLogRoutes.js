const express = require('express');
const { getAuditLogs } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Admin only route for viewing audit trails
router.get('/', protect, authorize('admin'), getAuditLogs);

module.exports = router;
