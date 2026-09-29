import React, { useState } from 'react';
import { SectionHeader } from '../components/common/SectionHeader';
import { 
  User as UserIcon, 
  ShieldCheck, 
  Hospital as HospitalIcon, 
  Mail, 
  Phone, 
  Award, 
  Key, 
  Radio, 
  CheckCircle2, 
  Clock,
  BadgeCheck,
  Building,
  Calendar
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

export const ProfilePage: React.FC = () => {
  const { t, language } = useTranslation();
  const { user, updateProfile } = useAuth();
  const [isUpdating, setIsUpdating] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'HC';
    const parts = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return {
          label: language === 'hi' ? 'सिस्टम व्यवस्थापक' : 'System Administrator',
          level: language === 'hi' ? 'स्तर 4 संकट ओवरराइड प्राधिकरण' : 'Level 4 Crisis Override Authority'
        };
      case 'health_worker':
        return {
          label: language === 'hi' ? 'स्वास्थ्य कर्मी / चिकित्सक' : 'Healthcare Worker / Clinician',
          level: language === 'hi' ? 'स्तर 3 दवा वितरण प्राधिकरण' : 'Level 3 Medicine Dispensation Authority'
        };
      case 'viewer':
        return {
          label: language === 'hi' ? 'सार्वजनिक स्वास्थ्य पर्यवेक्षक' : 'Public Health Observer',
          level: language === 'hi' ? 'स्तर 1 टेलीमेट्री दृश्य प्राधिकरण' : 'Level 1 Telemetry View Authority'
        };
      default:
        return {
          label: language === 'hi' ? 'अधिकृत कार्मिक' : 'Authorized Personnel',
          level: language === 'hi' ? 'मानक स्वास्थ्य प्राधिकरण' : 'Standard Health Authority'
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const isOnDuty = user?.dutyStatus === 'on_duty';

  const handleToggleDuty = async () => {
    setIsUpdating(true);
    try {
      await updateProfile({
        dutyStatus: isOnDuty ? 'off_duty' : 'on_duty'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('page.profile.title')}
        subtitle={t('page.profile.subtitle')}
        badge={roleInfo.label}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Profile Identity Card */}
        <div className="lg:col-span-4 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center text-2xl font-extrabold shadow-md ring-4 ring-teal-100 dark:ring-teal-900/50 mb-4">
              {getInitials(user?.name)}
            </div>
            <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-lg">
              {user?.name || 'Dr. Rachel Vance, MD'}
            </h3>
            <p className="text-xs font-semibold text-teal-700 dark:text-teal-400">
              {user?.department || (language === 'hi' ? 'क्षेत्रीय स्वास्थ्य संकट निदेशालय' : 'Regional Healthcare Crisis Directorate')}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {user?.facility || 'Sehore District PHC Network'} • {t('auth.role')}: <span className="font-semibold uppercase">{user?.role || 'Clinician'}</span>
            </p>

            {/* Duty Status Switcher */}
            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {language === 'hi' ? 'सक्रिय शिफ्ट स्थिति' : 'Active Shift Status'}
              </span>
              <button
                onClick={handleToggleDuty}
                disabled={isUpdating}
                className={`px-3 py-1 rounded-full text-xs font-bold transition flex items-center gap-1.5 ${
                  isOnDuty
                    ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-200'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                } disabled:opacity-50`}
              >
                <span className={`h-2 w-2 rounded-full ${isOnDuty ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                {isUpdating
                  ? (language === 'hi' ? 'सहेजा जा रहा...' : 'SAVING...')
                  : isOnDuty
                  ? (language === 'hi' ? 'ड्यूटी पर (ON DUTY)' : 'ON DUTY')
                  : (language === 'hi' ? 'ड्यूटी समाप्त (OFF DUTY)' : 'OFF DUTY')}
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-3 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">
              {language === 'hi' ? 'आपातकालीन संचार' : 'Emergency Comms'}
            </h4>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Mail className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{user?.email || 'rachel.vance@healthchain.gov'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Phone className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{user?.phoneNumber || '+91 98765 43210 (Encrypted Cell)'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Radio className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>{language === 'hi' ? 'ट्राइएज प्रेषण चैनल: Alpha-7' : 'Triage Dispatch Channel: Alpha-7'}</span>
            </div>
            <div className="flex items-center gap-2.5 text-slate-700 dark:text-slate-300">
              <Calendar className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>
                {language === 'hi' ? 'सदस्यता तिथि: ' : 'Member Since: '}
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US') : (language === 'hi' ? 'सक्रिय सत्र' : 'Active Session')}
              </span>
            </div>
          </div>
        </div>

        {/* Right Security Clearances & Delegations */}
        <div className="lg:col-span-8 space-y-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {language === 'hi' ? 'चिकित्सा अनुमति एवं प्रेषण अधिकार' : 'Medical Clearances & Dispatch Authorities'}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg border border-teal-100 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 p-3.5">
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {roleInfo.level}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {language === 'hi'
                    ? 'AI मांग-पूर्वानुमान समीक्षा, त्वरित ट्राइएज डायवर्सन, और अंतर-PHC दवा प्रेषण के लिए अधिकृत।'
                    : 'Authorized for AI demand-forecasting review, rapid triage diversion, and inter-PHC medicine dispatching.'}
                </p>
              </div>

              <div className="rounded-lg border border-teal-100 dark:border-teal-900/60 bg-teal-50/50 dark:bg-teal-950/30 p-3.5">
                <div className="flex items-center gap-2 text-teal-900 dark:text-teal-200 font-bold mb-1">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  {language === 'hi' ? 'नियंत्रित दवाएं एवं LOX रिलीज' : 'Controlled Narcotics & LOX Release'}
                </div>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  {language === 'hi'
                    ? 'आपातकालीन फार्मास्यूटिकल्स जारी करने के लिए अनुमोदन हस्ताक्षर (नोरेपिनेफ्रिन, फेंटानिल, LOX लिक्विड ऑक्सीजन)।'
                    : 'Sign-off approval for emergency pharmaceutical release (Norepinephrine, Fentanyl, LOX Liquid Oxygen).'}
                </p>
              </div>
            </div>
          </div>

          {/* Assigned PHC Facilities Under Supervision */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
              <HospitalIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
              {language === 'hi' ? 'पर्यवेक्षित प्राथमिक स्वास्थ्य केंद्र' : 'Supervised Facilities in Operational Grid'} ({user?.facility || 'Sehore District PHC Network'})
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">PHC Sehore North</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Madhya Pradesh • 24 {t('dashboard.totalBeds')}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold text-[10px]">
                  {t('common.critical').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">PHC Bhopal Central</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Madhya Pradesh • 30 {t('dashboard.totalBeds')}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                  {t('common.normal').toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                <div>
                  <p className="font-bold text-slate-900 dark:text-slate-100">PHC Indore West</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Madhya Pradesh • 28 {t('dashboard.totalBeds')}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-[10px]">
                  {t('common.medium').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
