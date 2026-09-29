import React, { useEffect, useRef } from 'react';
import { IndiaPHC } from '../../types';
import L from 'leaflet';
import { MapPin, ShieldCheck } from 'lucide-react';

interface StaticIndiaPhcMapProps {
  phcList: IndiaPHC[];
  height?: string;
  initialCenter?: [number, number];
  initialZoom?: number;
}

export const StaticIndiaPhcMap: React.FC<StaticIndiaPhcMapProps> = ({
  phcList,
  height = '340px',
  initialCenter = [22.5937, 78.9629], // Geographic center of India
  initialZoom = 4.8,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  // Initialize Static Map with interactions completely disabled
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
        zoomControl: false,
        dragging: false,
        touchZoom: false,
        scrollWheelZoom: false,
        doubleClickZoom: false,
        boxZoom: false,
        keyboard: false,
        attributionControl: true,
      });

      // 100% English-language Esri World Street Map (Crisp boundaries, English labels, no watermarks)
      L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'Tiles &copy; Esri &mdash; DeLorme, NAVTEQ, USGS, Intermap',
          maxZoom: 18,
        }
      ).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Handle container resize automatically so markers remain accurate
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
      map.setView(initialCenter, initialZoom, { animate: false });
    });

    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [initialCenter, initialZoom]);

  // Render Visual Markers (Non-interactive)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    phcList.forEach((phc) => {
      if (!phc.coordinates || phc.coordinates.length !== 2) return;
      const [lat, lng] = phc.coordinates;
      if (isNaN(lat) || isNaN(lng)) return;

      // Color coding: Green = Normal, Orange = Low Stock, Red = Critical
      let markerColor = '#10b981'; // Green (Normal)
      let pulseRing = '';

      if (phc.status === 'critical') {
        markerColor = '#ef4444'; // Red (Critical)
        pulseRing = '<div class="absolute -inset-1.5 rounded-full bg-rose-500/60 animate-ping"></div>';
      } else if (phc.status === 'low_resources') {
        markerColor = '#f59e0b'; // Orange (Low stock)
      }

      // Pure visual marker without click handlers or popups
      const customHtml = `
        <div class="relative flex items-center justify-center pointer-events-none select-none">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="relative z-10 flex h-6 w-6 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white">
            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
              <path d="M19 10.5h-4.5V6a1.5 1.5 0 0 0-3 0v4.5H7a1.5 1.5 0 0 0 0 3h4.5V18a1.5 1.5 0 0 0 3 0v-4.5H19a1.5 1.5 0 0 0 0-3Z"/>
            </svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'static-phc-marker-node',
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      // Marker is purely static visual indicator (interactive: false)
      const marker = L.marker([lat, lng], { icon, interactive: false }).addTo(map);
      markersRef.current[phc.id] = marker;
    });
  }, [phcList]);

  const normalCount = phcList.filter((p) => p.status === 'normal').length;
  const lowCount = phcList.filter((p) => p.status === 'low_resources').length;
  const criticalCount = phcList.filter((p) => p.status === 'critical').length;

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
      {/* Map Header / Static Telemetry Banner */}
      <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200 gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-teal-600" />
          <span className="text-xs font-bold text-slate-800">
            National PHC Geographic Distribution
          </span>
          <span className="text-[10px] font-bold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
            {phcList.length} Active Nodes
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
            <span className="text-slate-600 font-medium">Normal ({normalCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 ring-2 ring-amber-200" />
            <span className="text-slate-600 font-medium">Low Stock ({lowCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-200 animate-pulse" />
            <span className="text-rose-700 font-bold">Critical ({criticalCount})</span>
          </div>
        </div>
      </div>

      {/* Static Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full relative z-0 pointer-events-none select-none cursor-default" 
      />
    </div>
  );
};
