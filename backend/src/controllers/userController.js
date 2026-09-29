const { User, AuditLog } = require('../models');

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: {
        users
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve users: ' + error.message
    });
  }
};

/**
 * @desc    Update user role & clearances (Admin only)
 * @route   PATCH /api/users/:id/role
 * @access  Private/Admin
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, department, facility } = req.body;

    if (role && !['admin', 'health_worker', 'viewer'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid role. Must be admin, health_worker, or viewer.'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    const previousRole = targetUser.role;
    if (role) targetUser.role = role;
    if (department) targetUser.department = department.trim();
    if (facility) targetUser.facility = facility.trim();

    await targetUser.save();

    // Create Audit Log
    await AuditLog.create({
      action: 'ROLE_UPDATE',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByEmail: req.user.email,
      performedByRole: req.user.role,
      targetResource: 'User',
      resourceId: targetUser._id.toString(),
      details: `Updated role for ${targetUser.email} from ${previousRole} to ${targetUser.role}`,
      severity: 'WARNING'
    });

    res.status(200).json({
      success: true,
      message: `User ${targetUser.name} role updated to ${targetUser.role}`,
      data: {
        user: {
          id: targetUser._id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          department: targetUser.department,
          facility: targetUser.facility,
          dutyStatus: targetUser.dutyStatus,
          createdAt: targetUser.createdAt
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update user role: ' + error.message
    });
  }
};

/**
 * @desc    Delete / Deactivate user (Admin only)
 * @route   DELETE /api/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user._id.toString() === id) {
      return res.status(400).json({
        success: false,
        error: 'Administrator cannot delete their own active account.'
      });
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: 'User not found.'
      });
    }

    await User.findByIdAndDelete(id);

    // Create Audit Log
    await AuditLog.create({
      action: 'USER_DELETION',
      performedBy: req.user._id,
      performedByName: req.user.name,
      performedByEmail: req.user.email,
      performedByRole: req.user.role,
      targetResource: 'User',
      resourceId: id,
      details: `Deleted user account ${targetUser.name} (${targetUser.email})`,
      severity: 'CRITICAL'
    });

    res.status(200).json({
      success: true,
      message: `User ${targetUser.name} successfully deleted.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete user: ' + error.message
    });
  }
};

/**
 * @desc    Get audit logs (Admin only)
 * @route   GET /api/audit-logs
 * @access  Private/Admin
 */
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: {
        logs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve audit logs: ' + error.message
    });
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAuditLogs
};
