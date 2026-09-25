const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema(
  {
    phcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    attendanceStatus: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'ON_LEAVE', 'HALF_DAY'],
      default: 'PRESENT'
    },
    attendancePercentage: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    date: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

staffSchema.index({ phcId: 1, date: 1 });

module.exports = mongoose.model('Staff', staffSchema);
