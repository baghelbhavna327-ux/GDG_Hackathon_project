import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { Hospital } from '../../types';

interface BedCapacityBarChartProps {
  hospitals: Hospital[];
}

export const BedCapacityBarChart: React.FC<BedCapacityBarChartProps> = ({ hospitals }) => {
  const data = hospitals.map(h => ({
    name: h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''),
    Available: h.totalBeds - h.occupiedBeds,
    Occupied: h.occupiedBeds,
    IcuAvailable: h.icuTotal - h.icuOccupied,
    IcuOccupied: h.icuOccupied,
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-900 text-base">Inpatient Bed Headroom & Availability</h3>
        <p className="text-xs text-slate-500">Breakdown of available vs occupied general and ICU beds</p>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                fontSize: '12px',
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
            <Bar dataKey="Occupied" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Available" stackId="a" fill="#a5f3fc" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
