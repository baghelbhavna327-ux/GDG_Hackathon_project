const express = require('express');
const router = express.Router();
const {
  getStaffAttendanceSummary,
  getAllStaff,
  getStaffByPHC
} = require('../controllers/staffController');

// Staff attendance summary across all PHCs
router.get('/attendance', getStaffAttendanceSummary);

// Staff members for a specific PHC
router.get('/phc/:phcId', getStaffByPHC);

// All staff members (supports ?role=&status=&phcId=)
router.get('/', getAllStaff);

module.exports = router;
