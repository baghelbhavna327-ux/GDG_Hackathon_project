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

// Critical stock items (daysRemaining <= 5)
router.get('/critical', getCriticalInventory);

// Low stock items (daysRemaining <= 10)
router.get('/low-stock', getLowStockInventory);

// Inventory for a specific PHC
router.get('/phc/:phcId', getInventoryByPHC);

// All inventory records (supports ?state=&district=&medicine=&risk=&search=)
router.get('/', getAllInventory);

// Create or upsert an inventory record
router.post('/', createInventory);

// Single inventory item by ID
router.get('/:id', getInventoryById);

// Update inventory stock/usage by ID
router.put('/:id', updateInventory);

module.exports = router;
