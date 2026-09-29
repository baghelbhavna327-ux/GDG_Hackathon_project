const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    },
    performedByName: {
      type: String,
      default: 'System Admin'
    },
    performedByEmail: {
      type: String,
      default: 'admin@healthchain.gov.in'
    },
    performedByRole: {
      type: String,
      default: 'admin'
    },
    targetResource: {
      type: String,
      required: true
    },
    resourceId: {
      type: String,
      default: null
    },
    details: {
      type: String,
      default: ''
    },
    ipAddress: {
      type: String,
      default: '127.0.0.1'
    },
    severity: {
      type: String,
      enum: ['INFO', 'WARNING', 'CRITICAL'],
      default: 'INFO'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('AuditLog', AuditLogSchema);
