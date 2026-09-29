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
import { useTheme } from '../../context/ThemeContext';

interface BedCapacityBarChartProps {
  hospitals: Hospital[];
}

export const BedCapacityBarChart: React.FC<BedCapacityBarChartProps> = ({ hospitals }) => {
  const { isDark } = useTheme();

  const data = hospitals.map(h => ({
    name: h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''),
    Available: h.totalBeds - h.occupiedBeds,
    Occupied: h.occupiedBeds,
    IcuAvailable: h.icuTotal - h.icuOccupied,
    IcuOccupied: h.icuOccupied,
  }));

  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const axisLineColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-colors duration-200">
      <div className="pb-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">Inpatient Bed Headroom & Availability</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Breakdown of available vs occupied general and ICU beds</p>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '12px',
              }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', paddingBottom: '10px' }} />
            <Bar dataKey="Occupied" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Available" stackId="a" fill={isDark ? '#0d9488' : '#a5f3fc'} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
