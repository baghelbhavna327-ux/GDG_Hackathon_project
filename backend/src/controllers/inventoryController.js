const { Inventory } = require('../models');

/**
 * Helper to calculate stock metrics and format response
 */
const formatInventoryItem = (item) => {
  const currentStock = item.currentStock || 0;
  const dailyUsage = item.dailyUsage || 0;
  const minStock = item.reorderLevel !== undefined ? item.reorderLevel : 50;
  
  // Calculate days remaining: currentStock / dailyUsage
  const daysRemaining = dailyUsage > 0 ? Math.round(currentStock / dailyUsage) : 999;

  // Determine basic stock risk
  let riskLevel = 'NORMAL';
  if (daysRemaining <= 5 || currentStock < minStock * 0.5) {
    riskLevel = 'CRITICAL';
  } else if (daysRemaining <= 10 || currentStock < minStock) {
    riskLevel = 'HIGH';
  } else if (daysRemaining <= 15) {
    riskLevel = 'MEDIUM';
  }

  const medicine = item.medicineId || {};
  const phc = item.phcId || {};

  return {
    id: item._id,
    _id: item._id,
    medicine: medicine.name || 'Unknown Medicine',
    medicineName: medicine.name || 'Unknown Medicine',
    medicineId: medicine._id || null,
    category: medicine.category || 'General',
    unit: medicine.unit || 'units',
    expiryDate: medicine.expiryDate || null,
    phcId: phc._id || null,
    phcName: phc.name || 'Unknown PHC',
    district: phc.district || 'Unknown District',
    state: phc.state || 'Unknown State',
    currentStock,
    minimumStock: minStock,
    dailyUsage,
    reorderThreshold: minStock,
    shortage: Math.max(0, minStock - currentStock),
    predicted7DayDemand: dailyUsage * 7,
    daysRemaining,
    risk: riskLevel,
    riskLevel,
    lastUpdated: item.lastUpdated || item.updatedAt
  };
};

/**
 * @desc    Get all inventory records (supports filters for state, district, medicine, risk, search)
 * @route   GET /api/inventory
 * @access  Public
 */
