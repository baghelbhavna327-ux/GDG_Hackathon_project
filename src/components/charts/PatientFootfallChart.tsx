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

export const PatientFootfallChart: React.FC = () => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">Regional Patient Footfall (Last 7 Days)</h3>
            <p className="text-xs text-slate-500">Daily OPD attendance, emergency triage & tele-consultations</p>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 self-start sm:self-auto">
          <TrendingUp className="h-3.5 w-3.5" />
          +18.9% 7-day surge
        </div>
      </div>

      <div className="h-64 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mockPatientFootfall} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#e2e8f0' }} />
            <Tooltip
              formatter={(val: number) => [`${val.toLocaleString()} Patients`, '']}
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
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

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Today's Total: 3,570 Patients</span>
        <span className="font-semibold text-slate-700">Central MP Cluster Avg: 2,544/day</span>
      </div>
    </div>
  );
};
