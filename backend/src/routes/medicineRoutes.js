const express = require('express');
const router = express.Router();
const { getAllMedicines, getMedicineById } = require('../controllers/medicineController');

// Get all medicines (supports query: ?category=...&search=...)
router.get('/', getAllMedicines);

// Get single medicine by ID
router.get('/:id', getMedicineById);

module.exports = router;
