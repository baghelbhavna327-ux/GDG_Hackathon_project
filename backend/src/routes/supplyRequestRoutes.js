const express = require('express');
const router = express.Router();
const {
  createSupplyRequest,
  getMySupplyRequests,
  getAllSupplyRequests,
  getSupplyRequestById,
  approveSupplyRequest,
  rejectSupplyRequest,
  fulfillSupplyRequest
} = require('../controllers/supplyRequestController');
const { protect, authorize } = require('../middleware/auth');

// 1. Create a supply request (Clinician, Admin)
router.post('/', protect, authorize('admin', 'health_worker'), createSupplyRequest);

// 2. Get clinician's own supply requests
router.get('/my', protect, authorize('admin', 'health_worker'), getMySupplyRequests);

// 3. Get all supply requests (Admin only)
router.get('/', protect, authorize('admin'), getAllSupplyRequests);

// 4. Get specific supply request detail
router.get('/:id', protect, getSupplyRequestById);

// 5. Admin Approve request
router.patch('/:id/approve', protect, authorize('admin'), approveSupplyRequest);

// 6. Admin Reject request
router.patch('/:id/reject', protect, authorize('admin'), rejectSupplyRequest);

// 7. Admin Fulfill request
router.patch('/:id/fulfill', protect, authorize('admin'), fulfillSupplyRequest);

module.exports = router;
