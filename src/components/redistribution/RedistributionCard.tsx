import React from 'react';
import { RedistributionRecommendation } from '../../data/redistributionMockData';
import { 
  ArrowRight, 
  Truck, 
  MapPin, 
  Pill, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Clock,
  Sparkles,
  ChevronRight
} from 'lucide-react';

interface RedistributionCardProps {
  item: RedistributionRecommendation;
  isSelected?: boolean;
  onSelectFlow?: (item: RedistributionRecommendation) => void;
  onViewDetails: (item: RedistributionRecommendation) => void;
  onAcceptRecommendation: (item: RedistributionRecommendation) => void;
}

export const RedistributionCard: React.FC<RedistributionCardProps> = ({
  item,
  isSelected,
  onSelectFlow,
  onViewDetails,
  onAcceptRecommendation,
}) => {
  const getPriorityBadge = (priority: RedistributionRecommendation['priority']) => {
    switch (priority) {
      case 'EMERGENCY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            EMERGENCY PRIORITY
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
            HIGH PRIORITY
          </span>
        );
      case 'ROUTINE':
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            ROUTINE TRANSFER
          </span>
        );
    }
  };

  return (
    <div 
      onClick={() => onSelectFlow && onSelectFlow(item)}
      className={`rounded-xl border transition-all duration-200 bg-white p-5 shadow-card hover:shadow-elevated cursor-pointer flex flex-col justify-between ${
        isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-200 hover:border-teal-300'
      }`}
    >
      {/* Card Header */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-50 text-teal-700 font-bold text-xs">
              <Pill className="h-4 w-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                RESOURCE REDISTRIBUTION
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm">{item.resource}</h4>
            </div>
          </div>
          {getPriorityBadge(item.priority)}
        </div>

        {/* FROM vs TO Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-1">
          {/* FROM: Source PHC */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block mb-0.5">
              FROM:
            </span>
            <p className="font-extrabold text-slate-900 text-xs truncate">{item.sourcePhc}</p>
            <p className="text-[11px] text-slate-500">{item.sourceDistrict}, {item.sourceState}</p>
            <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Surplus Stock:</span>
              <span className="font-bold text-emerald-700">+{item.sourceSurplus} {item.unit}</span>
            </div>
          </div>

          {/* TO: Destination PHC */}
          <div className="rounded-lg bg-slate-50 p-3 border border-slate-100">
            <span className="text-[10px] font-extrabold text-rose-700 uppercase tracking-wider block mb-0.5">
              TO:
            </span>
            <p className="font-extrabold text-slate-900 text-xs truncate">{item.destinationPhc}</p>
            <p className="text-[11px] text-slate-500">{item.destinationDistrict}, {item.destinationState}</p>
            <div className="mt-2 pt-1 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Predicted Shortage:</span>
              <span className="font-bold text-rose-600">-{item.destinationShortage} {item.unit}</span>
            </div>
          </div>
        </div>

        {/* RECOMMENDED TRANSFER Banner */}
        <div className="rounded-lg bg-teal-50 p-3 border border-teal-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-extrabold text-teal-800 uppercase tracking-wider block">
              RECOMMENDED TRANSFER:
            </span>
            <span className="font-extrabold text-teal-950 text-base">
              {item.recommendedQuantity} {item.unit}
            </span>
          </div>
          <div className="text-right text-xs">
            <span className="text-slate-500 block text-[10px]">Estimated Distance</span>
            <span className="font-bold text-slate-900">{item.estimatedDistanceKm} km ({item.estimatedTransitTime})</span>
          </div>
        </div>

        {/* Reason */}
        <div className="text-xs text-slate-600 pt-1">
          <p className="leading-relaxed">
            <strong className="text-slate-900">Reason:</strong> "{item.reason}"
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(item);
          }}
          className="rounded-lg border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 transition"
        >
          View Details
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onAcceptRecommendation(item);
          }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-extrabold text-white hover:bg-teal-700 transition shadow-sm"
        >
          <CheckCircle2 className="h-4 w-4" />
          Accept Recommendation
        </button>
      </div>
    </div>
  );
};
