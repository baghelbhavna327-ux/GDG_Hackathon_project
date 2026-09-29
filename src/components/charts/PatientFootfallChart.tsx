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
import { mockPatientFootfall } from '../../data/mockData';
import { Users, TrendingUp } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const PatientFootfallChart: React.FC = () => {
  const { isDark } = useTheme();

  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const axisColor = isDark ? '#94a3b8' : '#64748b';
  const axisLineColor = isDark ? '#334155' : '#e2e8f0';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card flex flex-col justify-between transition-colors duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-50 text-sm sm:text-base">Regional Patient Footfall (Last 7 Days)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Daily OPD attendance, emergency triage & tele-consultations</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto">
          <TrendingUp className="h-3.5 w-3.5" />
          +18.9% 7-day surge
        </div>
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockPatientFootfall} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <YAxis tick={{ fontSize: 11, fill: axisColor }} tickLine={false} axisLine={{ stroke: axisLineColor }} />
            <Tooltip
              formatter={(val: number) => [`${val.toLocaleString()} Patients`, '']}
              contentStyle={{
                backgroundColor: isDark ? '#1e293b' : '#ffffff',
                borderRadius: '8px',
                border: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)',
                color: isDark ? '#f8fafc' : '#0f172a',
                fontSize: '12px',
              }}
            />
            <Legend verticalAlign="top" height={32} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="opdVisits" name="OPD Consultations" stackId="a" fill="#0284c7" radius={[0, 0, 0, 0]} />
            <Bar dataKey="emergencyVisits" name="Emergency Triage" stackId="a" fill="#e11d48" radius={[0, 0, 0, 0]} />
            <Bar dataKey="teleConsults" name="Tele-Consults" stackId="a" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>Today's Total: 3,570 Patients</span>
        <span className="font-semibold text-slate-700 dark:text-slate-300">Central MP Cluster Avg: 2,544/day</span>
      </div>
    </div>
  );
};
