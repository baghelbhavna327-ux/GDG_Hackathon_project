const { SupplyRequest, AuditLog, Transfer } = require('../models');
const { notifyAdmins, notifyUser } = require('../utils/notificationHelper');

/**
 * @desc    Create a new medicine supply request (Clinician/Admin)
 * @route   POST /api/supply-requests
 * @access  Private (Health Worker, Admin)
 */
const createSupplyRequest = async (req, res) => {
  try {
    const {
      phcId,
      phcName,
      district,
      state,
      medicine,
      currentStock,
      predictedDailyDemand,
      predicted7DayDemand,
      daysRemaining,
      shortageQuantity,
      stockOutRisk,
      requestedQuantity,
      urgency,
      reason
    } = req.body;

    // 1. Validation
    if (!medicine || !medicine.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Medicine name is required.'
      });
    }

    if (!phcName || !phcName.trim()) {
      return res.status(400).json({
        success: false,
        error: 'PHC facility name is required.'
      });
    }

    const qty = Number(requestedQuantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Requested quantity must be a positive number greater than 0.'
      });
    }

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Clinical justification / reason is required.'
      });
    }

    // 2. Create Supply Request
    const supplyRequest = await SupplyRequest.create({
      requestedBy: req.user._id,
      clinicianId: req.user._id.toString(),
      clinicianName: req.user.name || 'Authorized Clinician',
      phcId: phcId || 'phc-01',
      phcName: phcName.trim(),
      district: district || 'Guna',
      state: state || 'Madhya Pradesh',
      medicine: medicine.trim(),
      currentStock: Number(currentStock) || 0,
      predictedDailyDemand: Number(predictedDailyDemand) || 0,
      predicted7DayDemand: Number(predicted7DayDemand) || 0,
      daysRemaining: Number(daysRemaining) || 0,
      shortageQuantity: Number(shortageQuantity) || 0,
      stockOutRisk: stockOutRisk || 'HIGH',
      requestedQuantity: qty,
      urgency: urgency || (stockOutRisk === 'CRITICAL' ? 'CRITICAL' : 'HIGH'),
      reason: reason.trim(),
      status: 'PENDING'
    });

    // 3. Log Audit Trail
    try {
      await AuditLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'SUPPLY_REQUEST_CREATED',
        resourceType: 'SupplyRequest',
        resourceId: supplyRequest._id.toString(),
        details: `Clinician requested ${qty} units of ${medicine} for ${phcName} (${urgency || 'HIGH'} urgency)`
      });
    } catch (auditErr) {
      console.warn('AuditLog non-fatal warning:', auditErr.message);
    }

    // 4. Send Real-time Notification to Admins
    try {
      await notifyAdmins({
        type: 'SUPPLY_REQUEST',
        title: 'New Medicine Supply Request',
        message: `${phcName} requested ${qty} units of ${medicine}. Risk: ${stockOutRisk || urgency || 'HIGH'}.`,
        relatedEntityId: supplyRequest._id.toString(),
        relatedEntityType: 'SupplyRequest',
        actionUrl: '/admin/dashboard',
        metadata: {
          supplyRequestId: supplyRequest._id.toString(),
          medicine: supplyRequest.medicine,
          requestedQuantity: qty,
          phcName: supplyRequest.phcName,
          urgency: supplyRequest.urgency,
          clinicianName: req.user.name
        }
      });
    } catch (notifErr) {
      console.warn('Notification non-fatal warning:', notifErr.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Medicine supply request submitted successfully.',
      data: supplyRequest
    });
  } catch (error) {
    console.error('Error creating supply request:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error creating supply request.'
    });
  }
};

/**
 * @desc    Get clinician's own supply requests
 * @route   GET /api/supply-requests/my
 * @access  Private (Health Worker, Admin)
 */
const getMySupplyRequests = async (req, res) => {
  try {
    const requests = await SupplyRequest.find({ requestedBy: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching clinician supply requests:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching supply requests.'
    });
  }
};

/**
 * @desc    Get all supply requests (Admin)
 * @route   GET /api/supply-requests
 * @access  Private (Admin)
 */
const getAllSupplyRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && ['PENDING', 'APPROVED', 'REJECTED', 'FULFILLED'].includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const requests = await SupplyRequest.find(filter)
      .populate('requestedBy', 'name email role facility')
      .sort({ createdAt: -1 })
      .lean();

    const pendingCount = await SupplyRequest.countDocuments({ status: 'PENDING' });
    const approvedCount = await SupplyRequest.countDocuments({ status: 'APPROVED' });
    const fulfilledCount = await SupplyRequest.countDocuments({ status: 'FULFILLED' });

    return res.status(200).json({
      success: true,
      count: requests.length,
      counts: {
        pending: pendingCount,
        approved: approvedCount,
        fulfilled: fulfilledCount,
        total: requests.length
      },
      data: requests
    });
  } catch (error) {
    console.error('Error fetching all supply requests:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fetching all supply requests.'
    });
  }
};

/**
 * @desc    Get single supply request details
 * @route   GET /api/supply-requests/:id
 * @access  Private
 */
const getSupplyRequestById = async (req, res) => {
  try {
    const request = await SupplyRequest.findById(req.params.id)
      .populate('requestedBy', 'name email role facility')
      .lean();

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Supply request not found.'
      });
    }

    // Role check: Clinicians can only view their own requests, Admin can view any
    if (req.user.role !== 'admin' && request.requestedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this supply request.'
      });
    }

    return res.status(200).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching supply request by ID:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error retrieving supply request details.'
    });
  }
};

/**
 * @desc    Approve a supply request (Admin)
 * @route   PATCH /api/supply-requests/:id/approve
 * @access  Private (Admin)
 */
const approveSupplyRequest = async (req, res) => {
  try {
    const { approvedQuantity, adminComment, createRedistributionTransfer } = req.body;

    const request = await SupplyRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Supply request not found.'
      });
    }

    if (request.status === 'APPROVED' || request.status === 'FULFILLED') {
      return res.status(400).json({
        success: false,
        error: `Supply request is already in ${request.status} status.`
      });
    }

    const finalApprovedQty = Number(approvedQuantity) > 0 ? Number(approvedQuantity) : request.requestedQuantity;

    request.status = 'APPROVED';
    request.approvedQuantity = finalApprovedQty;
    request.adminComment = adminComment ? adminComment.trim() : 'Approved by Central Health Authority for immediate regional replenishment.';

    // Optional: Connect to Redistribution Transfer model
    if (createRedistributionTransfer !== false) {
      try {
        const transfer = await Transfer.create({
          fromPHC: 'Central Medical Depot (PHC-B)',
          fromDistrict: 'Bhopal',
          toPHC: request.phcName,
          toDistrict: request.district || 'Guna',
          medicine: request.medicine,
          surplus: finalApprovedQty * 2,
          predictedShortage: request.shortageQuantity || finalApprovedQty,
          recommendedQuantity: finalApprovedQty,
          priority: request.urgency === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
          distanceKm: 42.5,
          estTime: '~1h 30m',
          reason: `Supply Request Approved: ${request.reason}`,
          status: 'PENDING'
        });
        request.transferredRecordId = transfer._id.toString();
      } catch (trfErr) {
        console.warn('Non-fatal Transfer record creation note:', trfErr.message);
      }
    }

    await request.save();

    // Log Audit
    try {
      await AuditLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'SUPPLY_REQUEST_APPROVED',
        resourceType: 'SupplyRequest',
        resourceId: request._id.toString(),
        details: `Admin approved request for ${finalApprovedQty} units of ${request.medicine} to ${request.phcName}`
      });
    } catch (auditErr) {
      console.warn('AuditLog note:', auditErr.message);
    }

    // Send Real-time Notification to Requesting Clinician
    try {
      const recipientId = request.requestedBy || request.clinicianId;
      if (recipientId) {
        await notifyUser(recipientId, {
          type: 'SUPPLY_APPROVED',
          title: 'Medicine Supply Request Approved',
          message: `Your request for ${finalApprovedQty} units of ${request.medicine} for ${request.phcName} has been approved.`,
          relatedEntityId: request._id.toString(),
          relatedEntityType: 'SupplyRequest',
          actionUrl: '/clinician',
          metadata: {
            supplyRequestId: request._id.toString(),
            approvedQuantity: finalApprovedQty,
            medicine: request.medicine,
            phcName: request.phcName,
            adminComment: request.adminComment
          }
        });
      }
    } catch (notifErr) {
      console.warn('Notification warning:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Supply request approved successfully.',
      data: request
    });
  } catch (error) {
    console.error('Error approving supply request:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error approving supply request.'
    });
  }
};

