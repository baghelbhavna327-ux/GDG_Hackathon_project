const mongoose = require('mongoose');

const resourceTransferSchema = new mongoose.Schema(
  {
    sourcePhcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true
    },
    destinationPhcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true
    },
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine',
      required: true
    },
    availableSurplus: {
      type: Number,
      required: true,
      default: 0
    },
    predictedShortage: {
      type: Number,
      required: true,
      default: 0
    },
    recommendedQuantity: {
      type: Number,
      required: true,
      default: 0
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    status: {
      type: String,
      enum: ['PENDING', 'RECOMMENDED', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'],
      default: 'RECOMMENDED'
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    estimatedDistance: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

resourceTransferSchema.index({ sourcePhcId: 1, destinationPhcId: 1, status: 1 });

module.exports = mongoose.model('ResourceTransfer', resourceTransferSchema);
