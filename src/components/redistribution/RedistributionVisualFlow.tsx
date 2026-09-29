import React from 'react';
import { RedistributionRecommendation } from '../../data/redistributionMockData';
import { Building2, ArrowRight, Truck, AlertTriangle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface RedistributionVisualFlowProps {
  selectedItem?: RedistributionRecommendation | null;
}

export const RedistributionVisualFlow: React.FC<RedistributionVisualFlowProps> = ({ selectedItem }) => {
  if (!selectedItem) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-xs text-slate-500 dark:text-slate-400 shadow-card">
        Select a redistribution recommendation below to inspect its route corridor and live transit flow.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-teal-200/80 dark:border-teal-800/60 bg-gradient-to-r from-teal-50/70 via-white to-cyan-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/40 p-5 shadow-card space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800 gap-1">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 dark:bg-teal-500 text-white text-xs font-bold">
            <Truck className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Active Rebalance Flow Diagram
          </h3>
        </div>
        <span className="text-[11px] font-bold text-teal-800 dark:text-teal-300 bg-teal-100/80 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-full border border-teal-200 dark:border-teal-800/60 self-start sm:self-auto">
          AI Route: {selectedItem.routeCorridor}
        </span>
      </div>

      {/* Visual Flow: Source PHC → Transfer → Destination PHC */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center py-2">
        {/* Node 1: Source PHC (Surplus) */}
        <div className="md:col-span-4 rounded-xl border-2 border-emerald-200 dark:border-emerald-800/80 bg-white dark:bg-slate-900 p-4 shadow-subtle flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60">
              Source Facility (Surplus)
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-tight">{selectedItem.sourcePhc}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400" />
              {selectedItem.sourceDistrict}, {selectedItem.sourceState}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Available Surplus:</span>
            <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
              +{selectedItem.sourceSurplus} {selectedItem.unit}
            </span>
          </div>
        </div>

        {/* Node 2: Transfer Conveyor Node */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-800 dark:text-teal-300 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full border border-teal-300 dark:border-teal-700 shadow-sm">
            <Truck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 animate-bounce" />
            <span>Transfer {selectedItem.recommendedQuantity} {selectedItem.unit}</span>
          </div>

          <div className="hidden md:flex items-center w-full px-2">
            <div className="h-0.5 w-full bg-teal-400 dark:bg-teal-600 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400">
                <ArrowRight className="h-4 w-4 -mr-1" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
            <span>{selectedItem.estimatedDistanceKm} km</span> • <span>ETA: {selectedItem.estimatedTransitTime}</span>
          </div>
        </div>

        {/* Node 3: Destination PHC (Shortage) */}
        <div className="md:col-span-4 rounded-xl border-2 border-rose-200 dark:border-rose-800/80 bg-white dark:bg-slate-900 p-4 shadow-subtle flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800/60">
              Destination Facility (Deficit)
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-tight">{selectedItem.destinationPhc}</h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400" />
              {selectedItem.destinationDistrict}, {selectedItem.destinationState}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Predicted Shortage:</span>
            <span className="font-extrabold text-rose-600 dark:text-rose-400">
              -{selectedItem.destinationShortage} {selectedItem.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
