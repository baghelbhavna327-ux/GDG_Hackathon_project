import React from 'react';
import { Hospital } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Activity, Phone, MapPin, ChevronRight } from 'lucide-react';

interface HospitalStatusTableProps {
  hospitals: Hospital[];
  onSelectHospital?: (hospital: Hospital) => void;
}

export const HospitalStatusTable: React.FC<HospitalStatusTableProps> = ({
  hospitals,
  onSelectHospital,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3.5">Facility Name</th>
              <th scope="col" className="px-4 py-3.5">Region & Type</th>
              <th scope="col" className="px-4 py-3.5">Bed Occupancy</th>
              <th scope="col" className="px-4 py-3.5">ICU Capacity</th>
              <th scope="col" className="px-4 py-3.5">Oxygen Reserve</th>
              <th scope="col" className="px-4 py-3.5">AI Surge Risk</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {hospitals.map((hospital) => {
              const bedPct = Math.round((hospital.occupiedBeds / hospital.totalBeds) * 100);
              const icuPct = Math.round((hospital.icuOccupied / hospital.icuTotal) * 100);

              return (
                <tr 
                  key={hospital.id} 
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition cursor-pointer"
                  onClick={() => onSelectHospital && onSelectHospital(hospital)}
                >
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800/60 flex items-center justify-center font-bold text-xs shrink-0">
                        {hospital.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{hospital.name}</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {hospital.address}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-800 dark:text-slate-200">{hospital.region}</p>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{hospital.type}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-32">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">{hospital.occupiedBeds}/{hospital.totalBeds}</span>
                        <span className={bedPct > 90 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}>{bedPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${bedPct > 90 ? 'bg-rose-500' : bedPct > 75 ? 'bg-amber-500' : 'bg-teal-500'}`}
                          style={{ width: `${bedPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-28">
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-700 dark:text-slate-300">{hospital.icuOccupied}/{hospital.icuTotal}</span>
                        <span className={icuPct > 90 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}>{icuPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${icuPct > 90 ? 'bg-rose-500' : icuPct > 75 ? 'bg-amber-500' : 'bg-teal-500'}`}
                          style={{ width: `${icuPct}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                      hospital.oxygenLevelPct < 50 
                        ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900' 
                        : 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-900'
                    }`}>
                      {hospital.oxygenLevelPct}%
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1.5">
                      <div 
                        className={`h-2 w-2 rounded-full ${
                          hospital.predictedSurgeRisk > 80 ? 'bg-rose-500 animate-ping' : hospital.predictedSurgeRisk > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`} 
                      />
                      <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        {hospital.predictedSurgeRisk}% Risk
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={hospital.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectHospital) onSelectHospital(hospital);
                      }}
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
