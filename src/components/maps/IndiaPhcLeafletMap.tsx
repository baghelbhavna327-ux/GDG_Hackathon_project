import React, { useEffect, useRef } from 'react';
import { IndiaPHC } from '../../types';
import L from 'leaflet';
import { MapPin, Info } from 'lucide-react';

interface IndiaPhcLeafletMapProps {
  phcList: IndiaPHC[];
  selectedPhcId?: string | null;
  onSelectPhc?: (phc: IndiaPHC) => void;
  height?: string;
}

export const IndiaPhcLeafletMap: React.FC<IndiaPhcLeafletMapProps> = ({
  phcList,
  selectedPhcId,
  onSelectPhc,
  height = '560px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on India geographic midpoint
      const map = L.map(mapContainerRef.current, {
        center: [22.8000, 79.5000],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Sleek Voyager Carto basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    phcList.forEach((phc) => {
      let markerColor = '#10b981'; // Green = Normal
      let pulseRing = '';

      if (phc.status === 'critical') {
        markerColor = '#ef4444'; // Red = Critical
        pulseRing = '<div class="absolute -inset-2.5 rounded-full bg-rose-500 opacity-40 animate-ping"></div>';
      } else if (phc.status === 'low_resources') {
        markerColor = '#f59e0b'; // Yellow = Low resources
      }

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-md ring-2 ring-white">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-india-phc-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker(phc.coordinates, { icon }).addTo(map);

      const riskBadgeStyle = 
        phc.stockoutRisk === 'CRITICAL' ? 'bg-rose-100 text-rose-700 font-extrabold' :
        phc.stockoutRisk === 'HIGH' ? 'bg-rose-50 text-rose-600 font-bold' :
        phc.stockoutRisk === 'MODERATE' ? 'bg-amber-100 text-amber-800 font-semibold' :
        'bg-emerald-100 text-emerald-800 font-semibold';

      // Exact requested popup format
      const popupHtml = `
        <div class="p-3.5 min-w-[240px] font-sans">
          <div class="border-b border-slate-100 pb-2 mb-2">
            <h4 class="font-extrabold text-slate-900 text-sm leading-tight">${phc.name}</h4>
            <p class="text-xs text-slate-600 mt-0.5"><span class="font-medium text-slate-500">District:</span> ${phc.district}</p>
            <p class="text-xs text-slate-600"><span class="font-medium text-slate-500">State:</span> ${phc.state}</p>
          </div>

          <div class="space-y-1 text-xs text-slate-700 mb-3">
            <div class="flex items-center justify-between">
              <span class="text-slate-600">Medicine Stock:</span>
              <span class="font-bold ${phc.medicineStockPct < 40 ? 'text-rose-600 font-extrabold' : 'text-slate-900'}">${phc.medicineStockPct}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600">Beds Available:</span>
              <span class="font-bold text-slate-900">${phc.availableBeds}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600">Staff Attendance:</span>
              <span class="font-bold ${phc.staffAttendancePct < 75 ? 'text-amber-700 font-extrabold' : 'text-slate-900'}">${phc.staffAttendancePct}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-600">Today's Patients:</span>
              <span class="font-bold text-slate-900">${phc.todaysPatients}</span>
            </div>
            <div class="flex items-center justify-between pt-1 border-t border-slate-100">
              <span class="text-slate-600 font-semibold">Stock-out Risk:</span>
              <span class="px-2 py-0.5 rounded text-[11px] ${riskBadgeStyle}">${phc.stockoutRisk}</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span class="text-slate-400">PIN: ${phc.pincode}</span>
            <span class="font-bold text-teal-600 hover:underline cursor-pointer">Inspect Telemetry →</span>
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

    if (selectedPhcId && markersRef.current[selectedPhcId]) {
      const selected = phcList.find((p) => p.id === selectedPhcId);
      if (selected) {
        map.setView(selected.coordinates, 8, { animate: true });
        markersRef.current[selectedPhcId].openPopup();
      }
    }
  }, [phcList, selectedPhcId, onSelectPhc]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden border border-slate-200 shadow-card bg-white">
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full" 
      />
    </div>
  );
};
