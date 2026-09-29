import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { 
  Pill, 
  AlertTriangle, 
  Clock, 
  Sparkles, 
  Send, 
  ShieldAlert, 
  CheckCircle2, 
  Building2,
  Loader2,
  TrendingUp,
  Activity
} from 'lucide-react';
import { createSupplyRequest } from '../../services/supplyRequestService';
import { InventoryRiskLevel, SupplyRequestUrgency } from '../../types';
import { useTranslation } from '../../i18n';
import { useToast } from '../../context/ToastContext';

export interface RequestSupplyContext {
  phcId: string;
  phcName: string;
  district?: string;
  state?: string;
  medicine: string;
  currentStock: number;
  unit?: string;
  predictedDailyDemand?: number;
  predicted7DayDemand?: number;
  daysRemaining?: number;
  shortageQuantity?: number;
  stockOutRisk?: InventoryRiskLevel;
  reason?: string;
}

interface RequestSupplyModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: RequestSupplyContext | null;
  onSuccess?: () => void;
}

export const RequestSupplyModal: React.FC<RequestSupplyModalProps> = ({
  isOpen,
  onClose,
  context,
  onSuccess
}) => {
  const { t, language } = useTranslation();
  const { showToast } = useToast();
  const [requestedQuantity, setRequestedQuantity] = useState<number>(150);
  const [urgency, setUrgency] = useState<SupplyRequestUrgency>('HIGH');
  const [reason, setReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (context) {
      const defaultQty = context.shortageQuantity && context.shortageQuantity > 0 
        ? Math.ceil(context.shortageQuantity) 
        : 150;
      setRequestedQuantity(defaultQty);

      const defaultUrgency: SupplyRequestUrgency = 
        context.stockOutRisk === 'CRITICAL' ? 'CRITICAL' : 'HIGH';
      setUrgency(defaultUrgency);

      const defaultReason = context.reason 
        ? context.reason 
        : `AI model projected shortage of ${defaultQty} units due to upcoming patient consumption surge. Immediate replenishment requested for ${context.phcName}.`;
      setReason(defaultReason);

      setError(null);
      setIsSuccess(false);
    }
  }, [context, isOpen]);

  if (!context) return null;

  const unit = context.unit || 'units';
  const isCritical = context.stockOutRisk === 'CRITICAL';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedQuantity || requestedQuantity <= 0) {
      setError('Please enter a valid requested quantity greater than 0.');
      return;
    }
    if (!reason.trim()) {
      setError('Please provide a clinical justification or reason for the supply request.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await createSupplyRequest({
        phcId: context.phcId,
        phcName: context.phcName,
        district: context.district || 'Guna',
        state: context.state || 'Madhya Pradesh',
        medicine: context.medicine,
        currentStock: context.currentStock,
        predictedDailyDemand: context.predictedDailyDemand || 0,
        predicted7DayDemand: context.predicted7DayDemand || 0,
        daysRemaining: context.daysRemaining || 0,
        shortageQuantity: context.shortageQuantity || 0,
        stockOutRisk: context.stockOutRisk || 'HIGH',
        requestedQuantity: Number(requestedQuantity),
        urgency,
        reason: reason.trim()
      });

      setIsSuccess(true);
      showToast({
        type: 'success',
        title: language === 'hi' ? 'आपूर्ति अनुरोध सफलतापूर्वक प्रेषित' : 'Supply Request Submitted Successfully',
        message: `${context.phcName} • ${requestedQuantity} ${unit} ${context.medicine}`,
      });

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    } catch (err: any) {
      console.error('Failed to create supply request:', err);
      setError(err.message || 'Failed to submit supply request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('supplyRequest.requestSupply')}
      subtitle={t('supplyRequest.subtitle')}
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {t('supplyRequest.requestSubmittedSuccess')}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            {language === 'hi'
              ? `${context.medicine} की ${requestedQuantity} ${unit} के लिए आपका अनुरोध अनुमोदन एवं प्रेषण के लिए केंद्रीय चिकित्सा कमान को भेज दिया गया है।`
              : `Your request for ${requestedQuantity} ${unit} of ${context.medicine} has been transmitted to Central Medical Command for triage and dispatch approval.`}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Telemetry Context Box */}
          <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/80 bg-gradient-to-br from-teal-50/70 via-white to-cyan-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-teal-100 dark:border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 fill-current" />
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-teal-950 dark:text-teal-200 uppercase tracking-wider">
                    {language === 'hi' ? 'AI मांग टेलीमेट्री संदर्भ' : 'AI Demand Telemetry Context'}
                  </h4>
                  <p className="text-[10px] text-teal-700 dark:text-teal-400">FastAPI XGBoost Machine Learning Model</p>
                </div>
              </div>

              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 ${
                  isCritical
                    ? 'bg-rose-600 text-white animate-pulse'
                    : 'bg-amber-100 text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                <ShieldAlert className="h-3 w-3" />
                {context.stockOutRisk || 'HIGH'} {t('inventory.stockOutRisk')}
              </span>
            </div>

            {/* 4-Stat Context Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{t('inventory.currentStock')}</span>
                <span className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                  {context.currentStock} {unit}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{t('forecast.predicted7DayDemand')}</span>
                <span className="text-sm font-extrabold text-teal-700 dark:text-teal-400">
                  {context.predicted7DayDemand || Math.round(context.currentStock * 1.4)} {unit}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{t('forecast.daysRemaining')}</span>
                <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                  {context.daysRemaining ? `${context.daysRemaining} ${language === 'hi' ? 'दिन' : 'Days'}` : (language === 'hi' ? '< 3 दिन' : '< 3 Days')}
                </span>
              </div>

              <div className="p-2 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">{t('inventory.shortage')}</span>
                <span className="text-sm font-extrabold text-rose-700 dark:text-rose-300">
                  {context.shortageQuantity ? `${context.shortageQuantity} ${unit}` : `${requestedQuantity} ${unit}`}
                </span>
              </div>
            </div>

            {/* Target PHC Badge */}
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-1">
              <span className="flex items-center gap-1.5 font-medium">
                <Building2 className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                {t('common.facility')}: <strong className="text-slate-900 dark:text-slate-100">{context.phcName}</strong> ({context.district || 'Guna'})
              </span>
              <span className="text-[11px] font-semibold text-teal-700 dark:text-teal-400">
                {language === 'hi' ? 'नोड सत्यापित' : 'Node Verified'}
              </span>
            </div>
          </div>

          {/* Form Error Banner */}
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 p-3 text-xs text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Medicine Formulary (Auto-filled) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('inventory.medicineName')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={context.medicine}
                  disabled
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 cursor-not-allowed"
                />
                <Pill className="h-4 w-4 text-slate-400 absolute right-3 top-2.5" />
              </div>
            </div>

            {/* Requested Quantity */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t('supplyRequest.requestedQuantity')} ({unit}) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="10"
                value={requestedQuantity}
                onChange={(e) => setRequestedQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>

          {/* Urgency Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('supplyRequest.urgencyLevel')} <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('HIGH')}
                className={`px-3 py-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  urgency === 'HIGH'
                    ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-400 text-amber-900 dark:text-amber-200 shadow-xs'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {t('common.high')} ({language === 'hi' ? '48 घंटे प्रोटोकॉल' : '48h Protocol'})
              </button>

              <button
                type="button"
                onClick={() => setUrgency('CRITICAL')}
                className={`px-3 py-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  urgency === 'CRITICAL'
                    ? 'bg-rose-600 border-rose-700 text-white shadow-xs animate-pulse'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-rose-300" />
                {t('common.critical')} ({language === 'hi' ? '24 घंटे आपातकाल' : '24h Expedite'})
              </button>
            </div>
          </div>

          {/* Reason / Clinical Justification */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {t('supplyRequest.clinicalJustification')} <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder={language === 'hi' ? 'मांग का चिकित्सकीय कारण दर्ज करें (उदा. वायरल बुखार प्रकोप, ओपीडी वृद्धि)...' : 'Detail reasons for replenishment request (e.g. viral fever outbreak in outreach wards, sudden OPD surge)...'}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              {t('common.cancel')}
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white px-5 py-2 text-xs font-extrabold shadow-md transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('supplyRequest.submitting')}</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>{t('supplyRequest.submitRequest')}</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
