const mongoose = require('mongoose');

const patientFootfallSchema = new mongoose.Schema(
  {
    phcId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'PHC',
      required: true
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    patientCount: {
      type: Number,
      required: true,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

patientFootfallSchema.index({ phcId: 1, date: 1 });

module.exports = mongoose.model('PatientFootfall', patientFootfallSchema);
