import React, { useState, useMemo, useEffect } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { StatCard } from '../components/common/StatCard';
import { RedistributionVisualFlow } from '../components/redistribution/RedistributionVisualFlow';
import { RedistributionCard } from '../components/redistribution/RedistributionCard';
import { RedistributionModal } from '../components/redistribution/RedistributionModal';
import { RedistributionRecommendation } from '../data/redistributionMockData';
import { Hospital, PriorityLevel, ResourceCategory } from '../types';
import { 
  ArrowRightLeft, 
  Truck, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Filter, 
  Search, 
  Clock, 
  PlusCircle,
  Building2,
  PackageCheck,
  Loader2,
  RefreshCw,
  Info
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { generateRedistributionPlan } from '../services/redistributionService';

interface RedistributionPageProps {
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

export const RedistributionPage: React.FC<RedistributionPageProps> = ({
  hospitals,
  onCreateTransfer,
}) => {
  // 1. Recommendation and API States
  const [recommendations, setRecommendations] = useState<RedistributionRecommendation[]>([]);
  const [selectedItem, setSelectedItem] = useState<RedistributionRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [emptyMessage, setEmptyMessage] = useState<string | null>(null);

  // 2. Filter & Modal States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [modalItem, setModalItem] = useState<RedistributionRecommendation | null>(null);
  const [modalMode, setModalMode] = useState<'details' | 'accept'>('accept');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManualTransferOpen, setIsManualTransferOpen] = useState(false);

  // Load / Generate Redistribution Plan
  const loadPlan = async () => {
    setIsLoading(true);
    setError(null);
    setEmptyMessage(null);

    try {
      const result = await generateRedistributionPlan();
      setRecommendations(result.recommendations);
      if (result.recommendations.length > 0) {
        setSelectedItem(result.recommendations[0]);
      } else {
        setSelectedItem(null);
        setEmptyMessage(result.message || 'No redistribution required. Current PHC inventory is sufficiently balanced.');
      }
    } catch (err: any) {
      console.error('Redistribution Generation Error:', err);
      setError('Unable to generate redistribution recommendations. Please make sure the AI prediction service is running on port 8000.');
      setRecommendations([]);
      setSelectedItem(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, []);

  // Dynamic Categories list from active recommendations
  const categories = useMemo(() => {
    const list = Array.from(new Set(recommendations.map((r) => r.category))).sort();
    return ['All', ...list];
  }, [recommendations]);

  // Filtered recommendations based on search & selectors
  const filteredRecommendations = useMemo(() => {
    return recommendations.filter((rec) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        rec.resource.toLowerCase().includes(q) ||
        rec.sourcePhc.toLowerCase().includes(q) ||
        rec.destinationPhc.toLowerCase().includes(q) ||
        rec.sourceDistrict.toLowerCase().includes(q) ||
        rec.destinationDistrict.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || rec.category === selectedCategory;
      const matchesPriority = selectedPriority === 'All' || rec.priority === selectedPriority;

      return matchesSearch && matchesCategory && matchesPriority;
    });
  }, [recommendations, searchQuery, selectedCategory, selectedPriority]);

  const handleOpenModal = (item: RedistributionRecommendation, mode: 'details' | 'accept') => {
    setModalItem(item);
    setModalMode(mode);
    setIsModalOpen(true);
  };

  // Dynamic Summary Calculations from real recommendations
  const totalRecommended = recommendations.length;
  const emergencyCount = recommendations.filter((r) => r.priority === 'EMERGENCY').length;
  const totalUnits = recommendations.reduce((acc, r) => acc + r.recommendedQuantity, 0);
  const totalPatients = recommendations.reduce((acc, r) => acc + r.patientsProtected, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <SectionHeader
        title="AI-Assisted Healthcare Resource Redistribution"
        subtitle="Intelligent surplus-to-shortage load balancing connecting Primary Health Centers experiencing excess to those facing critical deficit"
        badge="FastAPI Optimization Engine"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadPlan}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-teal-600 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Analyzing PHC inventory...' : 'Generate Redistribution Plan'}
            </button>
            <button
              onClick={() => setIsManualTransferOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              Dispatch Custom Transfer
            </button>
          </div>
        }
      />

      {/* Error Banner with Retry */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-900 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 mt-0.5">Please ensure Python FastAPI microservice is listening on port 8000.</p>
            </div>
          </div>
          <button
            onClick={loadPlan}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition cursor-pointer"
          >
            Retry Analysis
          </button>
        </div>
      )}

      {/* Top 4 Summary Cards (Calculated Dynamically) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Rebalance Recommendations"
          value={isLoading ? '...' : totalRecommended}
          subtitle="Generated via AI Surplus-Deficit Matcher"
          change="AI Optimized"
          changeType="increase"
          icon={ArrowRightLeft}
          iconBg="bg-teal-50"
          iconColor="text-teal-600"
        />

        <StatCard
          title="Emergency Priority Transfers"
          value={isLoading ? '...' : emergencyCount}
          subtitle="Critical risk facilities prioritized"
          change="Action required"
          changeType={emergencyCount > 0 ? 'urgent' : 'neutral'}
          icon={AlertTriangle}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
        />

        <StatCard
          title="Total Rebalancing Volume"
          value={isLoading ? '...' : `${totalUnits.toLocaleString()} units`}
          subtitle="Surplus-backed clinical allocation"
          change="Surplus backed"
          changeType="increase"
          icon={PackageCheck}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />

        <StatCard
          title="Stock-Outs Averted"
          value={isLoading ? '...' : `${totalPatients.toLocaleString()} Patients`}
          subtitle="Projected clinical coverage"
          change="100% Protected"
          changeType="increase"
          icon={ShieldCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      {/* Interactive Visual Flow: Source PHC → Transfer → Destination PHC */}
      <RedistributionVisualFlow selectedItem={selectedItem || filteredRecommendations[0] || null} />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resource, source PHC, destination PHC, district..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Categories' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 focus:bg-white focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              <option value="All">All Priorities</option>
              <option value="EMERGENCY">Emergency Priority</option>
              <option value="HIGH">High Priority</option>
              <option value="ROUTINE">Routine Transfer</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
          <span>
            Showing <strong>{filteredRecommendations.length}</strong> redistribution protocols
          </span>
          <span className="text-[11px] text-teal-700 font-medium hidden sm:inline">
            Click any recommendation card to inspect its real-time flow diagram
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center space-y-3 shadow-card">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto" />
          <h4 className="font-extrabold text-slate-900 text-sm">Analyzing PHC inventory...</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Computing regional surplus buffers, assessing stock-out risks across Primary Health Centers, and optimizing transit corridors.
          </p>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && filteredRecommendations.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center space-y-2 shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <Info className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-sm">
            {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
              ? 'No matching redistribution protocols found'
              : (emptyMessage || 'No redistribution required. Current PHC inventory is sufficiently balanced.')}
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
              ? 'Try clearing your search query or selecting "All" categories and priorities.'
              : 'All regional facilities maintain adequate inventory runways covering predicted demand.'}
          </p>
        </div>
      )}

      {/* Recommendation Cards Grid */}
      {!isLoading && filteredRecommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Autonomous Redistribution Protocols ({filteredRecommendations.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
            {filteredRecommendations.map((rec) => (
              <RedistributionCard
                key={rec.id}
                item={rec}
                isSelected={selectedItem?.id === rec.id}
                onSelectFlow={(item) => setSelectedItem(item)}
                onViewDetails={(item) => handleOpenModal(item, 'details')}
                onAcceptRecommendation={(item) => handleOpenModal(item, 'accept')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recommendation Confirmation / Analysis Modal */}
      <RedistributionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={modalItem}
        mode={modalMode}
      />

      {/* Custom manual transfer modal */}
      <NewTransferModal
        isOpen={isManualTransferOpen}
        onClose={() => setIsManualTransferOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
