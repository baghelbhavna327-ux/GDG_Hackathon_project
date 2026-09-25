const { Bed, PHC } = require('../models');

/**
 * @desc    Get summary of beds across all PHCs
 * @route   GET /api/beds/summary
 * @access  Public
 */
const getBedSummary = async (req, res, next) => {
  try {
    const beds = await Bed.find({}).populate('phcId', 'name state district riskLevel');

    const totalBeds = beds.reduce((acc, b) => acc + (b.totalBeds || 0), 0);
    const occupiedBeds = beds.reduce((acc, b) => acc + (b.occupiedBeds || 0), 0);
    const availableBeds = beds.reduce((acc, b) => acc + (b.availableBeds || 0), 0);
    const occupancyPercentage = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;
    const availabilityPercentage = totalBeds > 0 ? Math.round((availableBeds / totalBeds) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        occupancyPercentage,
        availabilityPercentage
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all bed records
 * @route   GET /api/beds
 * @access  Public
 */
const getAllBeds = async (req, res, next) => {
  try {
    const beds = await Bed.find({})
      .populate('phcId', 'name state district riskLevel location')
      .lean();

    const formatted = beds
      .filter(b => b.phcId)
      .map(b => {
        const total = b.totalBeds || 0;
        const occupied = b.occupiedBeds || 0;
        const available = b.availableBeds != null ? b.availableBeds : Math.max(0, total - occupied);
        const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

        return {
          _id: b._id,
          phcId: b.phcId._id,
          phcName: b.phcId.name,
          district: b.phcId.district,
          state: b.phcId.state,
          riskLevel: b.phcId.riskLevel,
          location: b.phcId.location,
          totalBeds: total,
          occupiedBeds: occupied,
          availableBeds: available,
          occupancyPercentage: occupancyRate,
          lastUpdated: b.lastUpdated || b.updatedAt
        };
      });

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
 * @desc    Get bed record for a specific PHC
 * @route   GET /api/beds/phc/:phcId
 * @access  Public
 */
const getBedsByPHC = async (req, res, next) => {
  try {
    const { phcId } = req.params;
    const bed = await Bed.findOne({ phcId })
      .populate('phcId', 'name state district riskLevel location')
      .lean();

    if (!bed) {
      return res.status(404).json({
        success: false,
        message: `Bed record for PHC ID ${phcId} not found`
      });
    }

    const total = bed.totalBeds || 0;
    const occupied = bed.occupiedBeds || 0;
    const available = bed.availableBeds != null ? bed.availableBeds : Math.max(0, total - occupied);
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

    return res.status(200).json({
      success: true,
      data: {
        _id: bed._id,
        phcId: bed.phcId?._id || phcId,
        phcName: bed.phcId?.name || 'Unknown PHC',
        district: bed.phcId?.district || 'Unknown District',
        state: bed.phcId?.state || 'Unknown State',
        totalBeds: total,
        occupiedBeds: occupied,
        availableBeds: available,
        occupancyPercentage: occupancyRate,
        lastUpdated: bed.lastUpdated || bed.updatedAt
      }
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
  getBedSummary,
  getAllBeds,
  getBedsByPHC
};
