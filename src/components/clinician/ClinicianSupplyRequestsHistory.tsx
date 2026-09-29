import React, { useState, useEffect } from 'react';
import { SupplyRequest } from '../../types';
import { getMySupplyRequests } from '../../services/supplyRequestService';
import { 
  Pill, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertOctagon, 
  RotateCcw, 
  Building2, 
  Package, 
  Loader2,
  FileText
} from 'lucide-react';
import { RequestStatusTracker } from './RequestStatusTracker';
import { useTranslation } from '../../i18n';

interface ClinicianSupplyRequestsHistoryProps {
  refreshTrigger?: number;
}

export const ClinicianSupplyRequestsHistory: React.FC<ClinicianSupplyRequestsHistoryProps> = ({
  refreshTrigger
}) => {
  const { t, language } = useTranslation();
  const [requests, setRequests] = useState<SupplyRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMySupplyRequests();
      setRequests(data);
    } catch (err: any) {
      console.error('Error loading clinician supply requests:', err);
      setError(t('common.unableToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshTrigger]);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shadow-xs">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              {t('supplyRequest.historyTitle')} ({requests.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'केंद्रीय कमान को भेजे गए पुनःपूर्ति आदेशों की लाइव स्थिति ट्रैक करें'
                : 'Track real-time status of replenishment orders dispatched to Central Command'}
            </p>
          </div>
        </div>

        <button
          onClick={fetchRequests}
          disabled={isLoading}
          className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          title="Refresh requests"
        >
          <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{t('common.refresh')}</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
          <span>{t('common.loading')}</span>
        </div>
      ) : error ? (
        <div className="rounded-lg bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-800 dark:text-rose-200 text-center">
          {error}
        </div>
      ) : requests.length === 0 ? (
        <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
          {language === 'hi'
            ? 'कोई दवा आपूर्ति अनुरोध नहीं मिला। जब AI उच्च जोखिम वाली कमी की पहचान करे, तो पुनःपूर्ति के लिए "दवा आपूर्ति का अनुरोध करें" पर क्लिक करें।'
            : 'No medicine supply requests found. When AI flags high-risk shortages, click "Request Medicine Supply" to order replenishment.'}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[10px] text-slate-500 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-3.5 py-2.5">{t('inventory.medicineName')}</th>
                <th scope="col" className="px-3.5 py-2.5">{t('common.facility')}</th>
                <th scope="col" className="px-3 py-2.5">{t('common.quantity')}</th>
                <th scope="col" className="px-3 py-2.5">{t('common.priority')}</th>
                <th scope="col" className="px-3.5 py-2.5">{t('supplyRequest.clinicalJustification')}</th>
                <th scope="col" className="px-3 py-2.5">{t('common.date')}</th>
                <th scope="col" className="px-3.5 py-2.5 text-right">{t('common.status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {requests.map((req) => (
                <tr key={req._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <td className="px-3.5 py-3 font-extrabold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <Pill className="h-3.5 w-3.5 text-teal-600 shrink-0" />
                      <span>{req.medicine}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-3">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{req.phcName}</span>
                    <span className="block text-[10px] text-slate-400">{req.district || 'Guna'}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                      {req.requestedQuantity}
                    </span>
                    {req.approvedQuantity && req.approvedQuantity !== req.requestedQuantity && (
                      <span className="block text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {t('supplyRequest.approved')}: {req.approvedQuantity}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                        req.urgency === 'CRITICAL'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                          : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {req.urgency === 'CRITICAL' ? t('common.critical') : t('common.high')}
                    </span>
                  </td>
                  <td className="px-3.5 py-3 text-[11px] max-w-xs">
                    <div className="space-y-0.5">
                      <p className="text-slate-600 dark:text-slate-300 line-clamp-1" title={req.reason}>
                        {req.reason}
                      </p>
                      {req.adminComment && (
                        <p className="text-[10px] text-teal-700 dark:text-teal-400 font-semibold">
                          <strong>Admin:</strong> {req.adminComment}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-[11px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {new Date(req.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </td>
                  <td className="px-3.5 py-3 text-right min-w-[150px]">
                    <RequestStatusTracker
                      status={req.status}
                      urgency={req.urgency}
                      transferredRecordId={req.transferredRecordId}
                      compact={true}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
