import React from 'react';
import { ResourceTransfer } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { ArrowRight, Truck, Navigation, CheckCircle2 } from 'lucide-react';

interface TransferLogTableProps {
  transfers: ResourceTransfer[];
}

export const TransferLogTable: React.FC<TransferLogTableProps> = ({ transfers }) => {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-slate-50/75 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
            <tr>
              <th scope="col" className="px-5 py-3.5">Dispatch Code</th>
              <th scope="col" className="px-4 py-3.5">Logistics Route</th>
              <th scope="col" className="px-4 py-3.5">Resource & Qty</th>
              <th scope="col" className="px-4 py-3.5">Priority</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5">Dispatched</th>
              <th scope="col" className="px-4 py-3.5">ETA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transfers.map((trf) => (
              <tr key={trf.id} className="hover:bg-slate-50/80 transition">
                <td className="px-5 py-4 font-mono font-semibold text-teal-700 text-xs">
                  {trf.trackingCode}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-800">{trf.originFacilityName.split(' ')[0]}...</span>
                    <ArrowRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="font-semibold text-slate-800">{trf.destinationFacilityName.split(' ')[0]}...</span>
                    <span className="text-slate-400 text-[10px]">({trf.routeDistanceKm} km)</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-900">{trf.resourceName}</p>
                  <p className="text-xs text-slate-500">{trf.quantity} {trf.unit}</p>
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={trf.priority} />
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={trf.status} />
                </td>
                <td className="px-4 py-4 text-xs text-slate-600">
                  {trf.dispatchTime}
                </td>
                <td className="px-4 py-4 text-xs font-semibold text-slate-900">
                  {trf.estimatedArrival}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
