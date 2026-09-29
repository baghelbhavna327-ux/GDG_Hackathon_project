const express = require('express');
const router = express.Router();
const {
  getDiseaseEvents,
  getDiseaseEventsByRegion,
  createDiseaseEvent,
  predictDiseaseAdjustedDemand
} = require('../controllers/diseaseEventController');

// Active disease surveillance events
router.get('/', getDiseaseEvents);

// Disease events by region/district
router.get('/:region', getDiseaseEventsByRegion);

// Ingest disease event (Admin)
router.post('/', createDiseaseEvent);

// Predict disease-adjusted medicine demand
router.post('/predict', predictDiseaseAdjustedDemand);

module.exports = router;
