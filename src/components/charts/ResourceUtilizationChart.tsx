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

interface ResourceUtilizationChartProps {
  hospitals: Hospital[];
}

export const ResourceUtilizationChart: React.FC<ResourceUtilizationChartProps> = ({ hospitals }) => {
  const chartData = hospitals.map(h => ({
    name: h.name.split(' ')[0] + ' ' + (h.name.split(' ')[1] || ''),
    icuOccupancy: Math.round((h.icuOccupied / h.icuTotal) * 100),
    ventilatorUsage: Math.round((h.ventilatorsOccupied / h.ventilatorsTotal) * 100),
    bedOccupancy: Math.round((h.occupiedBeds / h.totalBeds) * 100),
  }));

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 text-base">Facility Resource Pressure (%)</h3>
          <p className="text-xs text-slate-500">Utilization percentage across ICU, Ventilators, and Inpatient Beds</p>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} domain={[0, 100]} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip
              formatter={(val: number) => [`${val}%`, '']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
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
