import React, { useEffect, useRef, useState } from 'react';
import { IndiaPHC } from '../../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Target, 
  Layers, 
  MapPin, 
  Pill, 
  Bed, 
  Users, 
  Activity, 
  ShieldAlert, 
  AlertTriangle 
} from 'lucide-react';

interface InteractivePhcManagementMapProps {
  phcList: IndiaPHC[];
  selectedPhcId?: string | null;
  onSelectPhc?: (phc: IndiaPHC) => void;
  onEditPhc?: (phc: IndiaPHC) => void;
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

type BasemapStyle = 'streets' | 'topo' | 'dark';

export const InteractivePhcManagementMap: React.FC<InteractivePhcManagementMapProps> = ({
  phcList,
  selectedPhcId,
  onSelectPhc,
  onEditPhc,
  height = '580px',
  initialCenter = [22.5937, 78.9629], // Geographic center of India
  initialZoom = 5,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const legendRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const currentTileLayerRef = useRef<L.TileLayer | null>(null);
  const darkLabelsLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  const [activeBasemap, setActiveBasemap] = useState<BasemapStyle>('streets');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Switch basemap tile layer
  const applyTileLayer = (map: L.Map, style: BasemapStyle) => {
    if (currentTileLayerRef.current) {
      map.removeLayer(currentTileLayerRef.current);
    }
    if (darkLabelsLayerRef.current) {
      map.removeLayer(darkLabelsLayerRef.current);
      darkLabelsLayerRef.current = null;
    }

    if (style === 'streets') {
      // 100% English-language Esri World Street Map
      currentTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, METI',
          maxZoom: 18,
        }
      ).addTo(map);
    } else if (style === 'topo') {
      // 100% English-language Esri World Topographic Map
      currentTileLayerRef.current = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, USGS',
          maxZoom: 18,
        }
      ).addTo(map);
    } else if (style === 'dark') {
      // Command-center dark canvas with English labels
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
    }
  };

  // Initialize fully interactive Leaflet Map with dragging enabled
  useEffect(() => {
    if (!mapContainerRef.current) return;

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

    applyTileLayer(map, activeBasemap);
    mapInstanceRef.current = map;

    // Isolate custom control overlay events from Leaflet dragging
    if (controlsRef.current) {
      L.DomEvent.disableClickPropagation(controlsRef.current);
      L.DomEvent.disableScrollPropagation(controlsRef.current);
    }
    if (legendRef.current) {
      L.DomEvent.disableClickPropagation(legendRef.current);
      L.DomEvent.disableScrollPropagation(legendRef.current);
    }

    // Handle container resize automatically
    const resizeObserver = new ResizeObserver(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize({ pan: false });
      }
    });

    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      map.remove();
      mapInstanceRef.current = null;
      currentTileLayerRef.current = null;
      darkLabelsLayerRef.current = null;
    };
  }, []);

  // Handle Basemap Switching
  useEffect(() => {
    if (mapInstanceRef.current) {
      applyTileLayer(mapInstanceRef.current, activeBasemap);
    }
  }, [activeBasemap]);

  // Update Markers and Popups without disrupting map dragging or view
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    phcList.forEach((phc) => {
      if (!phc.coordinates || phc.coordinates.length !== 2) return;
      const [lat, lng] = phc.coordinates;
      if (isNaN(lat) || isNaN(lng)) return;

      const isSelected = selectedPhcId === phc.id;

      // Color coding: Green = Normal, Orange = Low Stock, Red = Critical
      let markerColor = '#10b981'; // Green (Normal)
      let pulseRing = '';

      if (phc.status === 'critical') {
        markerColor = '#ef4444'; // Red (Critical)
        pulseRing = '<div class="absolute -inset-2 rounded-full bg-rose-500/50 animate-ping"></div>';
      } else if (phc.status === 'low_resources') {
        markerColor = '#f59e0b'; // Orange (Low stock)
      }

      const isHighlight = isSelected ? 'scale-125 ring-4 ring-teal-600 z-50' : 'hover:scale-115';

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform duration-200 ${isHighlight}">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path d="M19 10.5h-4.5V6a1.5 1.5 0 0 0-3 0v4.5H7a1.5 1.5 0 0 0 0 3h4.5V18a1.5 1.5 0 0 0 3 0v-4.5H19a1.5 1.5 0 0 0 0-3Z"/>
            </svg>
          </div>
          <div class="absolute -bottom-1 w-2 h-2 rotate-45" style="background-color: ${markerColor};"></div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'interactive-phc-marker-node',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);

      // Status Badge HTML
      const statusBadge = 
        phc.status === 'critical'
          ? '<span class="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider border border-rose-200">Critical Stock</span>'
          : phc.status === 'low_resources'
          ? '<span class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider border border-amber-200">Low Stock</span>'
          : '<span class="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider border border-emerald-200">Normal</span>';

      const shortagesHtml = phc.criticalShortageItems && phc.criticalShortageItems.length > 0
        ? `<div class="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-800 font-medium mb-2">
             <span class="font-bold text-rose-900 block text-[10px] uppercase tracking-wider">⚠️ Critical Shortage:</span>
             ${phc.criticalShortageItems.join(', ')}
           </div>`
        : '';

      const popupHtml = `
        <div class="p-3.5 min-w-[260px] font-sans text-slate-800">
          <div class="flex items-start justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <div>
              <span class="text-[9px] font-bold text-teal-700 uppercase tracking-wider bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 inline-block mb-0.5">
                ${phc.code || 'PHC'}
              </span>
              <h4 class="font-extrabold text-slate-900 text-sm leading-tight">${phc.name}</h4>
              <p class="text-[11px] text-slate-500 mt-0.5">${phc.district}, ${phc.state}</p>
            </div>
            ${statusBadge}
          </div>

          ${shortagesHtml}

          <div class="space-y-1.5 text-xs text-slate-600 mb-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Medicine Stock:</span>
              <span class="font-bold ${phc.medicineStockPct < 40 ? 'text-rose-600' : 'text-slate-900'}">${phc.medicineStockPct}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Bed Availability:</span>
              <span class="font-bold text-slate-900">${phc.availableBeds} / ${phc.totalBeds} Free</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Staff Attendance:</span>
              <span class="font-bold ${phc.staffAttendancePct < 75 ? 'text-amber-700' : 'text-slate-900'}">${phc.staffAttendancePct}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500 font-medium">Risk Level:</span>
              <span class="font-extrabold text-[10px] text-slate-900 uppercase">${phc.stockoutRisk || 'NORMAL'}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span class="text-slate-500 font-medium">${phc.contactPerson || 'Medical Officer'}</span>
            <span class="font-bold text-teal-600 hover:text-teal-700 cursor-pointer hover:underline">
              View Telemetry →
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

      markersRef.current[phc.id] = marker;
    });

    // Re-verify dragging is enabled after marker updates
    map.dragging.enable();
  }, [phcList, selectedPhcId, onSelectPhc, onEditPhc]);

  // Map Controls
  const handleZoomIn = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const map = mapInstanceRef.current;
    if (map) {
      map.zoomIn();
      map.dragging.enable();
    }
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const map = mapInstanceRef.current;
    if (map) {
      map.zoomOut();
      map.dragging.enable();
    }
  };

  const handleResetView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const map = mapInstanceRef.current;
    if (map) {
      map.setView(initialCenter, initialZoom, { animate: true });
      map.dragging.enable();
    }
  };

  const handleLocateAll = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const map = mapInstanceRef.current;
    if (!map) return;

    const validCoordinates = phcList
      .filter((p) => p.coordinates && p.coordinates.length === 2 && !isNaN(p.coordinates[0]) && !isNaN(p.coordinates[1]))
      .map((p) => p.coordinates);

    if (validCoordinates.length > 0) {
      const bounds = L.latLngBounds(validCoordinates);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
      map.dragging.enable();
    }
  };

  const normalCount = phcList.filter((p) => p.status === 'normal').length;
  const lowCount = phcList.filter((p) => p.status === 'low_resources').length;
  const criticalCount = phcList.filter((p) => p.status === 'critical').length;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-card bg-white">
      {/* 1. Header / Top Telemetry Banner */}
      <div className="flex flex-wrap items-center justify-between px-5 py-3.5 bg-slate-900 text-white border-b border-slate-800 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight">
              Interactive National PHC Geographic Grid
            </h3>
            <p className="text-[11px] text-slate-400">
              Pan, drag, and zoom across all monitored facilities in India
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs ring-2 ring-emerald-400/40" />
            <span className="text-slate-300">Normal ({normalCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs ring-2 ring-amber-400/40" />
            <span className="text-slate-300">Low Stock ({lowCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-xs ring-2 ring-rose-400/40 animate-pulse" />
            <span className="text-rose-400 font-bold">Critical ({criticalCount})</span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Leaflet Map Container */}
      <div className="relative w-full overflow-hidden" style={{ height }}>
        <div 
          ref={mapContainerRef} 
          style={{ height: '100%', width: '100%' }} 
          className="w-full h-full relative z-0" 
        />

        {/* 3. Floating Top-Right Command-Center Controls Toolbar */}
        <div 
          ref={controlsRef}
          className="absolute top-4 right-4 z-20 flex flex-col gap-1.5 shadow-2xl rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-900/90 backdrop-blur-md p-1.5 text-white"
        >
          <button
            type="button"
            onClick={handleZoomIn}
            title="Zoom In (+)"
            className="p-2 text-slate-200 hover:text-teal-300 hover:bg-slate-800/80 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          
          <button
            type="button"
            onClick={handleZoomOut}
            title="Zoom Out (-)"
            className="p-2 text-slate-200 hover:text-teal-300 hover:bg-slate-800/80 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="h-px bg-slate-700/80 my-0.5" />

          <button
            type="button"
            onClick={handleResetView}
            title="Reset View — Return to Default India Map Position"
            className="p-2 text-slate-200 hover:text-teal-300 hover:bg-slate-800/80 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleLocateAll}
            title="Locate All PHCs — Fit All Facility Markers into View"
            className="p-2 text-slate-200 hover:text-teal-300 hover:bg-slate-800/80 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer"
          >
            <Target className="h-4 w-4" />
          </button>

          <div className="h-px bg-slate-700/80 my-0.5" />

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowLayerMenu(!showLayerMenu);
            }}
            title="Map Style (English Labels)"
            className={`p-2 rounded-xl transition flex items-center justify-center active:scale-95 cursor-pointer ${
              showLayerMenu ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-200 hover:text-teal-300 hover:bg-slate-800/80'
            }`}
          >
            <Layers className="h-4 w-4" />
          </button>
        </div>

        {/* Layer Style Menu Dropdown */}
        {showLayerMenu && (
          <div className="absolute top-4 right-16 z-20 bg-slate-900/95 backdrop-blur-md rounded-2xl p-2 border border-slate-700 shadow-2xl text-xs space-y-1 w-48 text-white animate-in fade-in slide-in-from-right-2 duration-150">
            <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              English Basemap Style
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveBasemap('streets');
                setShowLayerMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeBasemap === 'streets'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              English Streets (Default)
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveBasemap('topo');
                setShowLayerMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeBasemap === 'topo'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              English Topographic
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveBasemap('dark');
                setShowLayerMenu(false);
              }}
              className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeBasemap === 'dark'
                  ? 'bg-teal-500 text-slate-950 font-bold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              Command Dark Canvas
            </button>
          </div>
        )}

        {/* Bottom-Left: Live Map Status Badge */}
        <div 
          ref={legendRef}
          className="absolute bottom-4 left-4 z-20 bg-slate-900/85 backdrop-blur-md rounded-xl px-3 py-1.5 border border-slate-700/80 shadow-lg text-[11px] text-slate-300 font-medium flex items-center gap-2"
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Interactive Grid Telemetry • {phcList.length} Facilities Active</span>
        </div>
      </div>
    </div>
  );
};
