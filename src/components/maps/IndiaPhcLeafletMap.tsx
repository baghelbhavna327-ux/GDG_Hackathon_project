import React, { useEffect, useRef, useState } from 'react';
import { IndiaPHC } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RotateCcw, ZoomIn, ZoomOut, Layers, Target } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface IndiaPhcLeafletMapProps {
  phcList: IndiaPHC[];
  selectedPhcId?: string | null;
  onSelectPhc?: (phc: IndiaPHC) => void;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

type BasemapStyle = 'streets' | 'topo' | 'dark' | 'osm';

export const IndiaPhcLeafletMap: React.FC<IndiaPhcLeafletMapProps> = ({
  phcList,
  selectedPhcId,
  onSelectPhc,
  height = '620px',
  initialCenter = [22.5937, 78.9629], // Geographic center of India
  initialZoom = 5,
}) => {
  const { isDark } = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const darkLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [activeBasemap, setActiveBasemap] = useState<BasemapStyle>(() => (isDark ? 'dark' : 'streets'));
  const [showLayerMenu, setShowLayerMenu] = useState(false);
  const userSelectedStyleRef = useRef(false);

  // Sync with global theme if user hasn't manually overridden
  useEffect(() => {
    if (!userSelectedStyleRef.current) {
      setActiveBasemap(isDark ? 'dark' : 'streets');
    }
  }, [isDark]);

  // Helper to switch basemap tile layer
  const applyTileLayer = (map: L.Map, style: BasemapStyle) => {
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }
    if (darkLabelsLayerRef.current) {
      map.removeLayer(darkLabelsLayerRef.current);
      darkLabelsLayerRef.current = null;
    }

    if (style === 'streets') {
      currentTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, METI',
          maxZoom: 18,
        }
      ).addTo(map);
    } else if (style === 'topo') {
      currentTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS',
          maxZoom: 18,
        }
      ).addTo(map);
    } else if (style === 'dark') {
      currentTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
          maxZoom: 16,
        }
      ).addTo(map);

      darkLabelsLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
        {
          maxZoom: 16,
        }
      ).addTo(map);
    } else {
      currentTileLayerRef.current = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
          subdomains: ['a', 'b', 'c'],
          maxZoom: 19,
        }
      ).addTo(map);
    }
  };

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up any existing map instance on this container
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: initialZoom,
      zoomControl: false,
      dragging: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      boxZoom: true,
      keyboard: true,
      minZoom: 3,
      maxZoom: 18,
      trackResize: true,
    });

    // Layer group for clean marker management
    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;

    applyTileLayer(map, activeBasemap);
    mapInstanceRef.current = map;

    // Isolate custom controls and legend from capturing map drag events
    if (controlsRef.current) {
      L.DomEvent.disableClickPropagation(controlsRef.current);
      L.DomEvent.disableScrollPropagation(controlsRef.current);
    }
    if (legendRef.current) {
      L.DomEvent.disableClickPropagation(legendRef.current);
      L.DomEvent.disableScrollPropagation(legendRef.current);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    const initTimer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    }, 150);

    return () => {
      clearTimeout(initTimer);
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      currentTileLayerRef.current = null;
      darkLabelsLayerRef.current = null;
    };
  }, []); // Mount once and preserve map instance across re-renders

  // Handle Basemap Switching
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, activeBasemap);
    }
  }, [activeBasemap]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersLayerRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // Active disease districts lookup
    const diseaseDistricts: Record<string, { disease: string; severity: string; impact: string }> = {
      'guna': { disease: 'Dengue & Vector-Borne Viral Surge', severity: 'HIGH', impact: '+49%' },
      'indore': { disease: 'Acute Diarrheal & Waterborne Influx', severity: 'HIGH', impact: '+44%' },
      'bhopal': { disease: 'Seasonal Influenza & ARI', severity: 'MEDIUM', impact: '+32%' },
      'jaipur': { disease: 'Vector-Borne Surveillance Alert', severity: 'MEDIUM', impact: '+29%' },
      'ahmedabad': { disease: 'Seasonal Gastroenteritis Advisory', severity: 'MEDIUM', impact: '+28%' },
    };

    phcList.forEach((phc) => {
      if (!phc.coordinates || phc.coordinates.length !== 2) return;
      const [lat, lng] = phc.coordinates;
      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = selectedPhcId === phc.id;
      const districtKey = (phc.district || '').toLowerCase().trim();
      const diseaseSignal = diseaseDistricts[districtKey];

      let markerColor = '#10b981'; // Green (Normal)
      let pulseRing = '';

      if (phc.status === 'critical') {
        markerColor = '#ef4444'; // Red
        pulseRing = '<div class="absolute -inset-2 rounded-full bg-rose-500/50 animate-ping pointer-events-none"></div>';
      } else if (phc.status === 'low_resources') {
        markerColor = '#f59e0b'; // Orange
      } else if (diseaseSignal) {
        markerColor = '#eab308'; // Yellow (Disease Demand Pressure)
        pulseRing = '<div class="absolute -inset-1.5 rounded-full bg-yellow-400/40 animate-pulse pointer-events-none"></div>';
      }

      const isHighlight = isSelected ? 'scale-125 ring-4 ring-teal-600 z-50' : 'hover:scale-115';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isHighlight}">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white">
            <svg class="w-4 h-4 fill-current pointer-events-none" viewBox="0 0 24 24">
              <path d="M19 10.5h-4.5V6a1.5 1.5 0 0 0-3 0v4.5H7a1.5 1.5 0 0 0 0 3h4.5V18a1.5 1.5 0 0 0 3 0v-4.5H19a1.5 1.5 0 0 0 0-3Z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45 pointer-events-none" style="background-color: ${markerColor};"></div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-phc-marker-node',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([lat, lng], { icon });

      const statusBadge = 
        phc.status === 'critical'
          ? '<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider border border-rose-200">Critical Stock</span>'
          : phc.status === 'low_resources'
          ? '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider border border-amber-200">Low Stock</span>'
          : diseaseSignal
          ? '<span class="px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-bold text-[10px] uppercase tracking-wider border border-yellow-300">Disease Pressure</span>'
          : '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">Normal</span>';

      const diseaseBannerHtml = diseaseSignal
        ? `<div class="p-2 rounded-lg bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 font-medium mb-2 space-y-0.5">
             <div class="flex items-center justify-between font-bold text-amber-950 text-[10px] uppercase tracking-wider">
               <span>🦠 ${diseaseSignal.disease}</span>
               <span class="text-rose-600">${diseaseSignal.impact}</span>
             </div>
             <p class="text-[10px] text-amber-700">Surveillance: IDSP / NCDC Multi-State Health Grid</p>
           </div>`
        : '';

      const shortagesHtml = phc.criticalShortageItems && phc.criticalShortageItems.length > 0
        ? `<div class="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-medium mb-2.5">
             <span class="font-bold text-rose-900 block text-[10px] uppercase tracking-wider">⚠️ Critical Shortage:</span>
             ${phc.criticalShortageItems.join(', ')}
           </div>`
        : '';

      const popupHtml = `
        <div class="p-3.5 min-w-[270px] font-sans text-slate-800">
          <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
            <div>
              <span class="text-[9px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block mb-1">
                ${phc.code || 'PHC'}
              </span>
              <h4 class="font-extrabold text-slate-900 text-sm leading-tight">${phc.name}</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">${phc.district}, ${phc.state} • PIN: ${phc.pincode || 'N/A'}</p>
            </div>
            ${statusBadge}
          </div>

          ${diseaseBannerHtml}
          ${shortagesHtml}

          <div class="space-y-1.5 text-xs text-slate-600 mb-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Medicine Stock:</span>
              <span class="font-bold ${phc.medicineStockPct < 40 ? 'text-rose-600' : 'text-slate-900'}">${phc.medicineStockPct}% Available</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Bed Availability:</span>
              <span class="font-bold text-slate-900">${phc.availableBeds} / ${phc.totalBeds} Beds</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Staff Attendance:</span>
              <span class="font-bold ${phc.staffAttendancePct < 75 ? 'text-amber-700' : 'text-slate-900'}">${phc.staffAttendancePct}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Today's Footfall:</span>
              <span class="font-bold text-slate-900">${phc.todaysPatients} Patients</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span class="text-slate-500 font-medium">${phc.contactPerson || 'Medical Officer In-Charge'}</span>
            <span class="font-bold text-teal-600 hover:text-teal-700 hover:underline cursor-pointer">
              View PHC Details →
            </span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectPhc) {
          onSelectPhc(phc);
        }
      });

      markersGroup.addLayer(marker);
    });
  }, [phcList, selectedPhcId, onSelectPhc]);

  // Controls Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetView = () => {
    mapInstanceRef.current?.setView(initialCenter, initialZoom, { animate: true });
  };

  const handleLocateAll = () => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const validCoordinates = phcList
      .filter((p) => p.coordinates && p.coordinates.length === 2 && !isNaN(p.coordinates[0]) && !isNaN(p.coordinates[1]))
      .map((p) => p.coordinates);

    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
    }
  };

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-card bg-white dark:bg-slate-900 transition-colors duration-200">
      {/* Interactive Leaflet Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full relative z-0" 
      />

      {/* Top-Right: Zoom, Reset View, Locate All & English Basemap Switcher Controls */}
      <div 
        ref={controlsRef}
        className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-md rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm p-1 text-slate-700 dark:text-slate-200"
      >
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In (+)"
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer active:scale-95"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out (-)"
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer active:scale-95"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-0.5" />
        <button
          type="button"
          onClick={handleResetView}
          title="Reset View — Return to Default India Map Position"
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer active:scale-95"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={handleLocateAll}
          title="Locate All PHCs — Fit All Facility Markers into View"
          className="p-2 text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition cursor-pointer active:scale-95"
        >
          <Target className="h-4 w-4" />
        </button>
        <div className="h-px bg-slate-200 dark:bg-slate-700 my-0.5" />
        <button
          type="button"
          onClick={() => setShowLayerMenu(!showLayerMenu)}
          title="Map Style (English Labels)"
          className={`p-2 rounded-lg transition cursor-pointer active:scale-95 ${
            showLayerMenu ? 'bg-teal-600 text-white' : 'text-slate-700 dark:text-slate-200 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Layers className="h-4 w-4" />
        </button>
      </div>

      {/* Layer Style Menu Dropdown */}
      {showLayerMenu && (
        <div className="absolute top-4 right-16 z-20 bg-white/95 dark:bg-slate-900/98 backdrop-blur-md rounded-xl p-2 border border-slate-200 dark:border-slate-700 shadow-xl text-xs space-y-1 w-44 animate-in fade-in slide-in-from-right-2 duration-150 text-slate-800 dark:text-slate-100">
          <div className="px-2 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            English Map Style
          </div>
          <button
            type="button"
            onClick={() => {
              userSelectedStyleRef.current = true;
              setActiveBasemap('streets');
              setShowLayerMenu(false);
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeBasemap === 'streets'
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            English Streets (Default)
          </button>
          <button
            type="button"
            onClick={() => {
              userSelectedStyleRef.current = true;
              setActiveBasemap('topo');
              setShowLayerMenu(false);
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeBasemap === 'topo'
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            English Topographic
          </button>
          <button
            type="button"
            onClick={() => {
              userSelectedStyleRef.current = true;
              setActiveBasemap('dark');
              setShowLayerMenu(false);
            }}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeBasemap === 'dark'
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Command Dark Canvas
          </button>
        </div>
      )}

      {/* Bottom-Left: Map Legend Overlay (English) */}
      <div 
        ref={legendRef}
        className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3 border border-slate-200/90 dark:border-slate-700/90 shadow-lg text-xs"
      >
        <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
          PHC & Surveillance Status Legend
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500 shadow-xs ring-2 ring-emerald-200 dark:ring-emerald-900/50" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Normal Stock (&ge;70%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-yellow-500 shadow-xs ring-2 ring-yellow-200 dark:ring-yellow-900/50 animate-pulse" />
            <span className="text-yellow-700 dark:text-yellow-400 font-semibold">Disease Demand Pressure</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500 shadow-xs ring-2 ring-amber-200 dark:ring-amber-900/50" />
            <span className="text-slate-700 dark:text-slate-200 font-semibold">Low Stock (40% - 69%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500 shadow-xs ring-2 ring-rose-200 dark:ring-rose-900/50 animate-pulse" />
            <span className="text-rose-700 dark:text-rose-400 font-bold">Critical Stock (&lt;40%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
