import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Hospital, ResourceCategory, PriorityLevel } from '../../types';
import { Truck, AlertCircle } from 'lucide-react';

interface NewTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitals: Hospital[];
  onConfirmTransfer: (data: {
    originFacilityId: string;
    destinationFacilityId: string;
    resourceName: string;
    category: ResourceCategory;
    quantity: number;
    unit: string;
    priority: PriorityLevel;
  }) => void;
}

export const NewTransferModal: React.FC<NewTransferModalProps> = ({
  isOpen,
  onClose,
  hospitals,
  onConfirmTransfer,
}) => {
  const [originId, setOriginId] = useState(hospitals[2]?.id || hospitals[0]?.id || '');
  const [destId, setDestId] = useState(hospitals[4]?.id || hospitals[1]?.id || '');
  const [category, setCategory] = useState<ResourceCategory>('Mechanical Ventilators');
  const [resourceName, setResourceName] = useState('Servo-U Intensive Care Ventilators');
  const [quantity, setQuantity] = useState(5);
  const [unit, setUnit] = useState('Units');
  const [priority, setPriority] = useState<PriorityLevel>('emergency');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (originId === destId) {
      alert('Origin and destination facilities cannot be identical.');
      return;
    }
    onConfirmTransfer({
      originFacilityId: originId,
      destinationFacilityId: destId,
      resourceName,
      category,
      quantity,
      unit,
      priority,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Initiate Inter-Facility Resource Transfer"
      subtitle="Dispatch urgent medical stock, beds, or equipment to mitigate regional surge"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Source Facility (Origin)
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id} className="dark:bg-slate-800 dark:text-slate-100">
                  {h.name} ({h.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destination Facility (Target)
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              {hospitals.map((h) => (
                <option key={h.id} value={h.id} className="dark:bg-slate-800 dark:text-slate-100">
                  {h.name} ({h.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                const val = e.target.value as ResourceCategory;
                setCategory(val);
                if (val === 'Mechanical Ventilators') {
                  setResourceName('Servo-U Intensive Care Ventilators');
                  setUnit('Units');
                } else if (val === 'Medical Oxygen') {
                  setResourceName('Liquid Oxygen Bulk Cylinders');
                  setUnit('Liters');
                } else if (val === 'Blood & Plasma') {
                  setResourceName('O-Negative PRBC Packed Blood');
                  setUnit('Units');
                } else if (val === 'PPE Supplies') {
                  setResourceName('N95 Respirator Masks (Boxes)');
                  setUnit('Boxes');
                } else {
                  setResourceName('Emergency Pharmaceutical Pack');
                  setUnit('Vials');
                }
              }}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="Mechanical Ventilators" className="dark:bg-slate-800 dark:text-slate-100">Mechanical Ventilators</option>
              <option value="Medical Oxygen" className="dark:bg-slate-800 dark:text-slate-100">Medical Oxygen</option>
              <option value="Blood & Plasma" className="dark:bg-slate-800 dark:text-slate-100">Blood & Plasma</option>
              <option value="PPE Supplies" className="dark:bg-slate-800 dark:text-slate-100">PPE Supplies</option>
              <option value="Critical Pharmaceuticals" className="dark:bg-slate-800 dark:text-slate-100">Critical Pharmaceuticals</option>
              <option value="ICU Beds" className="dark:bg-slate-800 dark:text-slate-100">ICU Beds</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource Item Description
            </label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit of Measure</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            >
              <option value="emergency" className="dark:bg-slate-800 dark:text-slate-100">Emergency (Immediate)</option>
              <option value="high" className="dark:bg-slate-800 dark:text-slate-100">High Priority (&lt; 2h)</option>
              <option value="routine" className="dark:bg-slate-800 dark:text-slate-100">Routine Scheduled</option>
            </select>
          </div>
        </div>

        <div className="rounded-lg bg-teal-50/70 dark:bg-teal-950/40 p-3 border border-teal-200 dark:border-teal-900 text-xs text-teal-800 dark:text-teal-300 flex items-center gap-2">
          <Truck className="h-4 w-4 shrink-0 text-teal-600 dark:text-teal-400" />
          <span>Automated GPS route calculation and real-time medical escort assigned upon dispatch.</span>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 shadow-sm transition"
          >
            Confirm & Dispatch
          </button>
        </div>
      </form>
    </Modal>
  );
};
