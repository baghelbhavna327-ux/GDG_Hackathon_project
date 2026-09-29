const express = require('express');
const router = express.Router();
const { getDashboardSummary } = require('../controllers/dashboardController');

// Live dashboard summary
router.get('/', getDashboardSummary);
router.get('/summary', getDashboardSummary);
router.get('/stats', getDashboardSummary);

module.exports = router;
