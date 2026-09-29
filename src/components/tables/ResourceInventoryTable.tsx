import React from 'react';
import { SupplyItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, AlertTriangle, Package, RefreshCw } from 'lucide-react';

interface ResourceInventoryTableProps {
  supplies: SupplyItem[];
  onRequestDispatch?: (item: SupplyItem) => void;
}

export const ResourceInventoryTable: React.FC<ResourceInventoryTableProps> = ({
  supplies,
  onRequestDispatch,
}) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50/75 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400">
            <tr>
              <th scope="col" className="px-5 py-3.5">Supply Item & Category</th>
              <th scope="col" className="px-4 py-3.5">Facility Location</th>
              <th scope="col" className="px-4 py-3.5">Current In-Stock</th>
              <th scope="col" className="px-4 py-3.5">Burn Rate / Day</th>
              <th scope="col" className="px-4 py-3.5">Runway (Days Left)</th>
              <th scope="col" className="px-4 py-3.5">Stock Risk</th>
              <th scope="col" className="px-4 py-3.5 text-right">Dispatch Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {supplies.map((item) => {
              const isUrgent = item.daysOfSupplyLeft < 3;
              return (
                <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
                        <Package className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-100">{item.name}</p>
                        <span className="text-xs text-slate-500 dark:text-slate-400">{item.category}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300 font-medium">
                    {item.facilityName}
                  </td>
                  <td className="px-4 py-4">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {item.currentStock.toLocaleString()}
                    </span>{' '}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{item.unit}</span>
                  </td>
                  <td className="px-4 py-4 text-slate-700 dark:text-slate-300">
                    {item.dailyBurnRate} {item.unit}/day
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded ${
                        isUrgent
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {item.daysOfSupplyLeft} days
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={item.riskLevel} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => onRequestDispatch && onRequestDispatch(item)}
                      className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-teal-600 dark:hover:bg-teal-600 hover:text-white dark:hover:text-white transition"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Rebalance
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
