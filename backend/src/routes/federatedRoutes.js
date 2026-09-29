const express = require('express');
const router = express.Router();
const {
  getFederatedStatus,
  getFederatedMetadata,
  predictFederated
} = require('../controllers/federatedController');

// Federated status summary
router.get('/status', getFederatedStatus);

// Federated full training metadata and state metrics
router.get('/metadata', getFederatedMetadata);

// Federated global model prediction inference
router.post('/predict', predictFederated);

module.exports = router;
