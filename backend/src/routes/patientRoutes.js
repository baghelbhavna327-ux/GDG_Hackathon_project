const express = require('express');
const router = express.Router();
const {
  getFootfallSummary,
  getAllFootfall,
  getFootfallByPHC
} = require('../controllers/patientController');

// Aggregate footfall summary (today, weekly total, daily average, trend breakdown)
router.get('/footfall/summary', getFootfallSummary);

// Footfall history for a specific PHC
router.get('/footfall/phc/:phcId', getFootfallByPHC);

// All footfall records (supports ?phcId=&startDate=&endDate=)
router.get('/footfall', getAllFootfall);

module.exports = router;
