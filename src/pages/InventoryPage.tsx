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
  PackageCheck,
  PackagePlus
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { RequestSupplyModal, RequestSupplyContext } from '../components/clinician/RequestSupplyModal';
import { useTranslation } from '../i18n';

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
  const { t, isHindi } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [selectedMedicine, setSelectedMedicine] = useState('All Medicines');
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedRecordForTransfer, setSelectedRecordForTransfer] = useState<MedicineInventoryRecord | null>(null);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);
  const [selectedRecordForSupply, setSelectedRecordForSupply] = useState<MedicineInventoryRecord | null>(null);

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
        title={t('page.inventory.title')}
        subtitle={t('page.inventory.subtitle')}
        badge={isHindi ? "लाइव फॉर्मूलरी सिंक" : "Live Formulary Sync"}
        action={
          <button
            onClick={() => {
              setSelectedRecordForTransfer(null);
              setIsTransferModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition"
          >
            <PlusCircle className="h-4 w-4" />
            {isHindi ? "पुनर्संतुलन बैच प्रेषण" : "Dispatch Rebalancing Batch"}
          </button>
        }
      />

      {/* Top 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Medicines */}
        <StatCard
          title={t('inventory.totalSkus')}
          value={totalMedicinesCount}
          subtitle={isHindi ? "ट्रैक किए गए आवश्यक फॉर्मूलरी SKU" : "Essential formulary SKUs tracked"}
          change="100% Active"
          changeType="increase"
          icon={Pill}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />

        {/* Card 2: Low Stock */}
        <StatCard
          title={t('stat.lowStock')}
          value={lowStockCount}
          subtitle={isHindi ? "5-7 दिनों का रनवे" : "Runway between 5-7 days"}
          change={isHindi ? "वॉचलिस्ट सक्रिय" : "Watchlist active"}
          changeType="decrease"
          icon={AlertTriangle}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
        />

        {/* Card 3: Critical Stock */}
        <StatCard
          title={t('stat.criticalStock')}
          value={criticalStockCount}
          subtitle={isHindi ? "रनवे < 4 दिन (पैरासिटामोल, ओआरएस)" : "Runway < 4 days (Paracetamol, ORS)"}
          change={isHindi ? "तत्काल पुनर्संतुलन आवश्यक" : "Urgent rebalance required"}
          changeType="urgent"
          icon={AlertOctagon}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />

        {/* Card 4: Expiring Soon */}
        <StatCard
          title={t('stat.expiringSoon')}
          value={expiringSoonCount}
          subtitle={isHindi ? "60 दिनों में समाप्त होने वाले बैच" : "Batches expiring within 60 days"}
          change="FEFO (First-Expire)"
          changeType="neutral"
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Filter and Search Bar Card */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {isHindi ? "इन्वेंट्री फ़िल्टर एवं खोज इंजन" : "Inventory Filters & Query Engine"}
            </h3>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            {isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
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
              placeholder={t('inventory.searchMedicine')}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
            />
          </div>

          {/* 2. Medicine Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedMedicine}
              onChange={(e) => setSelectedMedicine(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {medicineNames.map((med) => (
                <option key={med} value={med} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {med === 'All Medicines' ? (isHindi ? 'सभी दवाएं' : 'All Medicines') : med}
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
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {states.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {st === 'All States' ? (isHindi ? 'सभी राज्य' : 'All States') : st}
                </option>
              ))}
            </select>
          </div>

          {/* 4. District Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {districts.map((d) => (
                <option key={d} value={d} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {d === 'All Districts' ? (isHindi ? 'सभी ज़िले' : 'All Districts') : d}
                </option>
              ))}
            </select>
          </div>

          {/* 5. Risk Filter */}
          <div className="lg:col-span-2">
            <select
              value={selectedRisk}
              onChange={(e) => setSelectedRisk(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? 'सभी जोखिम' : 'All Risks'}</option>
              <option value="CRITICAL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? 'गंभीर एवं उच्च' : 'Critical & High'}</option>
              <option value="WARNING" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? 'चेतावनी (मध्यम)' : 'Warning (Moderate)'}</option>
              <option value="NORMAL" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{isHindi ? 'सामान्य' : 'Normal'}</option>
            </select>
          </div>
        </div>

        {/* Results Counter & Active Pills */}
        <div className="flex items-center justify-between pt-1 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {isHindi 
              ? `${totalMedicinesCount} में से ${filteredRecords.length} दवा रिकॉर्ड प्रदर्शित` 
              : `Showing ${filteredRecords.length} of ${totalMedicinesCount} medicine records`}
          </span>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {isHindi ? 'सामान्य' : 'Normal'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> {isHindi ? 'चेतावनी' : 'Warning'}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" /> {isHindi ? 'गंभीर / उच्च' : 'Critical / High'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 uppercase font-bold text-[11px] text-slate-500 dark:text-slate-400">
              <tr>
                <th scope="col" className="px-4 py-3.5">{t('inventory.medicineName')}</th>
                <th scope="col" className="px-4 py-3.5">{t('phc.facilityName')}</th>
                <th scope="col" className="px-3 py-3.5">{t('phc.location')}</th>
                <th scope="col" className="px-3 py-3.5">{t('inventory.currentStock')}</th>
                <th scope="col" className="px-3 py-3.5">{t('inventory.burnRate')}</th>
                <th scope="col" className="px-3 py-3.5">{t('forecast.predicted7DayDemand')}</th>
                <th scope="col" className="px-3 py-3.5">{t('inventory.daysUntilDepletion')}</th>
                <th scope="col" className="px-3 py-3.5">{t('inventory.stockOutRisk')}</th>
                <th scope="col" className="px-4 py-3.5">{t('inventory.expiryDate')}</th>
                <th scope="col" className="px-3 py-3.5 text-right">{t('common.action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
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
                      className={`hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition ${
                        isCriticalRisk ? 'bg-rose-50/20 dark:bg-rose-950/20' : ''
                      }`}
                    >
                      {/* Medicine */}
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCriticalRisk ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300' : 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300'
                          }`}>
                            <Pill className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <span className="font-extrabold text-slate-900 dark:text-slate-100 text-xs">{item.medicine}</span>
                            <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-normal">{item.dosage}</span>
                          </div>
                        </div>
                      </td>

                      {/* PHC */}
                      <td className="px-4 py-3.5 font-semibold text-slate-900 dark:text-slate-100">
                        {item.phc}
                      </td>

                      {/* District */}
                      <td className="px-3 py-3.5 text-slate-700 dark:text-slate-300">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{item.district}</span>
                        <span className="block text-[10px] text-slate-400 dark:text-slate-500">{item.state}</span>
                      </td>

                      {/* Current Stock */}
                      <td className="px-3 py-3.5">
                        <span className={`font-extrabold ${item.currentStock < 100 ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                          {item.currentStock.toLocaleString()}
                        </span>{' '}
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{item.unit}</span>
                      </td>

                      {/* Daily Usage */}
                      <td className="px-3 py-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {item.dailyUsage}/day
                      </td>

                      {/* Predicted 7-Day Demand */}
                      <td className="px-3 py-3.5 font-bold text-teal-800 dark:text-teal-400">
                        {item.predicted7DayDemand} {item.unit}
                      </td>

                      {/* Days Remaining */}
                      <td className="px-3 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 font-extrabold text-[11px] px-2 py-0.5 rounded ${
                            isUrgent
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 animate-pulse'
                              : item.daysRemaining <= 7
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          <Clock className="h-3 w-3" />
                          {item.daysRemaining} {isHindi ? 'दिन' : 'days'}
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
                          <span className="text-slate-700 dark:text-slate-300 font-medium">{item.expiryDate}</span>
                        </div>
                        {item.isExpiringSoon && (
                          <span className="mt-0.5 inline-block text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.2 rounded border border-amber-200 dark:border-amber-800">
                            {isHindi ? 'समाप्ति <60 दिन' : 'Expiring <60d'}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-3 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {(isCriticalRisk || item.risk === 'WARNING') && (
                            <button
                              onClick={() => {
                                setSelectedRecordForSupply(item);
                                setIsSupplyModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 px-2 py-1 text-[11px] font-extrabold transition shadow-xs cursor-pointer"
                              title={isHindi ? "केंद्रीय डिपो से तत्काल आपूर्ति का अनुरोध करें" : "Request urgent supply replenishment from central depot"}
                            >
                              <PackagePlus className="h-3 w-3" />
                              <span>{isHindi ? "आपूर्ति मांगें" : "Request"}</span>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedRecordForTransfer(item);
                              setIsTransferModalOpen(true);
                            }}
                            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition shadow-xs cursor-pointer ${
                              isCriticalRisk
                                ? 'bg-rose-600 text-white hover:bg-rose-700'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-teal-600 hover:text-white dark:hover:bg-teal-600'
                            }`}
                          >
                            <ArrowRightLeft className="h-3 w-3" />
                            <span>{isHindi ? "पुनर्संतुलन" : "Rebalance"}</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinician Medicine Supply Request Modal */}
      <RequestSupplyModal
        isOpen={isSupplyModalOpen}
        onClose={() => {
          setIsSupplyModalOpen(false);
          setSelectedRecordForSupply(null);
        }}
        context={selectedRecordForSupply ? {
          phcId: 'phc-' + selectedRecordForSupply.phc.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          phcName: selectedRecordForSupply.phc,
          district: selectedRecordForSupply.district,
          state: selectedRecordForSupply.state,
          medicine: selectedRecordForSupply.medicine,
          currentStock: selectedRecordForSupply.currentStock,
          unit: selectedRecordForSupply.unit,
          predictedDailyDemand: selectedRecordForSupply.dailyUsage,
          predicted7DayDemand: selectedRecordForSupply.predicted7DayDemand,
          daysRemaining: selectedRecordForSupply.daysRemaining,
          shortageQuantity: Math.max(0, selectedRecordForSupply.predicted7DayDemand - selectedRecordForSupply.currentStock),
          stockOutRisk: selectedRecordForSupply.risk,
          reason: `Stock exhaustion runway is down to ${selectedRecordForSupply.daysRemaining} days under normal consumption velocity.`
        } : null}
        onSuccess={() => {
          setIsSupplyModalOpen(false);
          setSelectedRecordForSupply(null);
        }}
      />

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
