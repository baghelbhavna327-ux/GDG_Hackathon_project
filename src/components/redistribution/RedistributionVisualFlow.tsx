import React from 'react';
import { RedistributionRecommendation } from '../../data/redistributionMockData';
import { Building2, ArrowRight, Truck, AlertTriangle, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';

interface RedistributionVisualFlowProps {
  selectedItem?: RedistributionRecommendation | null;
}

export const RedistributionVisualFlow: React.FC<RedistributionVisualFlowProps> = ({ selectedItem }) => {
  if (!selectedItem) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-xs text-slate-500 shadow-card">
        Select a redistribution recommendation below to inspect its route corridor and live transit flow.
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-white to-cyan-50/70 p-5 shadow-card space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/60 gap-1">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-600 text-white text-xs font-bold">
            <Truck className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
            Active Rebalance Flow Diagram
          </h3>
        </div>
        <span className="text-[11px] font-bold text-teal-800 bg-teal-100/80 px-2.5 py-0.5 rounded-full border border-teal-200 self-start sm:self-auto">
          AI Route: {selectedItem.routeCorridor}
        </span>
      </div>

      {/* Visual Flow: Source PHC → Transfer → Destination PHC */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center py-2">
        {/* Node 1: Source PHC (Surplus) */}
        <div className="md:col-span-4 rounded-xl border-2 border-emerald-200 bg-white p-4 shadow-subtle flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Source Facility (Surplus)
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{selectedItem.sourcePhc}</h4>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400" />
              {selectedItem.sourceDistrict}, {selectedItem.sourceState}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Available Surplus:</span>
            <span className="font-extrabold text-emerald-700">
              +{selectedItem.sourceSurplus} {selectedItem.unit}
            </span>
          </div>
        </div>

        {/* Node 2: Transfer Conveyor Node */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-2 text-center space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-teal-800 bg-white px-3 py-1.5 rounded-full border border-teal-300 shadow-sm">
            <Truck className="h-3.5 w-3.5 text-teal-600 animate-bounce" />
            <span>Transfer {selectedItem.recommendedQuantity} {selectedItem.unit}</span>
          </div>

          <div className="hidden md:flex items-center w-full px-2">
            <div className="h-0.5 w-full bg-teal-400 relative">
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-teal-600">
                <ArrowRight className="h-4 w-4 -mr-1" />
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-600 font-medium">
            <span>{selectedItem.estimatedDistanceKm} km</span> • <span>ETA: {selectedItem.estimatedTransitTime}</span>
          </div>
        </div>

        {/* Node 3: Destination PHC (Shortage) */}
        <div className="md:col-span-4 rounded-xl border-2 border-rose-200 bg-white p-4 shadow-subtle flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Destination Facility (Deficit)
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>

          <div>
            <h4 className="font-extrabold text-slate-900 text-sm leading-tight">{selectedItem.destinationPhc}</h4>
            <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-slate-400" />
              {selectedItem.destinationDistrict}, {selectedItem.destinationState}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">Predicted Shortage:</span>
            <span className="font-extrabold text-rose-600">
              -{selectedItem.destinationShortage} {selectedItem.unit}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
