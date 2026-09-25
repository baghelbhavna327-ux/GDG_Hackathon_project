const { ResourceTransfer, PHC, Medicine } = require('../models');

/**
 * Helper to format resource transfer response objects
 */
const formatTransfer = (transfer) => {
  const source = transfer.sourcePhcId || {};
  const destination = transfer.destinationPhcId || {};
  const medicine = transfer.medicineId || {};

  return {
    id: transfer._id,
    _id: transfer._id,
    sourcePHC: source.name || 'Unknown Source PHC',
    sourcePhc: source._id || null,
    sourcePhcId: source._id || null,
    sourceDistrict: source.district || 'Unknown District',
    sourceState: source.state || 'Unknown State',
    destinationPHC: destination.name || 'Unknown Destination PHC',
    destinationPhc: destination._id || null,
    destinationPhcId: destination._id || null,
    destinationDistrict: destination.district || 'Unknown District',
    destinationState: destination.state || 'Unknown State',
    medicine: medicine.name || 'Unknown Medicine',
    medicineId: medicine._id || null,
    availableSurplus: transfer.availableSurplus || 0,
    predictedShortage: transfer.predictedShortage || 0,
    recommendedQuantity: transfer.recommendedQuantity || 0,
    quantity: transfer.recommendedQuantity || 0,
    priority: transfer.priority || 'MEDIUM',
    estimatedDistance: transfer.estimatedDistance || 0,
    reason: transfer.reason || '',
    status: transfer.status || 'RECOMMENDED',
    createdAt: transfer.createdAt || new Date()
  };
};

/**
 * @desc    Get all resource redistribution recommendations
 * @route   GET /api/transfers
 * @access  Public
 */
