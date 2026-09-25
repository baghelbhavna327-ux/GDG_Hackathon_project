import React, { useEffect, useRef } from 'react';
import { Hospital } from '../../types';
import L from 'leaflet';

interface ResourceMapProps {
  hospitals: Hospital[];
  selectedHospitalId?: string | null;
  onSelectHospital?: (hospitalId: string) => void;
  height?: string;
}

export const ResourceMap: React.FC<ResourceMapProps> = ({
  hospitals,
  selectedHospitalId,
  onSelectHospital,
  height = '480px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Center on the network geographic midpoint (San Francisco Metro area)
      const map = L.map(mapContainerRef.current, {
        center: [37.7749, -122.4194],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Clean, modern light carto basemap
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    hospitals.forEach((hospital) => {
      const isSelected = selectedHospitalId === hospital.id;
      const isCritical = hospital.status === 'critical' || hospital.status === 'surge';
      const isModerate = hospital.status === 'moderate';

      let markerColor = '#10b981'; // optimal
      let pulseRing = '';
      if (hospital.status === 'critical' || hospital.status === 'surge') {
        markerColor = '#e11d48';
        pulseRing = '<div class="absolute -inset-2 rounded-full bg-rose-500 opacity-40 animate-ping"></div>';
      } else if (isModerate) {
        markerColor = '#0284c7';
      }

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white">
            <svg class="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-leaflet-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker(hospital.coordinates, { icon }).addTo(map);

      // Popup Content
      const popupHtml = `
        <div class="p-3.5 min-w-[240px] font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <h4 class="font-bold text-slate-900 text-sm leading-tight">${hospital.name}</h4>
            <span class="text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded ${
              isCritical ? 'bg-rose-100 text-rose-700' : isModerate ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
            }">${hospital.status}</span>
          </div>
          
          <div class="space-y-1.5 text-xs text-slate-600 mb-3">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-slate-400"></span>Inpatient Beds:</span>
              <span class="font-semibold text-slate-900">${hospital.occupiedBeds}/${hospital.totalBeds} (${Math.round((hospital.occupiedBeds/hospital.totalBeds)*100)}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-teal-500"></span>ICU Capacity:</span>
              <span class="font-semibold text-slate-900">${hospital.icuOccupied}/${hospital.icuTotal} (${Math.round((hospital.icuOccupied/hospital.icuTotal)*100)}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-cyan-500"></span>Oxygen Reserve:</span>
              <span class="font-semibold ${hospital.oxygenLevelPct < 50 ? 'text-rose-600 font-bold' : 'text-slate-900'}">${hospital.oxygenLevelPct}%</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span class="text-slate-500">${hospital.region}</span>
            <span class="font-bold text-teal-600 cursor-pointer hover:underline">Click for details</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectHospital) {
          onSelectHospital(hospital.id);
        }
      });

      markersRef.current[hospital.id] = marker;
    });

    if (selectedHospitalId && markersRef.current[selectedHospitalId]) {
      const selected = hospitals.find(h => h.id === selectedHospitalId);
      if (selected) {
        map.setView(selected.coordinates, 13, { animate: true });
        markersRef.current[selectedHospitalId].openPopup();
      }
    }

  }, [hospitals, selectedHospitalId, onSelectHospital]);

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-4 shadow-card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Regional Healthcare Geo-Spatial Map</h3>
          <p className="text-xs text-slate-500">Real-time facility status, capacity density & emergency alert nodes</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-600">Optimal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-slate-600">Moderate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-slate-600 font-semibold text-rose-700">Critical/Surge</span>
          </div>
        </div>
      </div>

      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full rounded-lg border border-slate-200" 
      />
    </div>
  );
};
