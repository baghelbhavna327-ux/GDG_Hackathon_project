const { PatientFootfall, PHC } = require('../models');

/**
 * @desc    Get patient footfall summary across all PHCs
 * @route   GET /api/patients/footfall/summary
 * @access  Public
 */
const getFootfallSummary = async (req, res, next) => {
  try {
    const footfalls = await PatientFootfall.find({}).sort({ date: 1 });

    const weeklyPatients = footfalls.reduce((acc, f) => acc + (f.patientCount || 0), 0);

    // Group by Date string (YYYY-MM-DD)
    const dateMap = {};
    footfalls.forEach(f => {
      const d = new Date(f.date).toISOString().split('T')[0];
      if (!dateMap[d]) {
        dateMap[d] = 0;
      }
      dateMap[d] += f.patientCount;
    });

    const dates = Object.keys(dateMap).sort();
    const dailyBreakdown = dates.map(date => ({
      date,
      patientCount: dateMap[date]
    }));

    const distinctDaysCount = dates.length || 1;
    const dailyAverage = Math.round(weeklyPatients / distinctDaysCount);

    // Today's patient count (latest date in dataset)
    const todaysPatients = dates.length > 0 ? dateMap[dates[dates.length - 1]] : 0;

    return res.status(200).json({
      success: true,
      data: {
        todaysPatients,
        weeklyPatients,
        dailyAverage,
        totalTrackedDays: distinctDaysCount,
        dailyBreakdown
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all patient footfall records
 * @route   GET /api/patients/footfall
 * @access  Public
 */
const getAllFootfall = async (req, res, next) => {
  try {
    const { phcId, startDate, endDate } = req.query;
    const filter = {};

    if (phcId) {
      filter.phcId = phcId;
    }

    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const records = await PatientFootfall.find(filter)
      .populate('phcId', 'name district state riskLevel')
      .sort({ date: -1 })
      .lean();

    const formatted = records
      .filter(r => r.phcId)
      .map(r => ({
        _id: r._id,
        phcId: r.phcId._id,
        phcName: r.phcId.name,
        district: r.phcId.district,
        state: r.phcId.state,
        date: r.date,
        patientCount: r.patientCount,
        createdAt: r.createdAt
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
 * @desc    Get patient footfall for a specific PHC
 * @route   GET /api/patients/footfall/phc/:phcId
 * @access  Public
 */
const getFootfallByPHC = async (req, res, next) => {
  try {
    const { phcId } = req.params;
    const records = await PatientFootfall.find({ phcId })
      .populate('phcId', 'name district state riskLevel')
      .sort({ date: 1 })
      .lean();

    const formatted = records.map(r => ({
      _id: r._id,
      phcId: r.phcId?._id || phcId,
      phcName: r.phcId?.name || 'Unknown PHC',
      district: r.phcId?.district || 'Unknown District',
      state: r.phcId?.state || 'Unknown State',
      date: r.date,
      patientCount: r.patientCount
    }));

    const totalPatients = formatted.reduce((acc, r) => acc + r.patientCount, 0);
    const average = formatted.length > 0 ? Math.round(totalPatients / formatted.length) : 0;

    return res.status(200).json({
      success: true,
      count: formatted.length,
      summary: {
        totalPatients,
        dailyAverage: average
      },
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
  getFootfallSummary,
  getAllFootfall,
  getFootfallByPHC
};