const getAllTransfers = async (req, res, next) => {
  try {
    const { priority, status, medicine, search } = req.query;
    const filter = {};

    if (priority && priority !== 'All Priorities') {
      filter.priority = priority.toUpperCase().trim();
    }

    if (status && status !== 'All Statuses') {
      filter.status = status.toUpperCase().trim();
    }

    const transfers = await ResourceTransfer.find(filter)
      .populate('sourcePhcId', 'name district state')
      .populate('destinationPhcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .sort({ createdAt: -1 })
      .lean();

    let formatted = transfers
      .filter(t => t.sourcePhcId && t.destinationPhcId && t.medicineId)
      .map(formatTransfer);

    if (medicine) {
      formatted = formatted.filter(t => t.medicine.toLowerCase().includes(medicine.toLowerCase().trim()));
    }

    if (search) {
      const q = search.toLowerCase().trim();
      formatted = formatted.filter(
        t =>
          t.sourcePHC.toLowerCase().includes(q) ||
          t.destinationPHC.toLowerCase().includes(q) ||
          t.medicine.toLowerCase().includes(q) ||
          t.sourceDistrict.toLowerCase().includes(q) ||
          t.destinationDistrict.toLowerCase().includes(q)
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
 * @desc    Get pending & recommended transfers
 * @route   GET /api/transfers/pending
 * @access  Public
 */
const getPendingTransfers = async (req, res, next) => {
  try {
    const transfers = await ResourceTransfer.find({
      status: { $in: ['PENDING', 'RECOMMENDED'] }
    })
      .populate('sourcePhcId', 'name district state')
      .populate('destinationPhcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .sort({ priority: 1, createdAt: -1 })
      .lean();

    const formatted = transfers
      .filter(t => t.sourcePhcId && t.destinationPhcId && t.medicineId)
      .map(formatTransfer);

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
 * @desc    Get high-priority and critical transfers
 * @route   GET /api/transfers/high-priority
 * @access  Public
 */
const getHighPriorityTransfers = async (req, res, next) => {
  try {
    const transfers = await ResourceTransfer.find({
      priority: { $in: ['CRITICAL', 'HIGH'] }
    })
      .populate('sourcePhcId', 'name district state')
      .populate('destinationPhcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = transfers
      .filter(t => t.sourcePhcId && t.destinationPhcId && t.medicineId)
      .map(formatTransfer);

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
 * @desc    Get single transfer record by ID
 * @route   GET /api/transfers/:id
 * @access  Public
 */
const getTransferById = async (req, res, next) => {
  try {
    const transfer = await ResourceTransfer.findById(req.params.id)
      .populate('sourcePhcId', 'name district state')
      .populate('destinationPhcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .lean();

    if (!transfer || !transfer.sourcePhcId || !transfer.destinationPhcId || !transfer.medicineId) {
      return res.status(404).json({
        success: false,
        message: `Resource transfer with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatTransfer(transfer)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid transfer ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

/**
 * @desc    Create new transfer recommendation / request
 * @route   POST /api/transfers or POST /api/redistributions
 * @access  Public
 */
const createTransfer = async (req, res, next) => {
  try {
    let {
      sourcePhcId,
      destinationPhcId,
      sourcePhc,
      destinationPhc,
      sourcePHC,
      destinationPHC,
      medicineId,
      medicine,
      recommendedQuantity,
      quantity,
      availableSurplus,
      predictedShortage,
      priority = 'MEDIUM',
      reason,
      estimatedDistance = 0,
      status = 'RECOMMENDED'
    } = req.body;

    const srcInput = sourcePhcId || sourcePhc || sourcePHC;
    const dstInput = destinationPhcId || destinationPhc || destinationPHC;
    const medInput = medicineId || medicine;

    // Resolve source PHC
    if (srcInput) {
      if (typeof srcInput === 'string' && /^[0-9a-fA-F]{24}$/.test(srcInput)) {
        sourcePhcId = srcInput;
      } else {
        const src = await PHC.findOne({ name: new RegExp('^' + String(srcInput).trim() + '$', 'i') });
        if (src) sourcePhcId = src._id;
      }
    }

    // Resolve destination PHC
    if (dstInput) {
      if (typeof dstInput === 'string' && /^[0-9a-fA-F]{24}$/.test(dstInput)) {
        destinationPhcId = dstInput;
      } else {
        const dst = await PHC.findOne({ name: new RegExp('^' + String(dstInput).trim() + '$', 'i') });
        if (dst) destinationPhcId = dst._id;
      }
    }

    // Resolve Medicine
    if (medInput) {
      if (typeof medInput === 'string' && /^[0-9a-fA-F]{24}$/.test(medInput)) {
        medicineId = medInput;
      } else {
        const med = await Medicine.findOne({ name: new RegExp('^' + String(medInput).trim() + '$', 'i') });
        if (med) medicineId = med._id;
      }
    }

    if (!sourcePhcId || !destinationPhcId || !medicineId) {
      return res.status(400).json({
        success: false,
        message: 'Valid source PHC, destination PHC, and medicine are required'
      });
    }

    if (sourcePhcId.toString() === destinationPhcId.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Source and destination PHCs cannot be the same'
      });
    }

    const qty = Number(recommendedQuantity || quantity || 0);
    if (qty <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Transfer quantity must be greater than zero'
      });
    }

    const newTransfer = await ResourceTransfer.create({
      sourcePhcId,
      destinationPhcId,
      medicineId,
      recommendedQuantity: qty,
      availableSurplus: Number(availableSurplus || qty),
      predictedShortage: Number(predictedShortage || qty),
      priority: priority.toUpperCase(),
      reason: reason || 'Redistribution to balance supply and prevent stockout',
      estimatedDistance: Number(estimatedDistance || 0),
      status: status.toUpperCase()
    });

    const populated = await ResourceTransfer.findById(newTransfer._id)
      .populate('sourcePhcId', 'name district state')
      .populate('destinationPhcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .lean();

    return res.status(201).json({
      success: true,
      data: formatTransfer(populated),
      message: 'Resource transfer created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update transfer status (e.g. ACCEPTED, IN_TRANSIT, COMPLETED, REJECTED)
 * @route   PUT /api/transfers/:id or PUT /api/redistributions/:id
 * @access  Public
 */
const updateTransferStatus = async (req, res, next) => {
  try {
    const { status, priority, reason } = req.body;
    const { Inventory } = require('../models');

    const existing = await ResourceTransfer.findById(req.params.id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: `Resource transfer with ID ${req.params.id} not found`
      });
    }

    const previousStatus = existing.status;
    const newStatus = status ? status.toUpperCase().trim() : existing.status;

    const updateFields = {};
    if (status) updateFields.status = newStatus;
    if (priority) updateFields.priority = priority.toUpperCase().trim();
    if (reason) updateFields.reason = reason.trim();

    // If status is transitioning to COMPLETED (and wasn't COMPLETED already), safely update inventories
    if (newStatus === 'COMPLETED' && previousStatus !== 'COMPLETED') {
      const qty = existing.recommendedQuantity || 0;

      // 1. Decrement source PHC stock
      await Inventory.findOneAndUpdate(
        { phcId: existing.sourcePhcId, medicineId: existing.medicineId },
        { $inc: { currentStock: -qty }, $set: { lastUpdated: new Date() } },
        { upsert: false }
      );

      // 2. Increment destination PHC stock (upsert if doesn't exist yet)
      await Inventory.findOneAndUpdate(
        { phcId: existing.destinationPhcId, medicineId: existing.medicineId },
        { $inc: { currentStock: qty }, $set: { lastUpdated: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    const updated = await ResourceTransfer.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('sourcePhcId', 'name district state')
      .populate('destinationPhcId', 'name district state')
      .populate('medicineId', 'name category unit')
      .lean();

    return res.status(200).json({
      success: true,
      data: formatTransfer(updated),
      message: `Transfer status updated to ${newStatus}`
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid transfer ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

module.exports = {
  getAllTransfers,
  getPendingTransfers,
  getHighPriorityTransfers,
  getTransferById,
  createTransfer,
  updateTransferStatus
};

