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
const { protect, authorize } = require('../middleware/auth');

// Pending redistribution recommendations
router.get('/pending', getPendingTransfers);

// High-priority redistribution recommendations
router.get('/high-priority', getHighPriorityTransfers);

// All transfers (supports ?priority=&status=&medicine=&search=)
router.get('/', getAllTransfers);

// Single transfer record by ID
router.get('/:id', getTransferById);

// Create new transfer (Admin and Clinician/Health Worker only)
router.post('/', protect, authorize('admin', 'health_worker'), createTransfer);

// Update transfer status (Admin and Clinician/Health Worker only)
router.put('/:id', protect, authorize('admin', 'health_worker'), updateTransferStatus);

module.exports = router;
