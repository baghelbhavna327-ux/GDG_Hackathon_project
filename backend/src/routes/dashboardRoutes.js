const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');

// Live dashboard summary
router.get('/summary', getDashboardSummary);

module.exports = router;
