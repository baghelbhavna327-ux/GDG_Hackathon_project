const { PHC, Bed, Staff, PatientFootfall, Inventory } = require('../models');

/**
 * @desc    Get aggregated PHC statistics for national dashboard
 * @route   GET /api/phcs/stats
 * @access  Public
 */
const getPHCStats = async (req, res, next) => {
  try {
    const phcs = await PHC.find({});
    const totalPHCs = phcs.length;

    if (totalPHCs === 0) {
      return res.status(200).json({
        success: true,
        data: {
          totalPHCs: 0,
          criticalPHCs: 0,
          lowStockPHCs: 0,
          averageBedAvailability: 0,
          averageStaffAttendance: 0,
          totalPatientFootfall: 0
        }
      });
    }

    // Critical PHCs count
    const criticalPHCs = phcs.filter(
      p => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
    ).length;

    // Low stock PHCs count
    const lowStockPHCs = phcs.filter(
      p => p.riskLevel === 'HIGH' || p.riskLevel === 'MEDIUM' || p.riskLevel === 'CRITICAL'
    ).length;

    // Calculate Bed Availability %
    const totalBeds = phcs.reduce((acc, p) => acc + (p.totalBeds || 0), 0);
    const totalAvailableBeds = phcs.reduce((acc, p) => acc + (p.availableBeds || 0), 0);
    const averageBedAvailability = totalBeds > 0 ? Math.round((totalAvailableBeds / totalBeds) * 100) : 0;

    // Calculate Average Staff Attendance %
    const totalStaff = phcs.reduce((acc, p) => acc + (p.staffCount || 0), 0);
    const totalActiveStaff = phcs.reduce((acc, p) => acc + (p.activeStaff || 0), 0);
    const averageStaffAttendance = totalStaff > 0 ? Math.round((totalActiveStaff / totalStaff) * 100) : 0;

    // Calculate Total Patient Footfall
    const footfallRecords = await PatientFootfall.find({});
    const totalPatientFootfall = footfallRecords.reduce((acc, f) => acc + (f.patientCount || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        totalPHCs,
        criticalPHCs,
        lowStockPHCs,
        averageBedAvailability,
        averageStaffAttendance,
        totalPatientFootfall
      }
    });
  } catch (error) {
    next(error);
  }
};

const formatPHC = (phc) => {
  const p = phc.toObject ? phc.toObject() : phc;
  return {
    ...p,
    id: p._id,
    _id: p._id
  };
};

/**
 * @desc    Get all PHCs (with optional search/state/district/risk filters)
 * @route   GET /api/phcs
 * @access  Public
 */
const getAllPHCs = async (req, res, next) => {
  try {
    const { state, district, riskLevel, search } = req.query;
    const filter = {};

    if (state && state !== 'All States') {
      filter.state = new RegExp(`^${state.trim()}$`, 'i');
    }

    if (district && district !== 'All Districts') {
      filter.district = new RegExp(`^${district.trim()}$`, 'i');
    }

    if (riskLevel && riskLevel !== 'All Statuses') {
      filter.riskLevel = riskLevel.toUpperCase();
    }

    if (search) {
      filter.$or = [
        { name: new RegExp(search.trim(), 'i') },
        { district: new RegExp(search.trim(), 'i') },
        { state: new RegExp(search.trim(), 'i') }
      ];
    }

    const phcs = await PHC.find(filter).sort({ riskLevel: 1, name: 1 });
    const formatted = phcs.map(formatPHC);

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
 * @desc    Get PHCs by State
 * @route   GET /api/phcs/state/:state
 * @access  Public
 */
const getPHCsByState = async (req, res, next) => {
  try {
    const { state } = req.params;
    const phcs = await PHC.find({
      state: new RegExp(`^${state.trim()}$`, 'i')
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: phcs.length,
      data: phcs.map(formatPHC)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get PHCs by District
 * @route   GET /api/phcs/district/:district
 * @access  Public
 */
const getPHCsByDistrict = async (req, res, next) => {
  try {
    const { district } = req.params;
    const phcs = await PHC.find({
      district: new RegExp(`^${district.trim()}$`, 'i')
    }).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: phcs.length,
      data: phcs.map(formatPHC)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single PHC by ID (with populated bed, staff, and inventory records)
 * @route   GET /api/phcs/:id
 * @access  Public
 */
const getPHCById = async (req, res, next) => {
  try {
    const phc = await PHC.findById(req.params.id);

    if (!phc) {
      return res.status(404).json({
        success: false,
        message: `PHC with ID ${req.params.id} not found`
      });
    }

    // Optional: fetch related beds, staff, and inventory
    const [bed, staff, inventory] = await Promise.all([
      Bed.findOne({ phcId: phc._id }),
      Staff.find({ phcId: phc._id }),
      Inventory.find({ phcId: phc._id }).populate('medicineId', 'name category unit expiryDate')
    ]);

    return res.status(200).json({
      success: true,
      data: {
        ...formatPHC(phc),
        bedDetails: bed,
        staffMembers: staff,
        inventory
      }
    });
  } catch (error) {
    // Check if it's a CastError (invalid ObjectId)
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid PHC ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

/**
 * @desc    Get all critical PHCs (riskLevel: CRITICAL or HIGH)
 * @route   GET /api/phcs/critical
 * @access  Public
 */
const getCriticalPHCs = async (req, res, next) => {
  try {
    const phcs = await PHC.find({
      riskLevel: { $in: ['CRITICAL', 'HIGH'] }
    }).sort({ riskLevel: 1, name: 1 });

    return res.status(200).json({
      success: true,
      count: phcs.length,
      data: phcs.map(formatPHC)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPHCStats,
  getAllPHCs,
  getCriticalPHCs,
  getPHCsByState,
  getPHCsByDistrict,
  getPHCById
};
