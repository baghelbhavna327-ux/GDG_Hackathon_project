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

interface ResourceUtilizationChartProps {
  hospitals: Hospital[];
}

export const ResourceUtilizationChart: React.FC<ResourceUtilizationChartProps> = ({ hospitals }) => {
  const { isDark } = useTheme();

  const chartData = hospitals.map(h => ({
    name: h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''),
    icuOccupancy: Math.round((h.icuOccupied / h.icuTotal) * 100),
    ventilatorUsage: Math.round((h.ventilatorsOccupied / h.ventilatorsTotal) * 100),
    bedOccupancy: Math.round((h.occupiedBeds / h.totalBeds) * 100),
  }));

  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const axisLineColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">Facility Resource Pressure (%)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Utilization percentage across ICU, Ventilators, and Inpatient Beds</p>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: axisColor }} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} domain={[0, 100]} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <Tooltip
              formatter={(val: number) => [`${val}%`, '']}
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
            <Bar dataKey="bedOccupancy" name="Bed Occupancy %" fill="#0284c7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="icuOccupancy" name="ICU Load %" fill="#0d9488" radius={[4, 4, 0, 0]} />
            <Bar dataKey="ventilatorUsage" name="Ventilator Usage %" fill="#d97706" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
