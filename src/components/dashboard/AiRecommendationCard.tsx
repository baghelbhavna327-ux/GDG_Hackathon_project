import React, { useState } from 'react';
import { mockAiRecommendation } from '../../data/mockData';
import { 
  Sparkles, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  ShieldCheck, 
  ExternalLink,
  Layers,
  Clock,
  Check
} from 'lucide-react';
import { Modal } from '../common/Modal';

interface AiRecommendationCardProps {
  recommendation?: typeof mockAiRecommendation;
  onExecuteDispatch?: (recommendation: typeof mockAiRecommendation) => void;
}

export const AiRecommendationCard: React.FC<AiRecommendationCardProps> = ({ 
  recommendation = mockAiRecommendation,
  onExecuteDispatch 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDispatched, setIsDispatched] = useState(false);
  const rec = recommendation;

  const handleDispatch = () => {
    setIsDispatched(true);
    if (onExecuteDispatch) {
      onExecuteDispatch(rec);
    }
    setTimeout(() => {
      setIsModalOpen(false);
    }, 1500);
  };

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border-2 border-teal-500/80 bg-gradient-to-br from-teal-900 via-teal-950 to-slate-950 text-white p-4 sm:p-5 shadow-xl transition hover:border-teal-400">
        {/* Subtle Background Glow */}
        <div className="absolute -right-12 -bottom-12 h-64 w-64 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3.5">
          <div className="space-y-2.5">
            {/* Header / Confidence Tag */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-teal-500 text-slate-950 shadow-xs shrink-0">
                  <Sparkles className="h-3 w-3 fill-current" />
                </span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-teal-300">
                  AI Redistribution Recommendation
                </span>
              </div>
              <span className="text-[10px] font-bold bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded-full border border-teal-700/80 shrink-0">
                {rec.confidenceScore}% Confidence
              </span>
            </div>

            {/* Recommendation Title */}
            <div>
              <div className="text-[11px] font-semibold text-teal-300 uppercase tracking-wider">
                Transfer {rec.quantity} {rec.unit}
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug truncate" title={rec.item}>
                {rec.item}
              </h3>
            </div>

            {/* FROM -> TO Route Grid */}
            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/50 border border-teal-500/20 text-xs">
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 block">FROM</span>
                <p className="font-bold text-white text-xs truncate" title={rec.fromFacility}>
                  {rec.fromFacility}
                </p>
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block">TO</span>
                <p className="font-bold text-white text-xs truncate" title={rec.toFacility}>
                  {rec.toFacility}
                </p>
              </div>
            </div>

            {/* Reason */}
            <div className="text-xs text-slate-300 leading-relaxed">
              <span className="text-teal-300 font-bold uppercase text-[10px] tracking-wide block mb-0.5">WHY?</span>
              <p className="text-slate-300 text-xs line-clamp-2 leading-normal">
                {rec.reason}
              </p>
            </div>
          </div>

          {/* Action Trigger Button & ETA Footer */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-teal-800/50">
            <span className="text-[11px] text-teal-300/90 font-medium flex items-center gap-1.5 justify-center sm:justify-start truncate">
              <Clock className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              ETA: {rec.transitEta}
            </span>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-400 to-cyan-400 px-4 py-2 text-xs font-extrabold text-slate-950 hover:from-teal-300 hover:to-cyan-300 transition shadow-md hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
            >
              <Truck className="h-3.5 w-3.5" />
              View Recommendation
            </button>
          </div>
        </div>
      </div>

      {/* Detailed Recommendation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="AI Redistribution Recommendation Analysis"
        subtitle="Autonomous load balancing recommendation generated by Neural Engine v4.2"
        maxWidth="lg"
      >
        <div className="space-y-4 text-sm">
          {isDispatched ? (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/40 p-6 text-center space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400">
                <Check className="h-6 w-6" />
              </div>
              <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-base">Redistribution Dispatched Successfully!</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                Dispatched 150 units of Paracetamol from PHC-B to Guna PHC-04. Dispatch Code: <strong>MED-TR-7721</strong>.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 p-4 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Resource Requested:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{mockAiRecommendation.item}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Recommended Quantity:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">150 Units (1,500 Tablets)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Source Depot:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-400">PHC-B (Central Medical Store Depot)</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Receiving Center:</span>
                  <span className="font-bold text-rose-700 dark:text-rose-400">Guna PHC-04</span>
                </div>
              </div>

              <div className="rounded-lg bg-teal-50 dark:bg-teal-950/50 p-3 border border-teal-200 dark:border-teal-800/60 text-xs text-teal-900 dark:text-teal-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-teal-900 dark:text-teal-200">
                  <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Clinical & Logistical Rationale:
                </p>
                <p className="text-teal-800 dark:text-teal-300 leading-relaxed">
                  {mockAiRecommendation.reason}. Guna PHC-04 stock is projected to reach absolute zero in 3.2 days without intervention. PHC-B holds 1,800 units buffer capacity (well above safety line).
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Transit Estimate: <strong>{mockAiRecommendation.transitEta}</strong>
                </span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">Impact: 100% Stockout Averted</span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDispatch}
                  className="inline-flex items-center gap-2 rounded-lg bg-teal-600 dark:bg-teal-500 px-5 py-2 text-xs font-bold text-white hover:bg-teal-700 dark:hover:bg-teal-600 shadow-sm transition"
                >
                  <Truck className="h-4 w-4" />
                  Confirm & Dispatch Transfer
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
};
