import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Truck, 
  PackageCheck, 
  XCircle,
  FileCheck
} from 'lucide-react';
import { SupplyRequestStatus } from '../../types';
import { useTranslation } from '../../i18n';

interface RequestStatusTrackerProps {
  status: SupplyRequestStatus;
  urgency?: 'HIGH' | 'CRITICAL';
  createdAt?: string;
  updatedAt?: string;
  transferredRecordId?: string | null;
  compact?: boolean;
}

export const RequestStatusTracker: React.FC<RequestStatusTrackerProps> = ({
  status,
  urgency,
  createdAt,
  updatedAt,
  transferredRecordId,
  compact = false
}) => {
  const { t, language } = useTranslation();
  const isRejected = status === 'REJECTED';
  const isPending = status === 'PENDING';
  const isApproved = status === 'APPROVED';
  const isFulfilled = status === 'FULFILLED';
  const hasTransfer = Boolean(transferredRecordId);

  // Steps definition
  const steps = [
    {
      id: 'submitted',
      label: t('supplyRequest.step1'),
      completed: true,
      current: false,
      icon: FileCheck
    },
    {
      id: 'review',
      label: t('supplyRequest.step2'),
      completed: isApproved || isFulfilled || isRejected,
      current: isPending,
      icon: Clock
    },
    {
      id: 'decision',
      label: isRejected ? t('supplyRequest.rejected') : t('supplyRequest.approved'),
      completed: isApproved || isFulfilled || isRejected,
      current: (isApproved && !isFulfilled && !hasTransfer) || isRejected,
      isError: isRejected,
      icon: isRejected ? XCircle : CheckCircle2
    },
    {
      id: 'dispatch',
      label: t('supplyRequest.step4'),
      completed: isFulfilled || hasTransfer,
      current: isApproved && hasTransfer && !isFulfilled,
      icon: Truck
    },
    {
      id: 'fulfilled',
      label: t('supplyRequest.step5'),
      completed: isFulfilled,
      current: isFulfilled,
      icon: PackageCheck
    }
  ];

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 text-[11px] font-bold">
        {isPending && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="h-3 w-3" />
            {t('supplyRequest.pending')}
          </span>
        )}
        {isApproved && !isFulfilled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800">
            <CheckCircle2 className="h-3 w-3" />
            {t('supplyRequest.approved')}
          </span>
        )}
        {isFulfilled && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <PackageCheck className="h-3 w-3" />
            {t('supplyRequest.fulfilled')}
          </span>
        )}
        {isRejected && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="h-3 w-3" />
            {t('supplyRequest.rejected')}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="w-full py-2">
      <div className="flex items-center justify-between relative">
        {/* Background Connecting Line */}
        <div className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200 dark:bg-slate-700 z-0">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500 ease-out"
            style={{
              width: isFulfilled ? '100%' : isApproved ? '75%' : isPending ? '25%' : '0%'
            }}
          />
        </div>
        
        {steps.map((step, idx) => {
          const Icon = step.icon;
          let nodeClasses = 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-600';
          let textClasses = 'text-slate-500 dark:text-slate-400';

          if (step.isError) {
            nodeClasses = 'bg-rose-600 text-white border-rose-600 shadow-sm animate-badge-pop';
            textClasses = 'text-rose-600 dark:text-rose-400 font-extrabold';
          } else if (step.completed) {
            nodeClasses = 'bg-emerald-600 text-white border-emerald-600 shadow-sm transition-transform duration-200 group-hover:scale-110';
            textClasses = 'text-emerald-700 dark:text-emerald-300 font-bold';
          } else if (step.current) {
            nodeClasses = 'bg-teal-500 text-slate-950 border-teal-500 shadow-md animate-pulse scale-105';
            textClasses = 'text-teal-700 dark:text-teal-300 font-extrabold';
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div 
                className={`h-7 w-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${nodeClasses}`}
                title={step.label}
              >
                <Icon className="h-3.5 w-3.5" />
              </div>
              <span className={`text-[10px] mt-1 tracking-tight whitespace-nowrap transition-colors duration-150 ${textClasses}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
