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
      title={mode === 'accept' ? 'Authorize AI Resource Redistribution' : 'Redistribution Recommendation Analysis'}
      subtitle={`Protocol Code: ${recommendation.code} • Autonomous Neural Recommendation`}
      maxWidth="lg"
    >
      <div className="space-y-4 text-sm">
        {isConfirmed ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-6 w-6" />
            </div>
            <h4 className="font-extrabold text-emerald-950 text-base">Transfer Recommendation Authorized!</h4>
            <p className="text-xs text-emerald-800">
              Dispatch order assigned to Regional Medical Courier Fleet. Tracking ID: <strong>MED-TR-8891</strong>.
            </p>
            <p className="text-[11px] text-slate-500 mt-2">
              Ambulance/convoy dispatched from {recommendation.sourcePhc} via {recommendation.routeCorridor}.
            </p>
          </div>
        ) : (
          <>
            {/* Route Summary */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">Resource</span>
                <span className="font-extrabold text-slate-900 text-sm">{recommendation.resource}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Source */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">Source (Surplus):</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{recommendation.sourcePhc}</p>
                  <p className="text-[11px] text-slate-500">{recommendation.sourceDistrict}, {recommendation.sourceState}</p>
                  <p className="text-[11px] font-bold text-emerald-700 mt-1">Available Surplus: +{recommendation.sourceSurplus} {recommendation.unit}</p>
                </div>

                {/* Destination */}
                <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                  <span className="text-[10px] font-bold text-rose-700 uppercase">Destination (Deficit):</span>
                  <p className="font-extrabold text-slate-900 mt-0.5">{recommendation.destinationPhc}</p>
                  <p className="text-[11px] text-slate-500">{recommendation.destinationDistrict}, {recommendation.destinationState}</p>
                  <p className="text-[11px] font-bold text-rose-600 mt-1">Shortage: -{recommendation.destinationShortage} {recommendation.unit}</p>
                </div>
              </div>

              {/* Quantity & Distance */}
              <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                <div>
                  <span className="text-slate-500 block">Recommended Transfer:</span>
                  <span className="text-lg font-extrabold text-teal-800">
                    {recommendation.recommendedQuantity} {recommendation.unit}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Route Distance & ETA:</span>
                  <span className="text-sm font-bold text-slate-900">
                    {recommendation.estimatedDistanceKm} km ({recommendation.estimatedTransitTime})
                  </span>
                </div>
              </div>
            </div>

            {/* Clinical Reason */}
            <div className="rounded-lg bg-teal-50 p-3 border border-teal-200 text-xs text-teal-950 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-teal-600" />
                Inference Protocol Rationale:
              </p>
              <p className="text-teal-900 leading-relaxed">
                "{recommendation.reason}"
              </p>
              <p className="text-[11px] text-teal-700 font-semibold pt-1">
                Clinical Impact: Protects approximately <strong>{recommendation.patientsProtected} patients</strong> from zero-stockout crisis.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-5 py-2 text-xs font-extrabold text-white hover:bg-teal-700 shadow-sm transition"
              >
                <CheckCircle2 className="h-4 w-4" />
                Confirm & Authorize Transfer
              </button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
