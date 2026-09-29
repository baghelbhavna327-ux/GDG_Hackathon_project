const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipientUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    recipientRole: {
      type: String,
      enum: ['admin', 'health_worker', 'viewer', 'all'],
      default: 'all',
      index: true
    },
    type: {
      type: String,
      enum: [
        'SUPPLY_REQUEST',
        'SUPPLY_APPROVED',
        'SUPPLY_REJECTED',
        'SUPPLY_FULFILLED',
        'CRITICAL_STOCK',
        'HIGH_STOCK_RISK',
        'EMERGENCY',
        'REDISTRIBUTION'
      ],
      required: [true, 'Notification type is required'],
      index: true
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: 150
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: 500
    },
    relatedEntityId: {
      type: String,
      default: null,
      index: true
    },
    relatedEntityType: {
      type: String,
      enum: ['SupplyRequest', 'Transfer', 'Alert', 'PHC', 'Inventory', 'Emergency', 'General'],
      default: 'General'
    },
    actionUrl: {
      type: String,
      default: '/dashboard',
      trim: true
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast queries and duplicate-prevention
NotificationSchema.index({ type: 1, relatedEntityId: 1, createdAt: -1 });
NotificationSchema.index({ recipientUserId: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipientRole: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
