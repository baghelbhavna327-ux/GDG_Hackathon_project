const { Prediction, PHC, Medicine } = require('../models');

/**
 * Helper to format prediction response objects
 */
const formatPrediction = (p) => {
  const phc = p.phcId || {};
  const medicine = p.medicineId || {};

  return {
    id: p._id,
    _id: p._id,
    PHC: phc.name || 'Unknown PHC',
    phcId: phc._id || null,
    district: phc.district || 'Unknown District',
    state: phc.state || 'Unknown State',
    medicine: medicine.name || 'Unknown Medicine',
    medicineId: medicine._id || null,
    currentStock: p.currentStock || 0,
    predictedDemand: p.predictedDemand || 0,
    forecastDays: p.forecastDays || 7,
    stockOutRisk: p.stockOutRisk || 'LOW',
    shortageQuantity: p.shortageQuantity != null ? p.shortageQuantity : Math.max(0, (p.predictedDemand || 0) - (p.currentStock || 0)),
    createdAt: p.createdAt || new Date()
  };
};

/**
 * @desc    Get all AI predictions
 * @route   GET /api/predictions
 * @access  Public
 */
const getAllPredictions = async (req, res, next) => {
  try {
    const { risk, forecastDays, medicine, phcId, search } = req.query;
    const filter = {};

    if (risk && risk !== 'All Risks') {
      filter.stockOutRisk = risk.toUpperCase().trim();
    }

    if (forecastDays) {
      filter.forecastDays = parseInt(forecastDays, 10);
    }

    if (phcId) {
      filter.phcId = phcId;
    }

    const predictions = await Prediction.find(filter)
      .populate('phcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .sort({ createdAt: -1 })
      .lean();

    let formatted = predictions
      .filter(p => p.phcId && p.medicineId)
      .map(formatPrediction);

    if (medicine) {
      formatted = formatted.filter(p => p.medicine.toLowerCase().includes(medicine.toLowerCase().trim()));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      formatted = formatted.filter(
        p =>
          p.PHC.toLowerCase().includes(q) ||
          p.medicine.toLowerCase().includes(q) ||
          p.district.toLowerCase().includes(q) ||
          p.state.toLowerCase().includes(q)
      );
    }

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
 * @desc    Get high-risk and critical stock-out predictions
 * @route   GET /api/predictions/high-risk
 * @access  Public
 */
const getHighRiskPredictions = async (req, res, next) => {
  try {
    const predictions = await Prediction.find({
      stockOutRisk: { $in: ['HIGH', 'CRITICAL'] }
    })
      .populate('phcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .sort({ shortageQuantity: -1, createdAt: -1 })
      .lean();

    const formatted = predictions
      .filter(p => p.phcId && p.medicineId)
      .map(formatPrediction);

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
 * @desc    Get predictions for a specific PHC
 * @route   GET /api/predictions/phc/:phcId
 * @access  Public
 */
const getPredictionsByPHC = async (req, res, next) => {
  try {
    const { phcId } = req.params;
    const predictions = await Prediction.find({ phcId })
      .populate('phcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .sort({ forecastDays: 1, stockOutRisk: 1 })
      .lean();

    const formatted = predictions.map(formatPrediction);

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

/**
 * @desc    Get single prediction by ID
 * @route   GET /api/predictions/:id
 * @access  Public
 */
const getPredictionById = async (req, res, next) => {
  try {
    const prediction = await Prediction.findById(req.params.id)
      .populate('phcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .lean();

    if (!prediction || !prediction.phcId || !prediction.medicineId) {
      return res.status(404).json({
        success: false,
        message: `Prediction with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatPrediction(prediction)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid prediction ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

/**
 * @desc    Ingest AI prediction records (Integration endpoint for Python/FastAPI ML service)
 * @route   POST /api/predictions
 * @access  Public
 */
const createPrediction = async (req, res, next) => {
  try {
    const body = req.body;

    // Handle single or bulk prediction ingestion
    if (Array.isArray(body)) {
      const inserted = await Prediction.insertMany(body);
      return res.status(201).json({
        success: true,
        count: inserted.length,
        message: `Successfully ingested ${inserted.length} AI prediction records`,
        data: inserted
      });
    }

    const {
      phcId,
      medicineId,
      currentStock,
      predictedDemand,
      forecastDays,
      stockOutRisk,
      shortageQuantity
    } = body;

    if (!phcId || !medicineId) {
      return res.status(400).json({
        success: false,
        message: 'phcId and medicineId are required fields'
      });
    }

    const shortage = shortageQuantity != null
      ? shortageQuantity
      : Math.max(0, (predictedDemand || 0) - (currentStock || 0));

    let risk = stockOutRisk;
    if (!risk) {
      if (shortage > 50) risk = 'CRITICAL';
      else if (shortage > 0) risk = 'HIGH';
      else risk = 'LOW';
    }

    const newPrediction = await Prediction.create({
      phcId,
      medicineId,
      currentStock: currentStock || 0,
      predictedDemand: predictedDemand || 0,
      forecastDays: forecastDays || 7,
      stockOutRisk: risk,
      shortageQuantity: shortage
    });

    const populated = await Prediction.findById(newPrediction._id)
      .populate('phcId', 'name district state')
      .populate('medicineId', 'name category unit');

    return res.status(201).json({
      success: true,
      message: 'AI prediction recorded successfully',
      data: formatPrediction(populated)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPredictions,
  getHighRiskPredictions,
  getPredictionsByPHC,
  getPredictionById,
  createPrediction
};