const getAllInventory = async (req, res, next) => {
  try {
    const { state, district, medicine, risk, search } = req.query;

    const inventoryDocs = await Inventory.find({})
      .populate('medicineId')
      .populate('phcId')
      .lean();

    let results = inventoryDocs
      .filter(item => item.medicineId && item.phcId) // filter out orphaned refs
      .map(formatInventoryItem);

    // Apply filters
    if (state && state !== 'All States') {
      results = results.filter(i => i.state.toLowerCase() === state.toLowerCase().trim());
    }

    if (district && district !== 'All Districts') {
      results = results.filter(i => i.district.toLowerCase() === district.toLowerCase().trim());
    }

    if (medicine && medicine !== 'All Medicines') {
      results = results.filter(i => i.medicineName.toLowerCase().includes(medicine.toLowerCase().trim()));
    }

    if (risk && risk !== 'All Risk Levels') {
      results = results.filter(i => i.riskLevel.toUpperCase() === risk.toUpperCase().trim());
    }

    if (search) {
      const q = search.toLowerCase().trim();
      results = results.filter(
        i =>
          i.medicineName.toLowerCase().includes(q) ||
          i.phcName.toLowerCase().includes(q) ||
          i.district.toLowerCase().includes(q) ||
          i.state.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q)
      );
    }

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get critical inventory items (daysRemaining <= 5)
 * @route   GET /api/inventory/critical
 * @access  Public
 */
const getCriticalInventory = async (req, res, next) => {
  try {
    const inventoryDocs = await Inventory.find({})
      .populate('medicineId')
      .populate('phcId')
      .lean();

    const criticalItems = inventoryDocs
      .filter(item => item.medicineId && item.phcId)
      .map(formatInventoryItem)
      .filter(item => item.riskLevel === 'HIGH')
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return res.status(200).json({
      success: true,
      count: criticalItems.length,
      data: criticalItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get low stock inventory items (daysRemaining <= 10)
 * @route   GET /api/inventory/low-stock
 * @access  Public
 */
const getLowStockInventory = async (req, res, next) => {
  try {
    const inventoryDocs = await Inventory.find({})
      .populate('medicineId')
      .populate('phcId')
      .lean();

    const lowStockItems = inventoryDocs
      .filter(item => item.medicineId && item.phcId)
      .map(formatInventoryItem)
      .filter(item => item.riskLevel === 'HIGH' || item.riskLevel === 'MEDIUM')
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return res.status(200).json({
      success: true,
      count: lowStockItems.length,
      data: lowStockItems
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all inventory for a specific PHC
 * @route   GET /api/inventory/phc/:phcId
 * @access  Public
 */
const getInventoryByPHC = async (req, res, next) => {
  try {
    const { phcId } = req.params;

    const inventoryDocs = await Inventory.find({ phcId })
      .populate('medicineId')
      .populate('phcId')
      .lean();

    const results = inventoryDocs
      .filter(item => item.medicineId && item.phcId)
      .map(formatInventoryItem)
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results
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
 * @desc    Get single inventory record by ID
 * @route   GET /api/inventory/:id
 * @access  Public
 */
const getInventoryById = async (req, res, next) => {
  try {
    const item = await Inventory.findById(req.params.id)
      .populate('medicineId')
      .populate('phcId')
      .lean();

    if (!item || !item.medicineId || !item.phcId) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatInventoryItem(item)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Inventory ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

/**
 * @desc    Update single inventory record by ID
 * @route   PUT /api/inventory/:id
 * @access  Public
 */
const updateInventory = async (req, res, next) => {
  try {
    const { currentStock, dailyUsage, reorderLevel } = req.body;
    const updateFields = {};

    if (currentStock !== undefined) {
      if (typeof currentStock !== 'number' || currentStock < 0) {
        return res.status(400).json({
          success: false,
          message: 'currentStock must be a non-negative number'
        });
      }
      updateFields.currentStock = currentStock;
    }

    if (dailyUsage !== undefined) {
      if (typeof dailyUsage !== 'number' || dailyUsage < 0) {
        return res.status(400).json({
          success: false,
          message: 'dailyUsage must be a non-negative number'
        });
      }
      updateFields.dailyUsage = dailyUsage;
    }

    if (reorderLevel !== undefined) {
      if (typeof reorderLevel !== 'number' || reorderLevel < 0) {
        return res.status(400).json({
          success: false,
          message: 'reorderLevel must be a non-negative number'
        });
      }
      updateFields.reorderLevel = reorderLevel;
    }

    updateFields.lastUpdated = new Date();

    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    )
      .populate('medicineId')
      .populate('phcId')
      .lean();

    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        message: `Inventory item with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatInventoryItem(updatedItem),
      message: 'Inventory updated successfully'
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid Inventory ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

/**
 * @desc    Create or upsert an inventory record
 * @route   POST /api/inventory
 * @access  Public
 */
const createInventory = async (req, res, next) => {
  try {
    const { phcId, medicineId, currentStock = 0, dailyUsage = 10, reorderLevel = 50 } = req.body;

    if (!phcId || !medicineId) {
      return res.status(400).json({
        success: false,
        message: 'phcId and medicineId are required fields'
      });
    }

    if (currentStock < 0 || dailyUsage < 0 || reorderLevel < 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock and usage values must be non-negative numbers'
      });
    }

    const item = await Inventory.findOneAndUpdate(
      { phcId, medicineId },
      {
        $set: {
          currentStock,
          dailyUsage,
          reorderLevel,
          lastUpdated: new Date()
        }
      },
      { upsert: true, new: true, runValidators: true }
    )
      .populate('medicineId')
      .populate('phcId')
      .lean();

    return res.status(201).json({
      success: true,
      data: formatInventoryItem(item),
      message: 'Inventory record saved successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInventory,
  getCriticalInventory,
  getLowStockInventory,
  getInventoryByPHC,
  getInventoryById,
  updateInventory,
  createInventory
};
