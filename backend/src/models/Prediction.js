const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema(
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
    predictedDemand: {
      type: Number,
      required: true,
      default: 0
    },
    forecastDays: {
      type: Number,
      required: true,
      default: 7
    },
    stockOutRisk: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'LOW'
    },
    shortageQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

predictionSchema.index({ phcId: 1, medicineId: 1, forecastDays: 1 });

module.exports = mongoose.model('Prediction', predictionSchema);
