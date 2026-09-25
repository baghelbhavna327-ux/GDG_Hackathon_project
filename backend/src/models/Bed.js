const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema(
  {
    phcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true,
      unique: true
    },
    totalBeds: {
      type: Number,
      required: true,
      default: 0
    },
    occupiedBeds: {
      type: Number,
      required: true,
      default: 0
    },
    availableBeds: {
      type: Number,
      required: true,
      default: 0
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

// Pre-save hook to ensure availableBeds matches total - occupied
bedSchema.pre('save', function (next) {
  if (this.totalBeds != null && this.occupiedBeds != null) {
    this.availableBeds = Math.max(0, this.totalBeds - this.occupiedBeds);
  }
  this.lastUpdated = new Date();
  next();
});

module.exports = mongoose.model('Bed', bedSchema);
