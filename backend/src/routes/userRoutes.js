const express = require('express');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAuditLogs
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here require authentication and 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
