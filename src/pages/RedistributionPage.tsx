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
import { OrToolsOptimizationCard } from '../components/redistribution/OrToolsOptimizationCard';
import { generateRedistributionPlan } from '../services/redistributionService';
import { useTranslation } from '../i18n';

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
  const { t, isHindi } = useTranslation();
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
        title={t('page.redistribution.title')}
        subtitle={t('page.redistribution.subtitle')}
        badge="FastAPI Optimization Engine"
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={loadPlan}
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700/80 transition cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-teal-600 dark:text-teal-400 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? (isHindi ? 'PHC इन्वेंट्री का विश्लेषण...' : 'Analyzing PHC inventory...') : (isHindi ? 'पुनर्वितरण योजना तैयार करें' : 'Generate Redistribution Plan')}
            </button>
            <button
              onClick={() => setIsManualTransferOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 transition cursor-pointer"
            >
              <PlusCircle className="h-4 w-4" />
              {isHindi ? "कस्टम ट्रांसफर प्रेषण" : "Dispatch Custom Transfer"}
            </button>
          </div>
        }
      />

      {/* Error Banner with Retry */}
      {error && (
        <div className="rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-rose-900 dark:text-rose-200 text-xs flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <p className="font-bold">{error}</p>
              <p className="text-rose-700 dark:text-rose-300 mt-0.5">Please ensure Python FastAPI microservice is listening on port 8000.</p>
            </div>
          </div>
          <button
            onClick={loadPlan}
            className="rounded-lg bg-rose-600 dark:bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 dark:hover:bg-rose-600 transition cursor-pointer"
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Top 4 Summary Cards (Calculated Dynamically) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title={isHindi ? "सक्रिय पुनर्संतुलन प्रस्ताव" : "Active Rebalance Recommendations"}
          value={isLoading ? '...' : totalRecommended}
          subtitle={isHindi ? "AI अधिशेष-घाटा मिलान द्वारा जनरेट" : "Generated via AI Surplus-Deficit Matcher"}
          change="AI Optimized"
          changeType="increase"
          icon={ArrowRightLeft}
          iconBg="bg-teal-50 dark:bg-teal-950/50"
          iconColor="text-teal-600 dark:text-teal-400"
        />

        <StatCard
          title={isHindi ? "आपातकालीन प्राथमिकता स्थानांतरण" : "Emergency Priority Transfers"}
          value={isLoading ? '...' : emergencyCount}
          subtitle={isHindi ? "गंभीर जोखिम केंद्रों को प्राथमिकता" : "Critical risk facilities prioritized"}
          change={isHindi ? "कार्रवाई अपेक्षित" : "Action required"}
          changeType={emergencyCount > 0 ? 'urgent' : 'neutral'}
          icon={AlertTriangle}
          iconBg="bg-rose-50 dark:bg-rose-950/50"
          iconColor="text-rose-600 dark:text-rose-400"
        />

        <StatCard
          title={isHindi ? "कुल पुनर्संतुलन मात्रा" : "Total Rebalancing Volume"}
          value={isLoading ? '...' : `${totalUnits.toLocaleString()} ${isHindi ? 'यूनिट्स' : 'units'}`}
          subtitle={isHindi ? "अधिशेष समर्थित नैदानिक आवंटन" : "Surplus-backed clinical allocation"}
          change="Surplus backed"
          changeType="increase"
          icon={PackageCheck}
          iconBg="bg-blue-50 dark:bg-blue-950/50"
          iconColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title={t('impact.patientsProtected')}
          value={isLoading ? '...' : `${totalPatients.toLocaleString()} ${isHindi ? 'मरीज़' : 'Patients'}`}
          subtitle={isHindi ? "प्रक्षेपित नैदानिक सुरक्षा" : "Projected clinical coverage"}
          change="100% Protected"
          changeType="increase"
          icon={ShieldCheck}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          iconColor="text-emerald-600 dark:text-emerald-400"
        />
      </div>

      {/* Google OR-Tools SCIP Mathematical Optimization Engine Card */}
      <OrToolsOptimizationCard onConfirmTransfer={onCreateTransfer} />

      {/* Interactive Visual Flow: Source PHC → Transfer → Destination PHC */}
      <RedistributionVisualFlow selectedItem={selectedItem || filteredRecommendations[0] || null} />

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHindi ? "संसाधन, स्रोत PHC, गंतव्य PHC, ज़िला खोजें..." : "Search resource, source PHC, destination PHC, district..."}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2 pl-9 pr-3 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {cat === 'All' ? (isHindi ? 'सभी श्रेणियां' : 'All Categories') : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'सभी प्राथमिकताएं' : 'All Priorities'}</option>
              <option value="EMERGENCY" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'आपातकालीन प्राथमिकता' : 'Emergency Priority'}</option>
              <option value="HIGH" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'उच्च प्राथमिकता' : 'High Priority'}</option>
              <option value="ROUTINE" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'नियमित स्थानांतरण' : 'Routine Transfer'}</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
          <span>
            {isHindi 
              ? `${filteredRecommendations.length} पुनर्वितरण प्रोटोकॉल प्रदर्शित` 
              : `Showing ${filteredRecommendations.length} redistribution protocols`}
          </span>
          <span className="text-[11px] text-teal-700 dark:text-teal-400 font-medium hidden sm:inline">
            {isHindi ? "फ्लो आरेख देखने के लिए किसी भी कार्ड पर क्लिक करें" : "Click any recommendation card to inspect its real-time flow diagram"}
          </span>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-12 text-center space-y-3 shadow-card">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 dark:text-teal-400 mx-auto" />
          <h4 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Analyzing PHC inventory...</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Computing regional surplus buffers, assessing stock-out risks across Primary Health Centers, and optimizing transit corridors.
          </p>
        </div>
      )}

      {/* Empty States */}
      {!isLoading && filteredRecommendations.length === 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-10 text-center space-y-2 shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            <Info className="h-6 w-6" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
            {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
              ? 'No matching redistribution protocols found'
              : (emptyMessage || 'No redistribution required. Current PHC inventory is sufficiently balanced.')}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
              ? 'Try clearing your search query or selecting "All" categories and priorities.'
              : 'All regional facilities maintain adequate inventory runways covering predicted demand.'}
          </p>
        </div>
      )}

      {/* Recommendation Cards Grid */}
      {!isLoading && filteredRecommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
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
