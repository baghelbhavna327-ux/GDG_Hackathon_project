import React, { useState, useMemo } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatCard } from '../components/common/StatCard';
import { mockMedicineInventory } from '../data/medicineInventoryData';
import { MedicineInventoryRecord, Hospital, PriorityLevel, ResourceCategory } from '../types';
import { 
  Pill, 
  AlertTriangle, 
  AlertOctagon, 
  Clock, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  RotateCcw, 
  CheckCircle2, 
  PlusCircle, 
  Sparkles,
  Layers,
  ArrowRightLeft,
  Calendar,
  PackageCheck
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';

interface InventoryPageProps {
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

export const InventoryPage: React.FC<InventoryPageProps> = ({ hospitals, onCreateTransfer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedMedicine, setSelectedMedicine] = useState('All Medicines');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRecordForTransfer, setSelectedRecordForTransfer] = useState<MedicineInventoryRecord | null>(null);

  // States list
  const states = useMemo(() => {
    const list = Array.from(new Set(mockMedicineInventory.map((i) => i.state))).sort();
    return ['All States', ...list];
  }, []);

  // Districts list (filtered by selected state if any)
  const districts = useMemo(() => {
    const relevant = selectedState === 'All States'
      ? mockMedicineInventory
      : mockMedicineInventory.filter((i) => i.state === selectedState);
    const list = Array.from(new Set(relevant.map((i) => i.district))).sort();
    return ['All Districts', ...list];
  }, [selectedState]);

  // Medicines unique list
  const medicineNames = useMemo(() => {
    const list = Array.from(new Set(mockMedicineInventory.map((i) => i.medicine))).sort();
    return ['All Medicines', ...list];
  }, []);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return mockMedicineInventory.filter((record) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        record.medicine.toLowerCase().includes(query) ||
        record.phc.toLowerCase().includes(query) ||
        record.district.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        record.batchNumber.toLowerCase().includes(query);

      const matchesState = selectedState === 'All States' || record.state === selectedState;
      const matchesDistrict = selectedDistrict === 'All Districts' || record.district === selectedDistrict;
      const matchesMedicine = selectedMedicine === 'All Medicines' || record.medicine === selectedMedicine;

      const matchesRisk = 
        selectedRisk === 'All' ? true :
        selectedRisk === 'CRITICAL' ? (record.risk === 'CRITICAL' || record.risk === 'HIGH') :
        selectedRisk === 'WARNING' ? record.risk === 'WARNING' :
        selectedRisk === 'NORMAL' ? record.risk === 'NORMAL' : true;

      return matchesSearch && matchesState && matchesDistrict && matchesMedicine && matchesRisk;
    });
  }, [searchQuery, selectedState, selectedDistrict, selectedMedicine, selectedRisk]);

  // Summary Metrics
  const totalMedicinesCount = mockMedicineInventory.length;
  const lowStockCount = mockMedicineInventory.filter((m) => m.risk === 'WARNING').length;
  const criticalStockCount = mockMedicineInventory.filter((m) => m.risk === 'CRITICAL' || m.risk === 'HIGH').length;
  const expiringSoonCount = mockMedicineInventory.filter((m) => m.isExpiringSoon).length;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedState('All States');
    setSelectedDistrict('All Districts');
    setSelectedRisk('All');
    setSelectedMedicine('All Medicines');
  };

  const getRiskBadge = (risk: MedicineInventoryRecord['risk']) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-100 text-rose-800 text-[11px] font-extrabold border border-rose-300 animate-pulse">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-600" />
            CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 text-[11px] font-bold border border-rose-200">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
            HIGH
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            WARNING
          </span>
        );
      case 'NORMAL':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SectionHeader
        title="Medicine Inventory Monitoring"
        subtitle="Real-time pharmaceutical supply runway, 7-day predicted consumption demand, and automated stock-out prevention"
        badge="Live Formulary Sync"
        action={
          <button
            onClick={() => {
              setSelectedRecordForTransfer(null);
              setIsTransferModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            Dispatch Rebalancing Batch
          </button>
        }
      />

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Medicines */}
        <StatCard
          title="Total Medicines"
          value={totalMedicinesCount}
          subtitle="Essential formulary SKUs tracked"
          change="100% Active"
          changeType="increase"
          icon={Pill}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />

        {/* Card 2: Low Stock */}
        <StatCard
          title="Low Stock"
          value={lowStockCount}
          subtitle="Runway between 5-7 days"
          change="Watchlist active"
          changeType="decrease"
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        {/* Card 3: Critical Stock */}
        <StatCard
          title="Critical Stock"
          value={criticalStockCount}
          subtitle="Runway < 4 days (Paracetamol, ORS)"
          change="Urgent rebalance required"
          changeType="urgent"
          icon={AlertOctagon}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />

        {/* Card 4: Expiring Soon */}
        <StatCard
          title="Expiring Soon"
          value={expiringSoonCount}
          subtitle="Batches expiring within 60 days"
          change="First-Expire-First-Out"
          changeType="neutral"
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm">Inventory Filters & Query Engine</h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 hover:text-teal-600 font-medium flex items-center gap-1 transition"
          >
            <RotateCcw className="h-3 w-3" />
            Reset Filters
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          {/* 1. Search Field */}
          <div className="lg:col-span-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search medicine, PHC, district, batch..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
            />
          </div>

          {/* 2. Medicine Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {medicineNames.map((med) => (
                <option key={med} value={med}>
                  {med}
                </option>
              ))}
            </select>
          </div>

          {/* 3. State Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setSelectedDistrict('All Districts');
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 4. District Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Risk Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Risks</option>
              <option value="CRITICAL">Critical & High</option>
              <option value="WARNING">Warning (Moderate)</option>
              <option value="NORMAL">Normal</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Pills */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredRecords.length}</strong> of {totalMedicinesCount} medicine records
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Normal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Warning
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> Critical / High
            </span>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase font-bold text-[11px] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3.5">Medicine</th>
                <th scope="col" className="px-4 py-3.5">PHC Facility</th>
                <th scope="col" className="px-3 py-3.5">District & State</th>
                <th scope="col" className="px-3 py-3.5">Current Stock</th>
                <th scope="col" className="px-3 py-3.5">Daily Usage</th>
                <th scope="col" className="px-3 py-3.5">Predicted 7-Day Demand</th>
                <th scope="col" className="px-3 py-3.5">Days Remaining</th>
                <th scope="col" className="px-3 py-3.5">Risk State</th>
                <th scope="col" className="px-4 py-3.5">Expiry Date</th>
                <th scope="col" className="px-3 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 text-xs">
                    No medicine inventory records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((item) => {
                  const isUrgent = item.daysRemaining <= 4;
                  const isCriticalRisk = item.risk === 'CRITICAL' || item.risk === 'HIGH';

                  return (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50/90 transition ${
                        isCriticalRisk ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Medicine */}
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCriticalRisk ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'
                          }`}>
                            <Pill className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 text-xs">{item.medicine}</span>
                            <span className="block text-[10px] text-slate-500 font-normal">{item.dosage}</span>
                          </div>
                        </div>
                      </td>

                      {/* PHC */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        {item.phc}
                      </td>

                      {/* District */}
                      <td className="px-3 py-3.5 text-slate-700">
                        <span className="font-semibold text-slate-900">{item.district}</span>
                        <span className="block text-[10px] text-slate-400">{item.state}</span>
                      </td>

                      {/* Current Stock */}
                      <td className="px-3 py-3.5">
                        <span className={`font-extrabold ${item.currentStock < 100 ? 'text-rose-700' : 'text-slate-900'}`}>
                          {item.currentStock.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500">{item.unit}</span>
                      </td>

                      {/* Daily Usage */}
                      <td className="px-3 py-3.5 font-medium text-slate-700">
                        {item.dailyUsage}/day
                      </td>

                      {/* Predicted 7-Day Demand */}
                      <td className="px-3 py-3.5 font-bold text-teal-800">
                        {item.predicted7DayDemand} {item.unit}
                      </td>

                      {/* Days Remaining */}
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-extrabold text-[11px] px-2 py-0.5 rounded ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                              : item.daysRemaining <= 7
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {item.daysRemaining} days
                        </span>
                      </td>

                      {/* Risk */}
                      <td className="px-3 py-3.5">
                        {getRiskBadge(item.risk)}
                      </td>

                      {/* Expiry Date */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3 text-slate-400" />
                          <span className="text-slate-700 font-medium">{item.expiryDate}</span>
                        </div>
                        {item.isExpiringSoon && (
                          <span className="mt-0.5 inline-block text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Expiring &lt;60d
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecordForTransfer(item);
                            setIsTransferModalOpen(true);
                          }}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition shadow-xs ${
                            isCriticalRisk
                              ? 'bg-rose-600 text-white hover:bg-rose-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-teal-600 hover:text-white'
                          }`}
                        >
                          <ArrowRightLeft className="h-3 w-3" />
                          Rebalance
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transfer Dispatch Modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
