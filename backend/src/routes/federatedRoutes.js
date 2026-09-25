const express = require('express');
const router = express.Router();
const {
  getFederatedStatus,
  getFederatedMetadata
} = require('../controllers/federatedController');

// Federated status summary
router.get('/status', getFederatedStatus);

// Federated full training metadata and state metrics
router.get('/metadata', getFederatedMetadata);

module.exports = router;
