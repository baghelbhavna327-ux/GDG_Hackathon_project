import React, { useState, useEffect, useMemo, useRef } from 'react';
import { IndiaPhcLeafletMap } from '../components/maps/IndiaPhcLeafletMap';
import { phcService } from '../services/phcService';
import { mockIndiaPHCs } from '../data/indiaPhcData';
import { IndiaPHC, PriorityLevel, ResourceCategory, Hospital } from '../types';
import { 
  Search, 
  MapPin, 
  Pill, 
  Bed, 
  Users, 
  AlertTriangle, 
  Phone, 
  PlusCircle, 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Building2, 
  X, 
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  ChevronRight,
  Filter,
  Loader2,
  Navigation
} from 'lucide-react';
import { NewTransferModal } from '../components/ai/NewTransferModal';
import { useTranslation } from '../i18n';

interface PhcMapPageProps {
  hospitals?: Hospital[];
  onCreateTransfer?: (data: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => void;
}

export const PhcMapPage: React.FC<PhcMapPageProps> = ({ 
  hospitals = [], 
  onCreateTransfer = () => {} 
}) => {
  const { t, isHindi } = useTranslation();
  const [phcData, setPhcData] = useState<IndiaPHC[]>(mockIndiaPHCs);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedState, setSelectedState] = useState('All States');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedStatus, setSelectedStatus] = useState<string>('All Status');
  const [selectedPhc, setSelectedPhc] = useState<IndiaPHC | null>(mockIndiaPHCs[0] || null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Load PHCs from backend API with fallback
  useEffect(() => {
    let isMounted = true;
    const loadPHCs = async () => {
      setIsLoading(true);
      try {
        const data = await phcService.getPHCs();
        if (isMounted && data.length > 0) {
          setPhcData(data);
          setSelectedPhc(data[0]);
        }
      } catch (err) {
        console.warn('Failed to load backend PHCs, using cached dataset:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    loadPHCs();

    return () => {
      isMounted = false;
    };
  }, []);

  // Dismiss autocomplete on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Distinct States list
  const states = useMemo(() => {
    const set = new Set(phcData.map((p) => p.state));
    return ['All States', ...Array.from(set).sort()];
  }, [phcData]);

  // Distinct Districts list (filtered by selected state)
  const districts = useMemo(() => {
    const list = phcData.filter(
      (p) => selectedState === 'All States' || p.state === selectedState
    );
    const set = new Set(list.map((p) => p.district));
    return ['All Districts', ...Array.from(set).sort()];
  }, [phcData, selectedState]);

  // Handle state change: reset district if not applicable
  const handleStateChange = (state: string) => {
    setSelectedState(state);
    setSelectedDistrict('All Districts');
  };

  // Filtered PHC Nodes
  const filteredPHCs = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return phcData.filter((phc) => {
      const matchesSearch =
        !query ||
        phc.name.toLowerCase().includes(query) ||
        phc.district.toLowerCase().includes(query) ||
        phc.state.toLowerCase().includes(query) ||
        (phc.code && phc.code.toLowerCase().includes(query)) ||
        (phc.id && phc.id.toLowerCase().includes(query));

      const matchesState = selectedState === 'All States' || phc.state === selectedState;
      const matchesDistrict = selectedDistrict === 'All Districts' || phc.district === selectedDistrict;

      const matchesStatus =
        selectedStatus === 'All Status' ||
        (selectedStatus === 'normal' && phc.status === 'normal') ||
        (selectedStatus === 'low_resources' && phc.status === 'low_resources') ||
        (selectedStatus === 'critical' && phc.status === 'critical');

      return matchesSearch && matchesState && matchesDistrict && matchesStatus;
    });
  }, [phcData, searchQuery, selectedState, selectedDistrict, selectedStatus]);

  // Autocomplete Suggestions
  const searchSuggestions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    return phcData
      .filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.district.toLowerCase().includes(query) ||
        p.state.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query))
      )
      .slice(0, 6);
  }, [phcData, searchQuery]);

  // Status Metrics Breakdown (dynamically computed from current active dataset)
  const totalCount = phcData.length;
  const normalCount = phcData.filter((p) => p.status === 'normal').length;
  const lowStockCount = phcData.filter((p) => p.status === 'low_resources').length;
  const criticalCount = phcData.filter((p) => p.status === 'critical').length;

  const normalPct = totalCount > 0 ? Math.round((normalCount / totalCount) * 100) : 0;
  const lowStockPct = totalCount > 0 ? Math.round((lowStockCount / totalCount) * 100) : 0;
  const criticalPct = totalCount > 0 ? Math.round((criticalCount / totalCount) * 100) : 0;

  // Clear all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedState('All States');
    setSelectedDistrict('All Districts');
    setSelectedStatus('All Status');
    setIsSearchOpen(false);
  };

  // Toggle status filter via panel clicks
  const handleStatusFilterClick = (statusKey: string) => {
    if (selectedStatus === statusKey) {
      setSelectedStatus('All Status');
    } else {
      setSelectedStatus(statusKey);
    }
  };

  const handleSelectSuggestion = (phc: IndiaPHC) => {
    setSelectedPhc(phc);
    setSearchQuery(phc.name);
    setIsSearchOpen(false);
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <Navigation className="h-4 w-4" />
            </span>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {t('phc.mapView')}
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {t('phc.subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 dark:text-slate-300 font-semibold">{isHindi ? "लाइव GIS टेलीमेट्री" : "Live GIS Telemetry"}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsTransferModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 dark:bg-teal-500 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-teal-700 dark:hover:bg-teal-600 hover:shadow transition cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>{isHindi ? "स्थानांतरण प्रेषण" : "Dispatch Transfer"}</span>
          </button>
        </div>
      </div>

      {/* 2. Top Quick Filters & Search Bar Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* 2.1 Functional Search Bar with Live Autocomplete */}
          <div className="md:col-span-5 relative" ref={searchContainerRef}>
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                placeholder={t('phc.searchPhc')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-2.5 pl-10 pr-9 text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setIsSearchOpen(false);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {isSearchOpen && searchQuery.trim() && (
              <div className="absolute left-0 right-0 mt-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto">
                {searchSuggestions.length > 0 ? (
                  <div className="p-1 space-y-0.5">
                    <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {isHindi ? `मिलते-जुलते PHC (${searchSuggestions.length})` : `Matching PHCs (${searchSuggestions.length})`}
                    </div>
                    {searchSuggestions.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-between text-xs group cursor-pointer"
                      >
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-700 dark:group-hover:text-teal-400 truncate">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {item.district}, {item.state} • {item.code}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            item.status === 'critical'
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                              : item.status === 'low_resources'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {isHindi ? (item.status === 'critical' ? 'गंभीर' : item.status === 'low_resources' ? 'कम स्टॉक' : 'सामान्य') : (item.status === 'low_resources' ? 'Low Stock' : item.status)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400">
                    {isHindi ? `"${searchQuery}" के लिए कोई PHC नहीं मिला।` : `No matching PHCs found for "${searchQuery}".`}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2.2 State Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition"
            >
              {states.map((st) => (
                <option key={st} value={st} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {st === 'All States' ? (isHindi ? 'सभी राज्य' : 'All States') : st}
                </option>
              ))}
            </select>
          </div>

          {/* 2.3 District Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition"
            >
              {districts.map((dst) => (
                <option key={dst} value={dst} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {dst === 'All Districts' ? (isHindi ? 'सभी ज़िले' : 'All Districts') : dst}
                </option>
              ))}
            </select>
          </div>

          {/* 2.4 Stock Status Filter Dropdown & Reset */}
          <div className="md:col-span-2 flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-800 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer transition"
            >
              <option value="All Status" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'सभी स्थितियाँ' : 'All Status'}</option>
              <option value="normal" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'सामान्य स्टॉक' : 'Normal Stock'}</option>
              <option value="low_resources" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'कम स्टॉक' : 'Low Stock'}</option>
              <option value="critical" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{isHindi ? 'गंभीर स्टॉक' : 'Critical Stock'}</option>
            </select>

            {(searchQuery || selectedState !== 'All States' || selectedDistrict !== 'All Districts' || selectedStatus !== 'All Status') && (
              <button
                type="button"
                onClick={handleResetFilters}
                title={isHindi ? "फ़िल्टर रीसेट करें" : "Reset Filters"}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Indicators Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-4">
            <span className="font-bold text-slate-700 dark:text-slate-300">Filter Overview:</span>
            <button
              onClick={() => handleStatusFilterClick('normal')}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-semibold transition ${
                selectedStatus === 'normal' ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 ring-1 ring-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              Normal ({normalCount})
            </button>
            <button
              onClick={() => handleStatusFilterClick('low_resources')}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-semibold transition ${
                selectedStatus === 'low_resources' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 ring-1 ring-amber-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Low Stock ({lowStockCount})
            </button>
            <button
              onClick={() => handleStatusFilterClick('critical')}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg font-semibold transition ${
                selectedStatus === 'critical' ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-900 dark:text-rose-300 ring-1 ring-rose-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              Critical ({criticalCount})
            </button>
          </div>

          <div className="text-slate-500 dark:text-slate-400 font-medium text-xs">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filteredPHCs.length}</strong> of {totalCount} PHCs across India
          </div>
        </div>
      </div>

      {/* 3. Main 2-Column Responsive Layout (approx 75% Map / 25% Status Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: ~75% Interactive Leaflet Map */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">
          <IndiaPhcLeafletMap
            phcList={filteredPHCs}
            selectedPhcId={selectedPhc?.id}
            onSelectPhc={(phc) => setSelectedPhc(phc)}
            height="620px"
          />
        </div>

        {/* Right: ~25% PHC Status & Telemetry Panel */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          {/* 3.1 Compact PHC Status Summary Cards (Clickable to Filter) */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-xs uppercase tracking-wider flex items-center gap-2">
                <span>PHC Status</span>
              </h3>
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                {totalCount} Total Facilities
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Total PHCs */}
              <button
                type="button"
                onClick={() => setSelectedStatus('All Status')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStatus === 'All Status'
                    ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total PHCs</p>
                <p className="text-lg font-black text-slate-900 dark:text-slate-100 mt-0.5">{totalCount}</p>
                <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold">100% Monitored</p>
              </button>

              {/* Normal Stock */}
              <button
                type="button"
                onClick={() => handleStatusFilterClick('normal')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStatus === 'normal'
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Normal</p>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                </div>
                <p className="text-lg font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{normalCount}</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{normalPct}% optimal</p>
              </button>

              {/* Low Stock */}
              <button
                type="button"
                onClick={() => handleStatusFilterClick('low_resources')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStatus === 'low_resources'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-amber-50/50 dark:hover:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Low Stock</p>
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                </div>
                <p className="text-lg font-black text-amber-700 dark:text-amber-400 mt-0.5">{lowStockCount}</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">{lowStockPct}% watch</p>
              </button>

              {/* Critical Stock */}
              <button
                type="button"
                onClick={() => handleStatusFilterClick('critical')}
                className={`p-3 rounded-xl border text-left transition ${
                  selectedStatus === 'critical'
                    ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 shadow-xs'
                    : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-rose-50/50 dark:hover:bg-rose-950/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Critical</p>
                  <AlertOctagon className="h-3.5 w-3.5 text-rose-500 animate-pulse" />
                </div>
                <p className="text-lg font-black text-rose-700 dark:text-rose-400 mt-0.5">{criticalCount}</p>
                <p className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">{criticalPct}% alert</p>
              </button>
            </div>
          </div>

          {/* 3.2 Selected PHC Clinical Telemetry Panel */}
          {selectedPhc ? (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card space-y-3.5">
              {/* PHC Header */}
              <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800/60">
                    {selectedPhc.code}
                  </span>
                  <span
                    className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      selectedPhc.status === 'critical'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60 animate-pulse'
                        : selectedPhc.status === 'low_resources'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                    }`}
                  >
                    {selectedPhc.status === 'low_resources' ? 'Low Stock' : selectedPhc.status}
                  </span>
                </div>
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base leading-tight">
                  {selectedPhc.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{selectedPhc.district}, {selectedPhc.state} • {selectedPhc.pincode}</span>
                </p>
              </div>

              {/* Critical Supply Alert if present */}
              {selectedPhc.criticalShortageItems && selectedPhc.criticalShortageItems.length > 0 && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2.5 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-900 dark:text-rose-200 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                    <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    Active Supply Shortage:
                  </p>
                  <p className="text-[11px] text-rose-700 dark:text-rose-300 font-medium">
                    {selectedPhc.criticalShortageItems.join(', ')}
                  </p>
                </div>
              )}

              {/* Real-time Telemetry Metrics */}
              <div className="space-y-2 text-xs">
                {/* Medicine Stock */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                      <Pill className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                      Medicine Stock Level
                    </span>
                    <span className={`font-black ${selectedPhc.medicineStockPct < 40 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {selectedPhc.medicineStockPct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        selectedPhc.medicineStockPct < 40
                          ? 'bg-rose-500'
                          : selectedPhc.medicineStockPct < 70
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${selectedPhc.medicineStockPct}%` }}
                    />
                  </div>
                </div>

                {/* Beds */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Bed className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                    Beds Available
                  </span>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    {selectedPhc.availableBeds} / {selectedPhc.totalBeds} Free
                  </span>
                </div>

                {/* Staff Attendance */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                    Staff Attendance
                  </span>
                  <span className={`font-black ${selectedPhc.staffAttendancePct < 75 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-900 dark:text-slate-100'}`}>
                    {selectedPhc.staffAttendancePct}%
                  </span>
                </div>

                {/* Today's Footfall */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <Activity className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                    Today's Patients
                  </span>
                  <span className="font-black text-slate-900 dark:text-slate-100">
                    {selectedPhc.todaysPatients} Patients
                  </span>
                </div>

                {/* Stock-out Risk */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                    <ShieldAlert className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                    Stock-out Risk
                  </span>
                  <span
                    className={`font-black px-2 py-0.5 rounded text-[10px] ${
                      selectedPhc.stockoutRisk === 'CRITICAL' || selectedPhc.stockoutRisk === 'HIGH'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                        : selectedPhc.stockoutRisk === 'MODERATE'
                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                    }`}
                  >
                    {selectedPhc.stockoutRisk}
                  </span>
                </div>
              </div>

              {/* Medical Officer Contact */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">{selectedPhc.contactPerson}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">Medical Officer In-Charge</p>
                </div>
                <a
                  href={`tel:${selectedPhc.phone}`}
                  className="font-bold text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline text-xs"
                >
                  <Phone className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  {selectedPhc.phone}
                </a>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setIsTransferModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-teal-600 dark:bg-teal-500 text-white font-bold text-xs hover:bg-teal-700 dark:hover:bg-teal-600 transition shadow-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Initiate AI Rebalance Transfer</span>
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center text-slate-500 dark:text-slate-400 text-xs">
              Click any marker on the map to inspect full clinical telemetry.
            </div>
          )}

          {/* 3.3 Scrollable Matching Facilities List */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-card">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Matching Facilities ({filteredPHCs.length})
              </span>
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {filteredPHCs.length > 0 ? (
                filteredPHCs.map((phc) => (
                  <button
                    key={phc.id}
                    type="button"
                    onClick={() => setSelectedPhc(phc)}
                    className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition border ${
                      selectedPhc?.id === phc.id
                        ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200 font-bold shadow-xs'
                        : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="font-bold text-slate-900 dark:text-slate-100 truncate">{phc.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{phc.district}, {phc.state}</p>
                    </div>
                    <span
                      className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded shrink-0 ${
                        phc.status === 'critical'
                          ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                          : phc.status === 'low_resources'
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                          : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {phc.status === 'low_resources' ? 'Low Stock' : phc.status}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No PHCs match the selected filters.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. New Transfer Modal */}
      <NewTransferModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        hospitals={hospitals}
        onConfirmTransfer={onCreateTransfer}
      />
    </div>
  );
};
