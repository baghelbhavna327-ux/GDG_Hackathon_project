const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    phcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: ['STOCK_OUT', 'BED_SHORTAGE', 'STAFF_SHORTAGE', 'EMERGENCY', 'EXPIRING_MEDICINE', 'GENERAL'],
      default: 'GENERAL'
    },
    severity: {
      type: String,
      required: true,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL', 'WARNING', 'INFO'],
      default: 'INFO'
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED'],
      default: 'ACTIVE'
    }
  },
  {
    timestamps: true
  }
);

alertSchema.index({ phcId: 1, severity: 1, status: 1 });

module.exports = mongoose.model('Alert', alertSchema);
