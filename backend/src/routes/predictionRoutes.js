const express = require('express');
const router = express.Router();
const {
  getAllPredictions,
  getHighRiskPredictions,
  getPredictionsByPHC,
  getPredictionById,
  createPrediction
} = require('../controllers/predictionController');

// High-risk & critical stock-out predictions
router.get('/high-risk', getHighRiskPredictions);

// Predictions for a specific PHC
router.get('/phc/:phcId', getPredictionsByPHC);

// All predictions (supports ?risk=&forecastDays=&medicine=&phcId=&search=)
router.get('/', getAllPredictions);

// Single prediction record by ID
router.get('/:id', getPredictionById);

// Ingest prediction data (FastAPI AI integration placeholder)
router.post('/', createPrediction);

module.exports = router;
