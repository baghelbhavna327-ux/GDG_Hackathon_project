const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    fromPHC: { type: String, required: true },
    fromDistrict: { type: String, required: true },
    toPHC: { type: String, required: true },
    toDistrict: { type: String, required: true },
    medicine: { type: String, required: true },
    surplus: { type: Number, required: true },
    predictedShortage: { type: Number, required: true },
    recommendedQuantity: { type: Number, required: true },
    priority: {
      type: String,
      enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
      default: 'MEDIUM'
    },
    distanceKm: { type: Number, required: true },
    estTime: { type: String, required: true },
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'],
      default: 'PENDING'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transfer', transferSchema);
