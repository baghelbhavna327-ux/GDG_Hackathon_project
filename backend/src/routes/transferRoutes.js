const express = require('express');
const router = express.Router();
const {
  getAllTransfers,
  getPendingTransfers,
  getHighPriorityTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus
} = require('../controllers/transferController');

// Pending redistribution recommendations
router.get('/pending', getPendingTransfers);

// High-priority redistribution recommendations
router.get('/high-priority', getHighPriorityTransfers);

// All transfers (supports ?priority=&status=&medicine=&search=)
router.get('/', getAllTransfers);

// Single transfer record by ID
router.get('/:id', getTransferById);

// Create new transfer
router.post('/', createTransfer);

// Update transfer status
router.put('/:id', updateTransferStatus);

module.exports = router;

