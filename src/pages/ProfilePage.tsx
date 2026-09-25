import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { 
  User, 
  ShieldCheck, 
  Hospital as HospitalIcon, 
  Mail, 
  Phone, 
  Award, 
  Key, 
  Radio, 
  CheckCircle2, 
  Clock,
  BadgeCheck
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [onDuty, setOnDuty] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Clinician Profile & Regional Clearances"
        subtitle="Medical licenses, emergency dispatch authorization, and active duty status"
        badge="Authorized Personnel"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Profile Identity Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center text-2xl font-extrabold shadow-md ring-4 ring-teal-100 mb-4">
              RV
            </div>
            <h3 className="font-extrabold text-slate-900 text-lg">Dr. Rachel Vance, MD, MPH</h3>
            <p className="text-xs font-semibold text-teal-700">Regional Healthcare Crisis Director</p>
            <p className="text-[11px] text-slate-500 mt-1">Metropolitan Health Authority • ID: HC-99402</p>

            {/* Duty Status Switcher */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Active Shift Status</span>
              <button
                onClick={() => setOnDuty(!onDuty)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  onDuty
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                <span className={`h-2 w-2 rounded-full ${onDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {onDuty ? 'ON DUTY' : 'OFF DUTY'}
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Emergency Comms</h4>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Mail className="h-4 w-4 text-teal-600" />
              <span>rachel.vance@healthchain.gov</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Phone className="h-4 w-4 text-teal-600" />
              <span>+1 (555) 019-4820 (Encrypted Cell)</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700">
              <Radio className="h-4 w-4 text-teal-600" />
              <span>Triage Dispatch Channel: Alpha-7</span>
            </div>
          </div>
        </div>

        {/* Right Security Clearances & Delegations */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card space-y-4">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-teal-600" />
              Medical Clearances & Dispatch Authorities
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3.5">
                <div className="flex items-center gap-2 text-teal-900 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Level 4 Crisis Override Authority
                </div>
                <p className="text-slate-600 text-[11px]">
                  Authorized to trigger inter-hospital ICU reallocations and mandatory ambulance diversions across all 6 PHC nodes.
                </p>
              </div>

              <div className="rounded-lg border border-teal-100 bg-teal-50/50 p-3.5">
                <div className="flex items-center gap-2 text-teal-900 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-teal-600" />
                  Controlled Narcotics & LOX Release
                </div>
                <p className="text-slate-600 text-[11px]">
                  Sign-off approval for emergency pharmaceutical release (Norepinephrine, Fentanyl, LOX Liquid Oxygen).
                </p>
              </div>
            </div>
          </div>

          {/* Assigned PHC Facilities Under Supervision */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-card space-y-3">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-3 flex items-center gap-2">
              <HospitalIcon className="h-4 w-4 text-teal-600" />
              Supervised Facilities in Operational Grid
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">Metropolitan Apex Trauma & Medical Center</p>
                  <p className="text-[11px] text-slate-500">Central Trauma Hub • 620 Beds</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                  CRITICAL SURGE
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">East Valley Critical Care & Research Center</p>
                  <p className="text-[11px] text-slate-500">East District • 510 Beds</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                  RED ALERT
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900">St. Jude Regional Memorial Hospital</p>
                  <p className="text-[11px] text-slate-500">North Sector • 450 Beds</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                  MODERATE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
