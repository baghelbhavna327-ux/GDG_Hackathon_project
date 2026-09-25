const { Medicine } = require('../models');

const formatMedicine = (m) => {
  const obj = m.toObject ? m.toObject() : m;
  return {
    ...obj,
    id: obj._id,
    _id: obj._id
  };
};


/**
 * @desc    Get all medicines
 * @route   GET /api/medicines
 * @access  Public
 */
const getAllMedicines = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category && category !== 'All Categories') {
      filter.category = new RegExp(category.trim(), 'i');
    }

    if (search) {
      filter.name = new RegExp(search.trim(), 'i');
    }

    const medicines = await Medicine.find(filter).sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines.map(formatMedicine)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single medicine by ID
 * @route   GET /api/medicines/:id
 * @access  Public
 */
const getMedicineById = async (req, res, next) => {
  try {
    const medicine = await Medicine.findById(req.params.id);

    if (!medicine) {
      return res.status(404).json({
        success: false,
        message: `Medicine with ID ${req.params.id} not found`
      });
    }

    return res.status(200).json({
      success: true,
      data: formatMedicine(medicine)
    });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: `Invalid medicine ID format: ${req.params.id}`
      });
    }
    next(error);
  }
};

module.exports = {
  getAllMedicines,
  getMedicineById
};

