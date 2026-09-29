import React from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { ForecastTimeSeriesPoint } from '../../data/forecastMockData';
import { TrendingUp, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface AiForecastInteractiveChartProps {
  data: ForecastTimeSeriesPoint[];
  medicineName: string;
  forecastPeriod: '7 days' | '30 days';
  currentStock: number;
}

export const AiForecastInteractiveChart: React.FC<AiForecastInteractiveChartProps> = ({
  data,
  medicineName,
  forecastPeriod,
  currentStock,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
              Consumption History & AI Demand Forecast ({forecastPeriod})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {medicineName} • Daily Historical Outflow vs Neural Model Projection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 px-2.5 py-1 rounded border border-teal-200 dark:border-teal-800/60">
            Initial Stock: {currentStock} units
          </span>
        </div>
      </div>

      <div className="h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 15, right: 15, left: -20, bottom: 5 }}>
            <defs>
              <linearGradient id="runwayGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#f1f5f9'} />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 11, fill: isDark ? '#94a3b8' : '#64748b' }} tickLine={false} axisLine={{ stroke: isDark ? '#334155' : '#e2e8f0' }} />
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
            <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingBottom: '10px', color: isDark ? '#cbd5e1' : '#475569' }} />
            <ReferenceLine y={0} stroke="#e11d48" strokeWidth={1.5} label={{ value: 'Stock-Out Threshold (0 Units)', fill: '#e11d48', fontSize: 10, position: 'insideBottomRight' }} />

            {/* Historical Consumption Bar */}
            <Bar
              dataKey="historicalConsumption"
              name="Historical Consumption"
              fill={isDark ? '#475569' : '#94a3b8'}
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />

            {/* Predicted Demand Line */}
            <Line
              type="monotone"
              dataKey="predictedDemand"
              name="Predicted Demand"
              stroke="#38bdf8"
              strokeWidth={2.5}
              strokeDasharray="4 4"
              dot={{ fill: '#38bdf8', r: 3 }}
            />

            {/* Current Stock Runway Trajectory */}
            <Line
              type="monotone"
              dataKey="currentStockRunway"
              name="Stock Runway Trajectory"
              stroke="#0d9488"
              strokeWidth={2.5}
              dot={{ fill: '#0d9488', r: 3 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-500" /> Grey Bars: Historical Consumption
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> Blue Dashed: AI Predicted Demand
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-teal-600 dark:bg-teal-500" /> Teal Line: Stock Runway
        </span>
      </div>
    </div>
  );
};
