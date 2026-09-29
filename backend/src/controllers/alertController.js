const { Alert, PHC } = require('../models');
const { createNotification } = require('../utils/notificationHelper');

/**
 * Helper to format alert response objects
 */
const formatAlert = (alert) => {
  const phc = alert.phcId || {};
  
  // Normalize severity to standard scale: LOW, MEDIUM, HIGH, CRITICAL
  let severity = (alert.severity || 'INFO').toUpperCase();
  if (severity === 'INFO') severity = 'LOW';
  if (severity === 'WARNING') severity = 'HIGH';

  return {
    id: alert._id,
    _id: alert._id,
    phcId: phc._id || null,
    PHC: phc.name || 'Unknown PHC',
    district: phc.district || 'Unknown District',
    state: phc.state || 'Unknown State',
    type: alert.type,
    severity,
    risk: severity,
    medicine: alert.medicine || (alert.title && alert.title.includes(':') ? alert.title.split(':')[0].trim() : 'General'),
    shortageQuantity: alert.shortageQuantity || 0,
    daysRemaining: alert.daysRemaining || (severity === 'CRITICAL' ? 2 : (severity === 'HIGH' ? 5 : 10)),
    title: alert.title,
    message: alert.message,
    status: alert.status || 'ACTIVE',
    createdAt: alert.createdAt || new Date()
  };
};

/**
 * @desc    Get all alerts (supports filtering by severity, risk, type, status, search, phcId)
 * @route   GET /api/alerts
 * @access  Public
 */
const getAllAlerts = async (req, res, next) => {
  try {
    const { severity, risk, type, status, search, phcId } = req.query;
    const filter = {};

    const targetSev = risk || severity;
    if (targetSev && targetSev !== 'All Severities' && targetSev !== 'All Risk Levels') {
      const sevUpper = targetSev.toUpperCase().trim();
      if (sevUpper === 'HIGH') {
        filter.severity = { $in: ['HIGH', 'WARNING'] };
      } else if (sevUpper === 'LOW') {
        filter.severity = { $in: ['LOW', 'INFO'] };
      } else {
        filter.severity = sevUpper;
      }
    }

    if (type && type !== 'All Types') {
      filter.type = type.toUpperCase().trim();
    }

    if (status && status !== 'All Statuses') {
      filter.status = status.toUpperCase().trim();
    }

    if (phcId) {
      filter.phcId = phcId;
    }

    const alerts = await Alert.find(filter)
      .populate('phcId', 'name district state')
      .sort({ createdAt: -1 })
      .lean();

    let formatted = alerts.filter(a => a.phcId).map(formatAlert);

    if (search) {
      const q = search.toLowerCase().trim();
      formatted = formatted.filter(
        a =>
          a.title.toLowerCase().includes(q) ||
          a.message.toLowerCase().includes(q) ||
          a.PHC.toLowerCase().includes(q) ||
          a.district.toLowerCase().includes(q) ||
          a.state.toLowerCase().includes(q)
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
 * @desc    Get critical alerts
 * @route   GET /api/alerts/critical
 * @access  Public
 */
const getCriticalAlerts = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ severity: 'CRITICAL' })
      .populate('phcId', 'name district state')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = alerts.filter(a => a.phcId).map(formatAlert);

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
 * @desc    Get recent alerts
 * @route   GET /api/alerts/recent
 * @access  Public
 */
const getRecentAlerts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 10;
    const alerts = await Alert.find({})
      .populate('phcId', 'name district state')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const formatted = alerts.filter(a => a.phcId).map(formatAlert);

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
 * @desc    Get alerts for a specific PHC
 * @route   GET /api/alerts/phc/:phcId
 * @access  Public
 */
const getAlertsByPHC = async (req, res, next) => {
  try {
    const { phcId } = req.params;
    const alerts = await Alert.find({ phcId })
      .populate('phcId', 'name district state')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = alerts.filter(a => a.phcId).map(formatAlert);

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
 * @desc    Get single alert by ID
 * @route   GET /api/alerts/:id
 * @access  Public
 */
const getAlertById = async (req, res, next) => {
  try {
    const alert = await Alert.findById(req.params.id)
      .populate('phcId', 'name district state')
      .lean();

    if (!alert || !alert.phcId) {
      return res.status(404).json({
        success: false,
        message: `Alert with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatAlert(alert)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Alert ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new alert
 * @route   POST /api/alerts
 * @access  Public
 */
const createAlert = async (req, res, next) => {
  try {
    const { phcId, type = 'GENERAL', severity = 'INFO', risk, title, message } = req.body;

    if (!phcId || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'phcId, title, and message are required fields'
      });
    }

    const finalSeverity = (risk || severity).toUpperCase();

    const newAlert = await Alert.create({
      phcId,
      type: type.toUpperCase(),
      severity: finalSeverity,
      title: title.trim(),
      message: message.trim(),
      status: 'ACTIVE'
    });

    const populated = await Alert.findById(newAlert._id)
      .populate('phcId', 'name district state')
      .lean();

    // Trigger notification if critical or emergency
    try {
      const phcName = populated.phcId ? populated.phcId.name : 'Monitored PHC';
      const isEmergency = type.toUpperCase() === 'EMERGENCY' || finalSeverity === 'CRITICAL';
      const notifType = type.toUpperCase() === 'EMERGENCY' ? 'EMERGENCY' : (finalSeverity === 'CRITICAL' ? 'CRITICAL_STOCK' : 'HIGH_STOCK_RISK');

      await createNotification({
        recipientRole: 'all',
        type: notifType,
        title: isEmergency ? 'Emergency Alert' : (finalSeverity === 'CRITICAL' ? 'Critical Stock Risk' : 'High Stock Risk'),
        message: `${phcName} — ${title}. ${message}`,
        relatedEntityId: newAlert._id.toString(),
        relatedEntityType: 'Alert',
        actionUrl: isEmergency ? '/emergency' : '/inventory',
        deduplicateWindowMinutes: 30,
        metadata: {
          alertId: newAlert._id.toString(),
          severity: finalSeverity,
          phcName
        }
      });
    } catch (notifErr) {
      console.warn('Alert notification non-fatal note:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      data: formatAlert(populated),
      message: 'Alert created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update alert status / severity
 * @route   PUT /api/alerts/:id
 * @access  Public
 */
const updateAlert = async (req, res, next) => {
  try {
    const { status, severity, risk, message } = req.body;
    const updateFields = {};

    if (status) updateFields.status = status.toUpperCase().trim();
    if (severity || risk) updateFields.severity = (risk || severity).toUpperCase().trim();
    if (message) updateFields.message = message.trim();

    const updated = await Alert.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('phcId', 'name district state')
      .lean();

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: `Alert with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatAlert(updated),
      message: 'Alert updated successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Alert ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

module.exports = {
  getAllAlerts,
  getCriticalAlerts,
  getRecentAlerts,
  getAlertsByPHC,
  getAlertById,
  createAlert,
  updateAlert
};
