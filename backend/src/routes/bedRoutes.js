const express = require('express');
const router = express.Router();
const {
  getBedSummary,
  getAllBeds,
  getBedsByPHC
} = require('../controllers/bedController');

// Bed statistics summary across all PHCs
router.get('/summary', getBedSummary);

// Beds for a specific PHC
router.get('/phc/:phcId', getBedsByPHC);

// All bed records
router.get('/', getAllBeds);

module.exports = router;
