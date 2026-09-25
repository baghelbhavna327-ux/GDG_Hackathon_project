import React, { useState } from 'react';
import { ResourceTransfer, Hospital, PriorityLevel, ResourceCategory } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { TransferLogTable } from '../components/tables/TransferLogTable';
import { StatCard } from '../components/common/StatCard';
import { Truck, CheckCircle2, Clock, PlusCircle, AlertCircle, ShieldAlert } from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';

interface TransfersPageProps {
  transfers: ResourceTransfer[];
  hospitals: Hospital[];
  onCreateTransfer: (data: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => void;
}

export const TransfersPage: React.FC<TransfersPageProps> = ({
  transfers,
  hospitals,
  onCreateTransfer,
}) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const inTransitCount = transfers.filter(t => t.status === 'in_transit').length;
  const deliveredCount = transfers.filter(t => t.status === 'delivered').length;
  const emergencyCount = transfers.filter(t => t.priority === 'emergency').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Resource Transfers & Inter-Facility Logistics"
        subtitle="Automated emergency dispatch, real-time medical escort tracking, and regional balance control"
        badge="Active Fleet Tracking"
        action={
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Dispatch New Resource Transfer
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="In-Transit Transfers"
          value={inTransitCount}
          subtitle="Real-time GPS monitored"
          change="Optimal routing"
          changeType="increase"
          icon={Truck}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Emergency Priority"
          value={emergencyCount}
          subtitle="Ventilators & Blood units"
          change="Urgent transit"
          changeType="urgent"
          icon={ShieldAlert}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="Successfully Delivered"
          value={deliveredCount}
          subtitle="Past 24 hours"
          icon={CheckCircle2}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="Avg Dispatch Turnaround"
          value="24 mins"
          subtitle="Standard response < 45m"
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Transfers Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Logistics & Dispatch Registry</h3>
          <span className="text-xs text-slate-500">{transfers.length} Total logged transfers</span>
        </div>
        <TransferLogTable transfers={transfers} />
      </div>

      {/* Modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
