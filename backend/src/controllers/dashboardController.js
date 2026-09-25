const { PHC, Bed, Staff, PatientFootfall, Inventory, Alert, ResourceTransfer } = require('../models');

/**
 * @desc    Get live aggregated summary metrics for HealthChain AI Dashboard
 * @route   GET /api/dashboard/summary
 * @access  Public
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const [
      totalPHCs,
      phcs,
      beds,
      staff,
      criticalAlertsCount,
      activeAlertsCount,
      activeTransfersCount,
      inventoryDocs
    ] = await Promise.all([
      PHC.countDocuments(),
      PHC.find({}).lean(),
      Bed.find({}).lean(),
      Staff.find({}).lean(),
      Alert.countDocuments({
        severity: { $in: ['CRITICAL', 'HIGH', 'WARNING'] },
        status: 'ACTIVE'
      }),
      Alert.countDocuments({ status: 'ACTIVE' }),
      ResourceTransfer.countDocuments({
        status: { $in: ['PENDING', 'RECOMMENDED', 'IN_TRANSIT', 'ACCEPTED', 'APPROVED'] }
      }),
      Inventory.find({}).lean()
    ]);

    // Critical PHCs count
    const criticalPHCs = phcs.filter(
      p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
    ).length;

    // Bed Calculations
    const totalBeds = beds.reduce((acc, b) => acc + (b.totalBeds || 0), 0) || phcs.reduce((acc, p) => acc + (p.totalBeds || 0), 0);
    const occupiedBeds = beds.reduce((acc, b) => acc + (b.occupiedBeds || 0), 0);
    const availableBeds = beds.reduce((acc, b) => acc + (b.availableBeds || 0), 0) || phcs.reduce((acc, p) => acc + (p.availableBeds || 0), 0);
    const bedOccupancyPct = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Staff Attendance
    const totalStaffCount = staff.length || phcs.reduce((acc, p) => acc + (p.staffCount || 0), 0);
    const activeStaffCount = staff.filter(s => s.status === 'ON_DUTY').length || phcs.reduce((acc, p) => acc + (p.activeStaff || 0), 0);
    const staffAttendancePct = totalStaffCount > 0 ? Math.round((activeStaffCount / totalStaffCount) * 100) : 85;

    // Low stock PHCs (unique PHC count where any stock <= 50)
    const lowStockPhcIds = new Set(
      inventoryDocs.filter(i => (i.currentStock || 0) <= (i.reorderLevel || 50)).map(i => String(i.phcId))
    );
    const lowStockPHCs = lowStockPhcIds.size;

    // Total inventory units
    const totalInventoryUnits = inventoryDocs.reduce((acc, i) => acc + (i.currentStock || 0), 0);

    // Participating States
    const participatingStates = Array.from(new Set(phcs.map(p => p.state))).sort();

    return res.status(200).json({
      success: true,
      data: {
        totalPHCs,
        criticalPHCs,
        lowStockPHCs,
        totalBeds,
        occupiedBeds,
        availableBeds,
        bedOccupancyPct,
        totalStaffCount,
        activeStaffCount,
        staffAttendancePct,
        criticalAlerts: criticalAlertsCount,
        activeAlerts: activeAlertsCount,
        activeTransfers: activeTransfersCount,
        totalInventoryUnits,
        participatingStatesCount: participatingStates.length,
        participatingStates,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary
};
