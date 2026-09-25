const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    phcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0
    },
    dailyUsage: {
      type: Number,
      required: true,
      default: 0
    },
    reorderLevel: {
      type: Number,
      required: true,
      default: 50
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Create compound index for phcId + medicineId lookup
inventorySchema.index({ phcId: 1, medicineId: 1 }, { unique: true });

module.exports = mongoose.model('Inventory', inventorySchema);
