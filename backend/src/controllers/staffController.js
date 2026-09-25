const { Staff, PHC } = require('../models');

/**
 * @desc    Get staff attendance summary across all PHCs
 * @route   GET /api/staff/attendance
 * @access  Public
 */
const getStaffAttendanceSummary = async (req, res, next) => {
  try {
    const staffList = await Staff.find({}).populate('phcId', 'name district state riskLevel');

    const totalStaff = staffList.length;
    const activeStaff = staffList.filter(s => s.attendanceStatus === 'PRESENT').length;
    const onLeaveStaff = staffList.filter(s => s.attendanceStatus === 'ON_LEAVE' || s.attendanceStatus === 'ABSENT').length;
    const attendancePercentage = totalStaff > 0 ? Math.round((activeStaff / totalStaff) * 100) : 0;

    // By Role breakdown
    const roleStats = {};
    staffList.forEach(s => {
      if (!roleStats[s.role]) {
        roleStats[s.role] = { total: 0, active: 0 };
      }
      roleStats[s.role].total++;
      if (s.attendanceStatus === 'PRESENT') {
        roleStats[s.role].active++;
      }
    });

    const roleBreakdown = Object.keys(roleStats).map(role => ({
      role,
      total: roleStats[role].total,
      active: roleStats[role].active,
      attendancePercentage: Math.round((roleStats[role].active / roleStats[role].total) * 100)
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalStaff,
        activeStaff,
        onLeaveStaff,
        attendancePercentage,
        roleBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all staff records
 * @route   GET /api/staff
 * @access  Public
 */
const getAllStaff = async (req, res, next) => {
  try {
    const { role, status, phcId } = req.query;
    const filter = {};

    if (role && role !== 'All Roles') {
      filter.role = new RegExp(role.trim(), 'i');
    }

    if (status && status !== 'All Statuses') {
      filter.attendanceStatus = status.toUpperCase().trim();
    }

    if (phcId) {
      filter.phcId = phcId;
    }

    const staffList = await Staff.find(filter)
      .populate('phcId', 'name district state riskLevel')
      .sort({ name: 1 })
      .lean();

    const formatted = staffList
      .filter(s => s.phcId)
      .map(s => ({
        _id: s._id,
        name: s.name,
        role: s.role,
        phcId: s.phcId._id,
        phcName: s.phcId.name,
        district: s.phcId.district,
        state: s.phcId.state,
        attendanceStatus: s.attendanceStatus,
        attendancePercentage: s.attendancePercentage,
        date: s.date,
        createdAt: s.createdAt
      }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get staff members for a specific PHC
 * @route   GET /api/staff/phc/:phcId
 * @access  Public
 */
const getStaffByPHC = async (req, res, next) => {
  try {
    const { phcId } = req.params;
    const staffList = await Staff.find({ phcId })
      .populate('phcId', 'name district state riskLevel')
      .lean();

    const formatted = staffList.map(s => ({
      _id: s._id,
      name: s.name,
      role: s.role,
      phcId: s.phcId?._id || phcId,
      phcName: s.phcId?.name || 'Unknown PHC',
      district: s.phcId?.district || 'Unknown District',
      state: s.phcId?.state || 'Unknown State',
      attendanceStatus: s.attendanceStatus,
      attendancePercentage: s.attendancePercentage,
      date: s.date
    }));

    return res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid PHC ID format: ${req.params.phcId}`
      });
    }
    next(error);
  }
};

module.exports = {
  getStaffAttendanceSummary,
  getAllStaff,
  getStaffByPHC
};
