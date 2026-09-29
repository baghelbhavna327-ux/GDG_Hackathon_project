import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { mockMedicineDemand } from '../../data/mockData';
import { Pill, AlertTriangle, TrendingDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const MedicineDemandChart: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <Pill className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">Medicine Demand vs. Stock Runway (7 Days)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Paracetamol 500mg (Guna PHC-04 Network Forecast)</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-800/60 self-start sm:self-auto">
          <TrendingDown className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
          Stock-Out Risk: Day 4
        </div>
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={mockMedicineDemand} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} domain={[0, 500]} />
            <Tooltip
              formatter={(val: number) => [`${val} Units`, '']}
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
                fontSize: '12px',
                color: isDark ? '#f8fafc' : '#0f172a',
              }}
            />
            <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px', color: isDark ? '#cbd5e1' : '#475569' }} />
            <ReferenceLine y={120} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Safety Buffer (120)', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
            
            {/* Current Stock Area */}
            <Area
              type="monotone"
              dataKey="currentStock"
              name="Current Available Stock"
              stroke="#0d9488"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#stockGrad)"
            />
            
            {/* Predicted Demand Line */}
            <Line
              type="monotone"
              dataKey="predictedDemand"
              name="AI Predicted Demand"
              stroke="#e11d48"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ fill: '#e11d48', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Burn Rate: ~160 units/day</span>
        <span className="font-semibold text-rose-600 dark:text-rose-400">Deficit Projected: -185 units by Day 5</span>
      </div>
    </div>
  );
};
