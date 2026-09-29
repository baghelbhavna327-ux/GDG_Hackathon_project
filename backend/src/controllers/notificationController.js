const { Notification } = require('../models');

/**
 * Helper to compute whether a notification is read by the specific user
 */
const isNotificationReadByUser = (notification, userId) => {
  if (notification.recipientUserId && notification.recipientUserId.toString() === userId.toString()) {
    return !!notification.isRead;
  }
  // Role-based or broadcast notification
  if (notification.isRead) return true;
  if (Array.isArray(notification.readBy)) {
    return notification.readBy.some(id => id.toString() === userId.toString());
  }
  return false;
};

/**
 * @desc    Get notifications for logged-in user
 * @route   GET /api/notifications
 * @access  Private (All authenticated roles)
 */
const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Build query for notifications applicable to this user
    const query = {
      $or: [
        { recipientUserId: userId },
        { recipientRole: userRole },
        { recipientRole: 'all' }
      ]
    };

    const limit = Math.min(Number(req.query.limit) || 40, 100);
    let notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    // If completely empty, auto-sync initial notifications from existing real Alerts & SupplyRequests
    if (notifications.length === 0) {
      try {
        const totalInDb = await Notification.countDocuments();
        if (totalInDb === 0) {
          const { Alert, SupplyRequest } = require('../models');
          const sampleAlerts = await Alert.find({ severity: { $in: ['CRITICAL', 'HIGH'] } }).populate('phcId', 'name').limit(3).lean();
          const sampleRequests = await SupplyRequest.find().limit(2).lean();

          const initialNotifs = [];

          for (const alt of sampleAlerts) {
            const phcName = alt.phcId ? alt.phcId.name : 'Guna PHC-04';
            const isEmg = alt.type === 'EMERGENCY' || alt.severity === 'CRITICAL';
            initialNotifs.push({
              recipientRole: 'all',
              type: isEmg ? 'EMERGENCY' : 'CRITICAL_STOCK',
              title: isEmg ? 'Emergency Alert' : 'Critical Stock Risk Detected',
              message: `${phcName} — ${alt.title || 'Immediate stock intervention required.'}`,
              relatedEntityId: alt._id.toString(),
              relatedEntityType: 'Alert',
              actionUrl: isEmg ? '/emergency' : '/inventory',
              isRead: false,
              readBy: [],
              createdAt: alt.createdAt || new Date()
            });
          }

          for (const sr of sampleRequests) {
            if (sr.status === 'PENDING') {
              initialNotifs.push({
                recipientRole: 'admin',
                type: 'SUPPLY_REQUEST',
                title: 'New Medicine Supply Request',
                message: `${sr.phcName} requested ${sr.requestedQuantity} units of ${sr.medicine}. Risk: ${sr.stockOutRisk || 'CRITICAL'}.`,
                relatedEntityId: sr._id.toString(),
                relatedEntityType: 'SupplyRequest',
                actionUrl: '/admin/dashboard',
                isRead: false,
                readBy: [],
                createdAt: sr.createdAt || new Date()
              });
            } else if (sr.status === 'APPROVED' && sr.requestedBy) {
              initialNotifs.push({
                recipientUserId: sr.requestedBy,
                recipientRole: 'health_worker',
                type: 'SUPPLY_APPROVED',
                title: 'Medicine Supply Request Approved',
                message: `Your request for ${sr.approvedQuantity || sr.requestedQuantity} units of ${sr.medicine} has been approved.`,
                relatedEntityId: sr._id.toString(),
                relatedEntityType: 'SupplyRequest',
                actionUrl: '/clinician',
                isRead: false,
                readBy: [],
                createdAt: sr.updatedAt || new Date()
              });
            }
          }

          if (initialNotifs.length > 0) {
            await Notification.insertMany(initialNotifs);
            notifications = await Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean();
          }
        }
      } catch (seedErr) {
        console.warn('Initial notifications sync note:', seedErr.message);
      }
    }

    // Map each notification with dynamic isRead state for this user
    const formatted = notifications.map((n) => ({
      _id: n._id.toString(),
      id: n._id.toString(),
      type: n.type,
      title: n.title,
      message: n.message,
      relatedEntityId: n.relatedEntityId,
      relatedEntityType: n.relatedEntityType,
      actionUrl: n.actionUrl,
      isRead: isNotificationReadByUser(n, userId),
      recipientRole: n.recipientRole,
      recipientUserId: n.recipientUserId ? n.recipientUserId.toString() : null,
      metadata: n.metadata || {},
      createdAt: n.createdAt,
      updatedAt: n.updatedAt
    }));

    const unreadCount = formatted.filter(n => !n.isRead).length;

    return res.status(200).json({
      success: true,
      count: formatted.length,
      unreadCount,
      data: formatted
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving notifications.'
    });
  }
};

/**
 * @desc    Get unread notification count for logged-in user
 * @route   GET /api/notifications/unread-count
 * @access  Private (All authenticated roles)
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // 1. Direct unread count
    const directUnread = await Notification.countDocuments({
      recipientUserId: userId,
      isRead: false
    });

    // 2. Role-based / broadcast unread count (not marked read by this user and not globally isRead)
    const roleUnread = await Notification.countDocuments({
      recipientRole: { $in: [userRole, 'all'] },
      recipientUserId: null,
      isRead: false,
      readBy: { $ne: userId }
    });

    const totalUnread = directUnread + roleUnread;

    return res.status(200).json({
      success: true,
      unreadCount: totalUnread
    });
  } catch (error) {
    console.error('Error counting unread notifications:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error counting unread notifications.'
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private (All authenticated roles)
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found.'
      });
    }

    if (notification.recipientUserId && notification.recipientUserId.toString() === userId.toString()) {
      notification.isRead = true;
      await notification.save();
    } else {
      // Role broadcast: add to readBy if not already present
      if (!notification.readBy.some(id => id.toString() === userId.toString())) {
        notification.readBy.push(userId);
        await notification.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read.',
      data: {
        _id: notification._id.toString(),
        isRead: true
      }
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error updating notification status.'
    });
  }
};

/**
 * @desc    Mark all notifications as read for logged-in user
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private (All authenticated roles)
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // 1. Mark all direct notifications as read
    await Notification.updateMany(
      { recipientUserId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // 2. Add userId to readBy for all role-based notifications
    await Notification.updateMany(
      {
        recipientRole: { $in: [userRole, 'all'] },
        recipientUserId: null,
        isRead: false,
        readBy: { $ne: userId }
      },
      { $addToSet: { readBy: userId } }
    );

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read.'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error marking all notifications as read.'
    });
  }
};

module.exports = {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead
};
