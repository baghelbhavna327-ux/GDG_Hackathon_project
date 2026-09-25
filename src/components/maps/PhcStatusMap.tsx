import React, { useEffect, useRef } from 'react';
import { PHCNode } from '../../data/mockData';
import L from 'leaflet';
import { MapPin, Info } from 'lucide-react';

interface PhcStatusMapProps {
  nodes: PHCNode[];
  selectedNodeId?: string | null;
  onSelectNode?: (node: PHCNode) => void;
  height?: string;
}

export const PhcStatusMap: React.FC<PhcStatusMapProps> = ({
  nodes,
  selectedNodeId,
  onSelectNode,
  height = '480px',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [id: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Centered on Central India / Madhya Pradesh (Bhopal/Guna region)
      const map = L.map(mapContainerRef.current, {
        center: [23.8000, 77.5000],
        zoom: 7,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // Clean Carto light tile layer
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

    nodes.forEach((node) => {
      let markerColor = '#10b981'; // Green = normal
      let pulseRing = '';

      if (node.status === 'critical') {
        markerColor = '#ef4444'; // Red = critical
        pulseRing = '<div class="absolute -inset-2.5 rounded-full bg-rose-500 opacity-40 animate-ping"></div>';
      } else if (node.status === 'warning') {
        markerColor = '#f59e0b'; // Yellow/Amber = warning
      }

      const customHtml = `
        <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110">
          ${pulseRing}
          <div style="background-color: ${markerColor};" class="relative z-10 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-lg ring-2 ring-white">
            <svg class="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: customHtml,
        className: 'custom-phc-pin',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
        popupAnchor: [0, -16],
      });

      const marker = L.marker(node.coordinates, { icon }).addTo(map);

      const statusBadgeHtml = node.status === 'critical'
        ? '<span class="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px] uppercase">Critical</span>'
        : node.status === 'warning'
        ? '<span class="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">Warning</span>'
        : '<span class="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">Normal</span>';

      const shortagesHtml = node.criticalShortages.length > 0
        ? `<div class="p-1.5 rounded bg-rose-50 border border-rose-100 text-[11px] text-rose-800 font-semibold mb-2">⚠️ Alert: ${node.criticalShortages.join(', ')}</div>`
        : '';

      const popupHtml = `
        <div class="p-3.5 min-w-[250px] font-sans">
          <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
            <div>
              <h4 class="font-bold text-slate-900 text-sm leading-tight">${node.name}</h4>
              <p class="text-[10px] text-slate-500">${node.district} District • ${node.code}</p>
            </div>
            ${statusBadgeHtml}
          </div>

          ${shortagesHtml}

          <div class="space-y-1.5 text-xs text-slate-600 mb-3">
            <div class="flex items-center justify-between">
              <span>Available Beds:</span>
              <span class="font-bold text-slate-900">${node.availableBeds} / ${node.totalBeds} (${Math.round((node.availableBeds/node.totalBeds)*100)}%)</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Staff Attendance:</span>
              <span class="font-semibold ${node.staffAttendancePct < 75 ? 'text-rose-600 font-bold' : 'text-slate-900'}">${node.staffAttendancePct}%</span>
            </div>
            <div class="flex items-center justify-between">
              <span>Oxygen Buffer:</span>
              <span class="font-semibold text-slate-900">${node.oxygenLevelPct}%</span>
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
            <span class="text-slate-500">Dr. ${node.contactPerson.replace('Dr. ', '')}</span>
            <span class="font-bold text-teal-600 hover:underline cursor-pointer">View Node Telemetry</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        if (onSelectNode) {
          onSelectNode(node);
        }
      });

      markersRef.current[node.id] = marker;
    });

    if (selectedNodeId && markersRef.current[selectedNodeId]) {
      const selected = nodes.find(n => n.id === selectedNodeId);
      if (selected) {
        map.setView(selected.coordinates, 9, { animate: true });
        markersRef.current[selectedNodeId].openPopup();
      }
    }
  }, [nodes, selectedNodeId, onSelectNode]);

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">PHC Status Map (India & District Network)</h3>
          </div>
          <p className="text-xs text-slate-500">Live operational status across Primary Health Centers in Central India</p>
        </div>

        {/* Small Legend */}
        <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-700 font-medium">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-700 font-medium">Warning</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-700 font-bold">Critical</span>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div 
        ref={mapContainerRef} 
        style={{ height }} 
        className="w-full rounded-lg border border-slate-200" 
      />
    </div>
  );
};
