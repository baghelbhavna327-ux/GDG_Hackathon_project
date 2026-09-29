const express = require('express');
const router = express.Router();
const {
  getPHCStats,
  getAllPHCs,
  getCriticalPHCs,
  getPHCsByState,
  getPHCsByDistrict,
  getPHCById,
  createPHC,
  updatePHC,
  deletePHC
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

// Create a new PHC facility
router.post('/', createPHC);

// Get single PHC by ID
router.get('/:id', getPHCById);

// Update single PHC by ID
router.put('/:id', updatePHC);

// Delete single PHC by ID
router.delete('/:id', deletePHC);

module.exports = router;
