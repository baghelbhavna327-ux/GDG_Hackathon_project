import React, { useState } from 'react';
import { SupplyItem, ResourceCategory, PriorityLevel, Hospital } from '../types';
import { SectionHeader } from '../components/common/SectionHeader';
import { ResourceInventoryTable } from '../components/tables/ResourceInventoryTable';
import { StatCard } from '../components/common/StatCard';
import { Package, Droplet, Wind, ShieldCheck, PlusCircle, Filter } from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';

interface SuppliesPageProps {
  supplies: SupplyItem[];
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

export const SuppliesPage: React.FC<SuppliesPageProps> = ({
  supplies,
  hospitals,
  onCreateTransfer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const categories = [
    'All',
    'Medical Oxygen',
    'Mechanical Ventilators',
    'Blood & Plasma',
    'Critical Pharmaceuticals',
    'PPE Supplies',
    'ICU Beds',
  ];

  const filtered = selectedCategory === 'All'
    ? supplies
    : supplies.filter(s => s.category === selectedCategory);

  const criticalSuppliesCount = supplies.filter(s => s.riskLevel === 'critical').length;
  const highRiskCount = supplies.filter(s => s.riskLevel === 'high').length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Critical Supplies & Inventory Stock"
        subtitle="Live pharmaceutical, blood reserve, oxygen inventory, and AI burn rate calculation"
        badge="Autonomous Replenishment"
        action={
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Schedule Rebalancing Dispatch
          </button>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tracked Supply SKUs"
          value={supplies.length}
          subtitle="Across 6 regional hubs"
          icon={Package}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />
        <StatCard
          title="Critical Shortage SKUs"
          value={criticalSuppliesCount}
          subtitle="Runway < 3 days remaining"
          change="Urgent rebalance required"
          changeType="urgent"
          icon={Wind}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />
        <StatCard
          title="High Watchlist SKUs"
          value={highRiskCount}
          subtitle="Runway < 5 days remaining"
          change="Elevated demand"
          changeType="decrease"
          icon={Droplet}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />
        <StatCard
          title="Supply Grid Reliability"
          value="96.8%"
          subtitle="Zero stock-out events this week"
          icon={ShieldCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-2">
          <Filter className="h-3.5 w-3.5" /> Filter by Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === cat
                ? 'bg-teal-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Inventory Table */}
      <ResourceInventoryTable
        supplies={filtered}
        onRequestDispatch={(item) => {
          setIsTransferModalOpen(true);
        }}
      />

      {/* Transfer modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
