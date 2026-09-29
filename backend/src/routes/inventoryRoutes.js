const express = require('express');
const router = express.Router();
const {
  getAllInventory,
  getCriticalInventory,
  getLowStockInventory,
  getInventoryByPHC,
  getInventoryById,
  updateInventory,
  createInventory
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');

// Critical stock items (daysRemaining <= 5)
router.get('/critical', getCriticalInventory);

// Low stock items (daysRemaining <= 10)
router.get('/low-stock', getLowStockInventory);

// Inventory for a specific PHC
router.get('/phc/:phcId', getInventoryByPHC);

// All inventory records (supports ?state=&district=&medicine=&risk=&search=)
router.get('/', getAllInventory);

// Single inventory item by ID
router.get('/:id', getInventoryById);

// Create or upsert an inventory record (Admin and Clinicians only)
router.post('/', protect, authorize('admin', 'health_worker'), createInventory);

// Update inventory stock/usage by ID (Admin and Clinicians only)
router.put('/:id', protect, authorize('admin', 'health_worker'), updateInventory);

module.exports = router;
