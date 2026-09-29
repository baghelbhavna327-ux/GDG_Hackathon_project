import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { RedistributionRecommendation } from '../../data/redistributionMockData';
import { 
  Truck, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  Pill, 
  AlertTriangle,
  Check
} from 'lucide-react';
import { useTranslation } from '../../i18n';

interface RedistributionModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: RedistributionRecommendation | null;
  mode?: 'details' | 'accept';
}

export const RedistributionModal: React.FC<RedistributionModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  mode = 'accept',
}) => {
  const { t, language } = useTranslation();
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!recommendation) return null;

  const handleConfirm = () => {
    setIsConfirmed(true);
    setTimeout(() => {
      setIsConfirmed(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setIsConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'accept' ? t('redistribution.modalTitle') : t('redistribution.title')}
      subtitle={`Protocol Code: ${recommendation.code} • Autonomous Neural Recommendation`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-sm">
        {isConfirmed ? (
          <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-emerald-950 dark:text-emerald-200 text-base">
              {language === 'hi' ? 'ट्रांसफर अनुशंसा अधिकृत की गई!' : 'Transfer Recommendation Authorized!'}
            </h4>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              {language === 'hi'
                ? `प्रेषण आदेश क्षेत्रीय मेडिकल कूरियर बेड़े को सौंपा गया। ट्रैकिंग आईडी: `
                : `Dispatch order assigned to Regional Medical Courier Fleet. Tracking ID: `}
              <strong>MED-TR-8891</strong>.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              {language === 'hi'
                ? `${recommendation.sourcePhc} से ${recommendation.routeCorridor} मार्ग द्वारा वाहन रवाना किया गया।`
                : `Ambulance/convoy dispatched from ${recommendation.sourcePhc} via ${recommendation.routeCorridor}.`}
            </p>
          </div>
        ) : (
          <>
            {/* Route Summary */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t('redistribution.medicine')}</span>
                <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{recommendation.resource}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Source */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">{t('redistribution.donorPhc')}:</span>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{recommendation.sourcePhc}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{recommendation.sourceDistrict}, {recommendation.sourceState}</p>
                  <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    {language === 'hi' ? 'उपलब्ध अधिशेष:' : 'Available Surplus:'} +{recommendation.sourceSurplus} {recommendation.unit}
                  </p>
                </div>

                {/* Destination */}
                <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">{t('redistribution.recipientPhc')}:</span>
                  <p className="font-extrabold text-slate-900 dark:text-slate-100 mt-0.5">{recommendation.destinationPhc}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{recommendation.destinationDistrict}, {recommendation.destinationState}</p>
                  <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1">
                    {language === 'hi' ? 'दवा घाटा:' : 'Shortage:'} -{recommendation.destinationShortage} {recommendation.unit}
                  </p>
                </div>
              </div>

              {/* Quantity & Distance */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">{t('redistribution.quantity')}:</span>
                  <span className="text-lg font-extrabold text-teal-800 dark:text-teal-300">
                    {recommendation.recommendedQuantity} {recommendation.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block">{t('redistribution.distance')} & {t('redistribution.eta')}:</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {recommendation.estimatedDistanceKm} km ({recommendation.estimatedTransitTime})
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Reason */}
            <div className="rounded-lg bg-teal-50 dark:bg-teal-950/50 p-3 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-950 dark:text-teal-200 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-teal-900 dark:text-teal-200">
                <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                {language === 'hi' ? 'AI विश्लेषणात्मक तर्क:' : 'Inference Protocol Rationale:'}
              </p>
              <p className="text-teal-900 dark:text-teal-300 leading-relaxed">
                "{recommendation.reason}"
              </p>
              <p className="text-[11px] text-teal-700 dark:text-teal-400 font-semibold pt-1">
                {language === 'hi'
                  ? `चिकित्सीय प्रभाव: लगभग ${recommendation.patientsProtected} मरीजों को शून्य स्टॉक संकट से बचाता है।`
                  : `Clinical Impact: Protects approximately ${recommendation.patientsProtected} patients from zero-stockout crisis.`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {t('common.close')}
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 dark:bg-teal-500 px-5 py-2 text-xs font-extrabold text-white hover:bg-teal-700 dark:hover:bg-teal-600 shadow-sm transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                {t('redistribution.modalConfirm')}
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
