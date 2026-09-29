import React, { useState } from 'react';
import { 
  fetchOrToolsOptimization, 
  OrToolsOptimizationResponse, 
  OrToolsTransfer 
} from '../../services/aiAdvancedService';
import { 
  Sparkles, 
  Truck, 
  Building2, 
  Clock, 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { PriorityLevel, ResourceCategory } from '../../types';
import { useTranslation } from '../../i18n';

interface OrToolsOptimizationCardProps {
  onConfirmTransfer?: (data: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => void;
}

export const OrToolsOptimizationCard: React.FC<OrToolsOptimizationCardProps> = ({
  onConfirmTransfer
}) => {
  const { t, language } = useTranslation();
  const [result, setResult] = useState<OrToolsOptimizationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dispatchedIds, setDispatchedIds] = useState<string[]>([]);

  const handleRunOptimization = async () => {
    setIsLoading(true);
    try {
      const shortages = [
        { phc_id: 'phc-01', phc_name: 'Guna PHC-04', district: 'Guna', state: 'Madhya Pradesh', medicine: 'Paracetamol', shortage_quantity: 600, priority: 'CRITICAL' },
        { phc_id: 'phc-04', phc_name: 'Shivpuri PHC-03', district: 'Shivpuri', state: 'Madhya Pradesh', medicine: 'Amoxicillin', shortage_quantity: 150, priority: 'HIGH' },
        { phc_id: 'phc-07', phc_name: 'Jodhpur Desert Edge', district: 'Jodhpur', state: 'Rajasthan', medicine: 'ORS', shortage_quantity: 200, priority: 'HIGH' }
      ];

      const surpluses = [
        { phc_id: 'phc-05', phc_name: 'PHC Pune East', district: 'Pune', state: 'Maharashtra', medicine: 'Paracetamol', available_surplus: 850 },
        { phc_id: 'phc-02', phc_name: 'PHC Bhopal Central', district: 'Bhopal', state: 'Madhya Pradesh', medicine: 'Amoxicillin', available_surplus: 400 },
        { phc_id: 'phc-09', phc_name: 'PHC Jaipur Rural North', district: 'Jaipur', state: 'Rajasthan', medicine: 'ORS', available_surplus: 450 }
      ];

      const res = await fetchOrToolsOptimization(shortages, surpluses);
      setResult(res);
    } catch (err) {
      console.warn('OR-Tools Optimization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDispatchTransfer = (transfer: OrToolsTransfer) => {
    setDispatchedIds((prev) => [...prev, transfer.transfer_id]);
    if (onConfirmTransfer) {
      onConfirmTransfer({
        originFacilityId: transfer.source_phc_id,
        destinationFacilityId: transfer.destination_phc_id,
        resourceName: transfer.medicine,
        category: 'Critical Pharmaceuticals',
        quantity: transfer.allocated_quantity,
        unit: 'Units',
        priority: transfer.priority === 'CRITICAL' ? 'emergency' : 'routine'
      });
    }
  };

  return (
    <div className="rounded-2xl border border-teal-500/30 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 shadow-xs">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                {t('redistribution.orToolsTitle')}
              </h3>
              <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-300 dark:border-teal-800">
                SCIP MILP Solver
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'hi'
                ? 'पारगमन दूरी और दवा कमी समाधान को अनुकूलित करने वाला गणितीय रैखिक प्रोग्रामिंग इंजन'
                : 'Mathematical linear programming optimizing transit distance and shortage satisfaction'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRunOptimization}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white text-xs font-extrabold shadow-md transition disabled:opacity-50 cursor-pointer self-start sm:self-auto hover:scale-[1.02] active:scale-[0.98]"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{language === 'hi' ? 'प्रतिबंध हल किए जा रहे हैं...' : 'Solving Constraints...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>{language === 'hi' ? 'OR-Tools अनुकूलन निष्पादित करें' : 'Run OR-Tools Optimization'}</span>
            </>
          )}
        </button>
      </div>

      {result ? (
        <div className="space-y-4 text-xs">
          {/* Summary Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-teal-950 dark:text-teal-200">
            <div>
              <span className="text-[10px] uppercase font-extrabold text-teal-700 dark:text-teal-400 block">
                {language === 'hi' ? 'सॉल्वर स्थिति:' : 'Solver Status:'} {result.optimization_status}
              </span>
              <strong className="text-sm text-teal-950 dark:text-teal-100">
                {result.total_transfers_recommended} {language === 'hi' ? 'ट्रांसफर मार्ग आवंटित' : 'Transfer Routes Allocated'} • {result.total_units_allocated} {language === 'hi' ? 'कुल इकाइयां पुनर्संतुलित' : 'Total Units Rebalanced'}
              </strong>
            </div>

            <span className="text-[11px] font-bold bg-white/80 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-700">
              {result.solver_engine}
            </span>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 uppercase font-bold text-[10px] text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">{t('redistribution.medicine')}</th>
                  <th className="py-2.5 px-3">{t('redistribution.donorPhc')}</th>
                  <th className="py-2.5 px-3">{t('redistribution.recipientPhc')}</th>
                  <th className="py-2.5 px-3">{t('redistribution.quantity')}</th>
                  <th className="py-2.5 px-3">{t('redistribution.distance')} & {t('redistribution.eta')}</th>
                  <th className="py-2.5 px-3 text-right">{t('common.action')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {result.transfers.map((tItem) => {
                  const isDispatched = dispatchedIds.includes(tItem.transfer_id);
                  return (
                    <tr key={tItem.transfer_id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 font-extrabold text-slate-900 dark:text-slate-100">
                        {tItem.medicine}
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-emerald-700 dark:text-emerald-400 block">{tItem.source_phc_name}</strong>
                        <span className="text-[10px] text-slate-400">{language === 'hi' ? 'अधिशेष:' : 'Surplus:'} +{tItem.source_surplus_before}</span>
                      </td>
                      <td className="py-3 px-3">
                        <strong className="text-rose-700 dark:text-rose-400 block">{tItem.destination_phc_name}</strong>
                        <span className="text-[10px] text-slate-400">{language === 'hi' ? 'घाटा:' : 'Deficit:'} -{tItem.destination_shortage_before}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">
                          {tItem.allocated_quantity} {t('common.units')}
                        </span>
                        {tItem.remaining_deficit > 0 && (
                          <span className="block text-[10px] text-amber-600">
                            {language === 'hi' ? 'शेष कमी:' : 'Remaining Gap:'} {tItem.remaining_deficit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[11px] text-slate-500 dark:text-slate-400">
                        {tItem.distance_km} km ({tItem.estimated_transit_time})
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isDispatched ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-1 rounded-full border border-emerald-300 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            {language === 'hi' ? 'प्रेषित' : 'Dispatched'}
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDispatchTransfer(tItem)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] shadow-xs cursor-pointer"
                          >
                            <Truck className="h-3 w-3" />
                            {language === 'hi' ? 'प्रेषण स्वीकृत करें' : 'Authorize Dispatch'}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-slate-400 italic">
            * {result.disclaimer}
          </p>
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
          {language === 'hi'
            ? 'बहु-राज्यीय PHC क्लस्टरों के बीच अनुकूलतम संतुलन की गणना करने के लिए "OR-Tools अनुकूलन निष्पादित करें" पर क्लिक करें।'
            : 'Click "Run OR-Tools Optimization" to compute mathematically provable load balancing across multi-state PHC clusters.'}
        </div>
      )}
    </div>
  );
};