/**
 * @desc    Reject a supply request (Admin)
 * @route   PATCH /api/supply-requests/:id/reject
 * @access  Private (Admin)
 */
const rejectSupplyRequest = async (req, res) => {
  try {
    const { adminComment } = req.body;

    const request = await SupplyRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Supply request not found.'
      });
    }

    if (request.status === 'REJECTED') {
      return res.status(400).json({
        success: false,
        error: 'Supply request is already rejected.'
      });
    }

    request.status = 'REJECTED';
    request.adminComment = adminComment ? adminComment.trim() : 'Request declined based on regional inventory thresholds or buffer availability.';

    await request.save();

    // Log Audit
    try {
      await AuditLog.create({
        userId: req.user._id,
        userName: req.user.name,
        userRole: req.user.role,
        action: 'SUPPLY_REQUEST_REJECTED',
        resourceType: 'SupplyRequest',
        resourceId: request._id.toString(),
        details: `Admin rejected supply request for ${request.medicine} to ${request.phcName}. Comment: ${request.adminComment}`
      });
    } catch (auditErr) {
      console.warn('AuditLog note:', auditErr.message);
    }

    // Send Real-time Notification to Requesting Clinician
    try {
      const recipientId = request.requestedBy || request.clinicianId;
      if (recipientId) {
        await notifyUser(recipientId, {
          type: 'SUPPLY_REJECTED',
          title: 'Medicine Supply Request Rejected',
          message: `Your request for ${request.requestedQuantity} units of ${request.medicine} was not approved.${request.adminComment ? ` Note: ${request.adminComment}` : ''}`,
          relatedEntityId: request._id.toString(),
          relatedEntityType: 'SupplyRequest',
          actionUrl: '/clinician',
          metadata: {
            supplyRequestId: request._id.toString(),
            medicine: request.medicine,
            phcName: request.phcName,
            adminComment: request.adminComment
          }
        });
      }
    } catch (notifErr) {
      console.warn('Notification warning:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Supply request rejected.',
      data: request
    });
  } catch (error) {
    console.error('Error rejecting supply request:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Server error rejecting supply request.'
    });
  }
};

/**
 * @desc    Mark supply request as fulfilled (Admin)
 * @route   PATCH /api/supply-requests/:id/fulfill
 * @access  Private (Admin)
 */
const fulfillSupplyRequest = async (req, res) => {
  try {
    const request = await SupplyRequest.findById(req.params.id);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Supply request not found.'
      });
    }

    request.status = 'FULFILLED';
    await request.save();

    // Send Real-time Notification to Requesting Clinician
    try {
      const recipientId = request.requestedBy || request.clinicianId;
      if (recipientId) {
        await notifyUser(recipientId, {
          type: 'SUPPLY_FULFILLED',
          title: 'Medicine Supply Dispatched & Fulfilled',
          message: `Supply replenishment of ${request.approvedQuantity || request.requestedQuantity} units of ${request.medicine} has been dispatched to ${request.phcName}.`,
          relatedEntityId: request._id.toString(),
          relatedEntityType: 'SupplyRequest',
          actionUrl: '/clinician',
          metadata: {
            supplyRequestId: request._id.toString(),
            medicine: request.medicine,
            phcName: request.phcName
          }
        });
      }
    } catch (notifErr) {
      console.warn('Notification warning:', notifErr.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Supply request marked as fulfilled.',
      data: request
    });
  } catch (error) {
    console.error('Error fulfilling supply request:', error);
    return res.status(500).json({
      success: false,
      error: 'Server error fulfilling supply request.'
    });
  }
};

module.exports = {
  createSupplyRequest,
  getMySupplyRequests,
  getAllSupplyRequests,
  getSupplyRequestById,
  approveSupplyRequest,
  rejectSupplyRequest,
  fulfillSupplyRequest
};
