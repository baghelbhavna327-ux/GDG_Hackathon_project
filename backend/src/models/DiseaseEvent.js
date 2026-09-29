const mongoose = require('mongoose');

/**
 * DiseaseEvent Model
 * 
 * Represents public-health epidemiological and seasonal disease signals
 * used strictly for operational medicine demand forecasting and supply-chain planning.
 * 
 * DISCLAIMER: Not for clinical patient diagnosis or treatment recommendations.
 */
const diseaseEventSchema = new mongoose.Schema(
  {
    diseaseId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    diseaseName: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    region: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    eventType: {
      type: String,
      enum: ['SEASONAL', 'OUTBREAK', 'SURGE', 'REGIONAL_ALERT'],
      default: 'SEASONAL',
      index: true
    },
    reportingPeriod: {
      type: String,
      default: 'Current Epidemiological Week'
    },
    severityLevel: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM',
      index: true
    },
    caseCount: {
      type: Number,
      default: null
    },
    trendPercentage: {
      type: Number,
      default: 0
    },
    impactFactor: {
      type: Number,
      default: 0.20, // 20% estimated demand adjustment multiplier
      min: 0,
      max: 2.0
    },
    affectedMedicines: [
      {
        medicine: { type: String, required: true },
        impactMultiplier: { type: Number, default: 0.25 }, // +25%
        confidence: { type: String, enum: ['HIGH', 'MEDIUM', 'LOW'], default: 'HIGH' }
      }
    ],
    source: {
      type: String,
      required: true,
      default: 'Integrated Disease Surveillance Programme (IDSP) / NCDC'
    },
    sourceType: {
      type: String,
      enum: ['OFFICIAL_GOV', 'DEMO', 'SYNTHETIC'],
      default: 'OFFICIAL_GOV'
    },
    sourceUrl: {
      type: String,
      default: 'https://ncdc.mohfw.gov.in/idsp-weekly-reports/'
    },
    sourceDate: {
      type: Date,
      default: Date.now
    },
    confidence: {
      type: String,
      enum: ['HIGH', 'MEDIUM', 'LOW'],
      default: 'HIGH'
    },
    active: {
      type: Boolean,
      default: true,
      index: true
    },
    notes: {
      type: String,
      default: 'Operational health intelligence signal for hospital and PHC medicine inventory planning.'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('DiseaseEvent', diseaseEventSchema);
