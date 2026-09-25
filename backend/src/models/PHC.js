const mongoose = require('mongoose');

const phcSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    district: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      latitude: {
        type: Number,
        required: true
      },
      longitude: {
        type: Number,
        required: true
      }
    },
    totalBeds: {
      type: Number,
      default: 0
    },
    availableBeds: {
      type: Number,
      default: 0
    },
    staffCount: {
      type: Number,
      default: 0
    },
    activeStaff: {
      type: Number,
      default: 0
    },
    riskLevel: {
      type: String,
      enum: ['NORMAL', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'NORMAL'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PHC', phcSchema);
