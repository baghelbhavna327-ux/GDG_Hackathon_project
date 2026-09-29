const { Notification } = require('../models');

/**
 * Utility helper to create notifications with intelligent duplicate-prevention
 */
const createNotification = async ({
  recipientUserId = null,
  recipientRole = 'all',
  type,
  title,
  message,
  relatedEntityId = null,
  relatedEntityType = 'General',
  actionUrl = '/dashboard',
  metadata = {},
  deduplicateWindowMinutes = 0
}) => {
  try {
    // Duplicate prevention check
    if (deduplicateWindowMinutes > 0 && relatedEntityId) {
      const windowStart = new Date(Date.now() - deduplicateWindowMinutes * 60 * 1000);
      const query = {
        type,
        relatedEntityId,
        createdAt: { $gte: windowStart }
      };

      if (recipientUserId) {
        query.recipientUserId = recipientUserId;
      } else {
        query.recipientRole = recipientRole;
      }

      const existing = await Notification.findOne(query);
      if (existing) {
        // Notification already created within the deduplication window
        return existing;
      }
    }

    const notification = await Notification.create({
      recipientUserId,
      recipientRole,
      type,
      title: title.trim(),
      message: message.trim(),
      relatedEntityId: relatedEntityId ? String(relatedEntityId) : null,
      relatedEntityType,
      actionUrl,
      metadata,
      isRead: false,
      readBy: []
    });

    return notification;
  } catch (error) {
    console.error('[NotificationHelper Error]:', error.message);
    return null;
  }
};

/**
 * Convenience helper to notify all Admin users
 */
const notifyAdmins = async (options) => {
  return createNotification({
    ...options,
    recipientRole: 'admin',
    recipientUserId: null
  });
};

/**
 * Convenience helper to notify a specific User (e.g. Clinician)
 */
const notifyUser = async (userId, options) => {
  return createNotification({
    ...options,
    recipientUserId: userId
  });
};

module.exports = {
  createNotification,
  notifyAdmins,
  notifyUser
};
