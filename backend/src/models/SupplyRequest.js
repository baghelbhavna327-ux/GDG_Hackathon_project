const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    clinicianId: {
      type: String
    },
    clinicianName: {
      type: String,
      trim: true,
      default: 'Authorized Clinician'
    },
    phcId: {
      type: String,
      required: true,
      trim: true
    },
    phcName: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      trim: true,
      default: 'Guna'
    },
    state: {
      type: String,
      trim: true,
      default: 'Madhya Pradesh'
    },
    medicine: {
      type: String,
      required: true,
      trim: true
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0
    },
    predictedDailyDemand: {
      type: Number,
      default: 0
    },
    predicted7DayDemand: {
      type: Number,
      default: 0
    },
    daysRemaining: {
      type: Number,
      default: 0
    },
    shortageQuantity: {
      type: Number,
      default: 0
    },
    stockOutRisk: {
      type: String,
      enum: ['NORMAL', 'WARNING', 'HIGH', 'CRITICAL'],
      default: 'HIGH'
    },
    requestedQuantity: {
      type: Number,
      required: true,
      min: [1, 'Requested quantity must be at least 1']
    },
    urgency: {
      type: String,
      enum: ['HIGH', 'CRITICAL'],
      default: 'HIGH'
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'],
      default: 'PENDING'
    },
    adminComment: {
      type: String,
      trim: true,
      default: ''
    },
    approvedQuantity: {
      type: Number,
      default: null
    },
    transferredRecordId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

supplyRequestSchema.index({ requestedBy: 1, status: 1, createdAt: -1 });
supplyRequestSchema.index({ phcName: 1, status: 1 });

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema);
