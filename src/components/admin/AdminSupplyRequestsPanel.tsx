import React, { useState, useEffect, useMemo } from 'react';
import { SupplyRequest } from '../../types';
import { 
  getAllSupplyRequests, 
  approveSupplyRequest, 
  rejectSupplyRequest,
  fulfillSupplyRequest
} from '../../services/supplyRequestService';
import { 
  Pill, 
  Check, 
  X, 
  Clock, 
  RotateCcw, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  PackagePlus,
  ArrowRight,
  Sparkles,
  Edit2,
  Truck,
  Filter,
  PackageCheck
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { RequestStatusTracker } from '../clinician/RequestStatusTracker';
import { useTranslation } from '../../i18n';

interface AdminSupplyRequestsPanelProps {
  onRequestsUpdated?: () => void;
}

export const AdminSupplyRequestsPanel: React.FC<AdminSupplyRequestsPanelProps> = ({
  onRequestsUpdated
}) => {
  const { t, language } = useTranslation();
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED'>('ALL');

  // Approval Modal State
  const [approvingRequest, setApprovingRequest] = useState<SupplyRequest | null>(null);
  const [approvedQty, setApprovedQty] = useState<number>(100);
  const [adminApproveComment, setAdminApproveComment] = useState<string>('');
  const [isProcessingApprove, setIsProcessingApprove] = useState(false);

  // Rejection Modal State
  const [rejectingRequest, setRejectingRequest] = useState<SupplyRequest | null>(null);
  const [adminRejectComment, setAdminRejectComment] = useState<string>('');
  const [isProcessingReject, setIsProcessingReject] = useState(false);

  // Fulfilling State
  const [isFulfillingId, setIsFulfillingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await getAllSupplyRequests();
      setRequests(res.requests);
      setPendingCount(res.pendingCount);
    } catch (err: any) {
      console.error('Error fetching admin supply requests:', err);
      setError('Unable to load supply requests. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'ALL') return requests;
    return requests.filter(r => r.status === statusFilter);
  }, [requests, statusFilter]);

  const handleOpenApprove = (req: SupplyRequest) => {
    setApprovingRequest(req);
    setApprovedQty(req.requestedQuantity);
    setAdminApproveComment(`Approved for immediate regional redistribution to ${req.phcName}.`);
  };

  const handleConfirmApprove = async () => {
    if (!approvingRequest) return;
    setIsProcessingApprove(true);
    try {
      await approveSupplyRequest(approvingRequest._id, {
        approvedQuantity: approvedQty,
        adminComment: adminApproveComment
      });
      setApprovingRequest(null);
      await fetchRequests();
      if (onRequestsUpdated) {
        onRequestsUpdated();
      }
    } catch (err: any) {
      console.error('Failed to approve request:', err);
      alert('Failed to approve request: ' + err.message);
    } finally {
      setIsProcessingApprove(false);
    }
  };

  const handleOpenReject = (req: SupplyRequest) => {
    setRejectingRequest(req);
    setAdminRejectComment('Sufficient buffer stock available in neighboring facility; routine reorder scheduled.');
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequest) return;
    setIsProcessingReject(true);
    try {
      await rejectSupplyRequest(rejectingRequest._id, {
        adminComment: adminRejectComment
      });
      setRejectingRequest(null);
      await fetchRequests();
      if (onRequestsUpdated) {
        onRequestsUpdated();
      }
    } catch (err: any) {
      console.error('Failed to reject request:', err);
      alert('Failed to reject request: ' + err.message);
    } finally {
      setIsProcessingReject(false);
    }
  };

  const handleFulfill = async (reqId: string) => {
    setIsFulfillingId(reqId);
    try {
      await fulfillSupplyRequest(reqId);
      await fetchRequests();
      if (onRequestsUpdated) {
        onRequestsUpdated();
      }
    } catch (err: any) {
      console.error('Failed to fulfill request:', err);
      alert('Failed to fulfill request: ' + err.message);
    } finally {
      setIsFulfillingId(null);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shadow-xs">
              <PackagePlus className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {t('supplyRequest.adminReviewTitle')}
                </h3>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  {pendingCount} {t('supplyRequest.pending').toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'चिकित्सक द्वारा भेजे गए पुनःपूर्ति आदेश, जिन्हें केंद्रीय कमान से समीक्षा एवं अनुमोदन की आवश्यकता है'
                  : 'Clinician-submitted replenishment orders requiring Central Command triage & authorization'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              {(['ALL', 'PENDING', 'APPROVED', 'FULFILLED', 'REJECTED'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition cursor-pointer ${
                    statusFilter === tab
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {tab === 'ALL'
                    ? (language === 'hi' ? 'सभी' : 'ALL')
                    : tab === 'PENDING'
                    ? t('supplyRequest.pending')
                    : tab === 'APPROVED'
                    ? t('supplyRequest.approved')
                    : tab === 'FULFILLED'
                    ? t('supplyRequest.fulfilled')
                    : t('supplyRequest.rejected')}
                </button>
              ))}
            </div>

            <button
              onClick={fetchRequests}
              disabled={isLoading}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
              title="Refresh requests list"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content Table / Empty State */}
        {isLoading ? (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <span>{t('common.loading')}</span>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 text-center">
            {error}
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'वर्तमान स्थिति में कोई अनुरोध नहीं है। सभी निगरानी केंद्र सामान्य इन्वेंट्री स्तर पर कार्यरत हैं।'
              : `No supply requests matching status "${statusFilter}". All monitored PHCs are operating within target inventory levels.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[10px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th scope="col" className="px-3.5 py-2.5">{t('common.facility')}</th>
                  <th scope="col" className="px-3.5 py-2.5">{t('inventory.medicineName')}</th>
                  <th scope="col" className="px-3 py-2.5">{t('supplyRequest.requestedQuantity')}</th>
                  <th scope="col" className="px-3 py-2.5">{t('inventory.currentStock')}</th>
                  <th scope="col" className="px-3 py-2.5">{t('common.priority')}</th>
                  <th scope="col" className="px-3.5 py-2.5">{t('common.status')}</th>
                  <th scope="col" className="px-3.5 py-2.5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredRequests.map((req) => {
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isCritical = req.urgency === 'CRITICAL' || req.stockOutRisk === 'CRITICAL';

                  return (
                    <tr 
                      key={req._id} 
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 transition ${
                        isPending && isCritical ? 'bg-rose-50/20 dark:bg-rose-950/10' : ''
                      }`}
                    >
                      {/* PHC & Requester */}
                      <td className="px-3.5 py-3">
                        <div className="font-extrabold text-slate-900 dark:text-slate-100">
                          {req.phcName}
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          By: {req.clinicianName || (typeof req.requestedBy === 'object' ? req.requestedBy.name : 'Clinician')}
                        </span>
                      </td>

                      {/* Medicine */}
                      <td className="px-3.5 py-3 font-extrabold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-1.5">
                          <Pill className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                          <span>{req.medicine}</span>
                        </div>
                      </td>

                      {/* Requested Qty */}
                      <td className="px-3 py-3">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {req.requestedQuantity}
                        </span>
                        {req.approvedQuantity && (
                          <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                            Approved: {req.approvedQuantity}
                          </span>
                        )}
                      </td>

                      {/* Stock Context */}
                      <td className="px-3 py-3 text-[11px]">
                        <span className="text-slate-500 dark:text-slate-400 block">Stock: {req.currentStock}</span>
                        <span className="text-rose-600 dark:text-rose-400 font-bold block">
                          Runway: {req.daysRemaining ? `${req.daysRemaining}d` : '<2d'}
                        </span>
                      </td>

                      {/* Urgency */}
                      <td className="px-3 py-3">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                            req.urgency === 'CRITICAL'
                              ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                              : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          {req.urgency}
                        </span>
                      </td>

                      {/* Status Tracking */}
                      <td className="px-3.5 py-3 min-w-[160px]">
                        <RequestStatusTracker
                          status={req.status}
                          urgency={req.urgency}
                          transferredRecordId={req.transferredRecordId}
                          compact={true}
                        />
                        {req.adminComment && (
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-1 truncate" title={req.adminComment}>
                            Note: {req.adminComment}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-3.5 py-3 text-right whitespace-nowrap">
                        {isPending ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenApprove(req)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer"
                              title={t('supplyRequest.approveButton')}
                            >
                              <Check className="h-3 w-3" />
                              {t('common.confirm')}
                            </button>
                            <button
                              onClick={() => handleOpenReject(req)}
                              className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 font-bold text-[11px] transition cursor-pointer"
                              title={t('supplyRequest.rejectButton')}
                            >
                              <X className="h-3 w-3" />
                              {t('supplyRequest.rejected')}
                            </button>
                          </div>
                        ) : isApproved ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleFulfill(req._id)}
                              disabled={isFulfillingId === req._id}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs transition cursor-pointer disabled:opacity-60"
                              title="Mark as Dispatched & Fulfilled"
                            >
                              {isFulfillingId === req._id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Truck className="h-3 w-3" />
                              )}
                              {language === 'hi' ? 'स्टॉक प्रेषित करें' : 'Dispatch Stock'}
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                              req.status === 'FULFILLED'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : req.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {req.status === 'FULFILLED' ? t('supplyRequest.fulfilled') : req.status === 'REJECTED' ? t('supplyRequest.rejected') : req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      <Modal
        isOpen={Boolean(approvingRequest)}
        onClose={() => setApprovingRequest(null)}
        title={t('supplyRequest.approveButton')}
        subtitle={`${language === 'hi' ? 'प्रेषण अनुमोदन केंद्र:' : 'Dispatch authorization for'} ${approvingRequest?.phcName}`}
      >
        {approvingRequest && (
          <div className="space-y-4 text-xs">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 p-3 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">{t('inventory.medicineName')}:</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100">{approvingRequest.medicine}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">{t('supplyRequest.requestingPhc')}:</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{approvingRequest.phcName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">{t('forecast.daysRemaining')}:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{approvingRequest.daysRemaining} {language === 'hi' ? 'दिन' : 'Days'}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('supplyRequest.requestedQuantity')} ({t('common.units')})
              </label>
              <input
                type="number"
                min="1"
                value={approvedQty}
                onChange={(e) => setApprovedQty(Math.max(1, parseInt(e.target.value) || 0))}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 font-bold text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'व्यवस्थापक टिप्पणी / प्रेषण निर्देश' : 'Admin Comment / Dispatch Instructions'}
              </label>
              <textarea
                rows={2}
                value={adminApproveComment}
                onChange={(e) => setAdminApproveComment(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setApprovingRequest(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={isProcessingApprove}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessingApprove ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                {t('common.confirm')}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={Boolean(rejectingRequest)}
        onClose={() => setRejectingRequest(null)}
        title={t('supplyRequest.rejectButton')}
        subtitle={`${language === 'hi' ? 'अनुरोध अस्वीकृति:' : 'Decline replenishment order for'} ${rejectingRequest?.phcName}`}
      >
        {rejectingRequest && (
          <div className="space-y-4 text-xs">
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-3">
              <p className="text-rose-900 dark:text-rose-200">
                {language === 'hi'
                  ? `आप ${rejectingRequest.medicine} के ${rejectingRequest.requestedQuantity} इकाइयों के अनुरोध को अस्वीकृत करने जा रहे हैं।`
                  : `You are about to decline the request for ${rejectingRequest.requestedQuantity} units of ${rejectingRequest.medicine}.`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {language === 'hi' ? 'चिकित्सक के लिए अस्वीकृति का कारण' : 'Reason / Comment for Clinician'} <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={adminRejectComment}
                onChange={(e) => setAdminRejectComment(e.target.value)}
                placeholder={t('supplyRequest.rejectionReasonPlaceholder')}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingRequest(null)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 font-semibold cursor-pointer"
              >
                {t('common.cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={isProcessingReject || !adminRejectComment.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessingReject ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
                {t('supplyRequest.rejectButton')}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
