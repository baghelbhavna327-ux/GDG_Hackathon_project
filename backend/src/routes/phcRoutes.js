const express = require('express');
const router = express.Router();
const {
  getPHCStats,
  getAllPHCs,
  getCriticalPHCs,
  getPHCsByState,
  getPHCsByDistrict,
  getPHCById
} = require('../controllers/phcController');

// Aggregated dashboard statistics
router.get('/stats', getPHCStats);

// Critical PHCs (riskLevel: CRITICAL or HIGH)
router.get('/critical', getCriticalPHCs);

// Filter by state
router.get('/state/:state', getPHCsByState);

// Filter by district
router.get('/district/:district', getPHCsByDistrict);

// Get all PHCs (supports query params: ?state=...&district=...&riskLevel=...&search=...)
router.get('/', getAllPHCs);

// Get single PHC by ID
router.get('/:id', getPHCById);

module.exports = router;
