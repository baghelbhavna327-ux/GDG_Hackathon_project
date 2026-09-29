import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { DemandForecastPoint } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface DemandForecastChartProps {
  data: DemandForecastPoint[];
}

export const DemandForecastChart: React.FC<DemandForecastChartProps> = ({ data }) => {
  const { isDark } = useTheme();

  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const axisLineColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">Network Inpatient Demand & Surge Projection</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">24-hour predictive trend based on ER triage inflow velocity</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-1 rounded border border-teal-200 dark:border-teal-800/80">
            <span className="h-2 w-2 rounded-full bg-teal-500" />
            AI Confidence 94.2%
          </span>
        </div>
      </div>

      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="predictedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="timeLabel" tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} domain={[700, 1050]} tickLine={false} axisLine={{ stroke: axisLineColor }} />
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
            <ReferenceLine y={950} stroke="#e11d48" strokeDasharray="4 4" label={{ value: 'Capacity Threshold (950)', fill: '#e11d48', fontSize: 11, position: 'insideTopRight' }} />
            <Area
              type="monotone"
              dataKey="actualOccupancy"
              name="Actual Inpatients"
              stroke="#0284c7"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#actualGrad)"
            />
            <Area
              type="monotone"
              dataKey="predictedOccupancy"
              name="AI Predicted Curve"
              stroke="#0d9488"
              strokeWidth={2.5}
              strokeDasharray="5 5"
              fillOpacity={1}
              fill="url(#predictedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
