const express = require('express');
const router = express.Router();
const {
  getAllAlerts,
  getCriticalAlerts,
  getRecentAlerts,
  getAlertsByPHC,
  getAlertById,
  createAlert,
  updateAlert
} = require('../controllers/alertController');

// Critical alerts
router.get('/critical', getCriticalAlerts);

// Recent alerts (newest first)
router.get('/recent', getRecentAlerts);

// Alerts for a specific PHC
router.get('/phc/:phcId', getAlertsByPHC);

// Single alert by ID
router.get('/:id', getAlertById);

// All alerts (supports ?severity=&risk=&type=&status=&search=)
router.get('/', getAllAlerts);

// Create new alert
router.post('/', createAlert);

// Update alert by ID
router.put('/:id', updateAlert);

module.exports = router;

