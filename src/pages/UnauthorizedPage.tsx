import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, Lock, HeartPulse, Hospital } from 'lucide-react';
import { useTranslation } from '../i18n';

export const UnauthorizedPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const getRoleDashboard = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'health_worker':
        return '/clinician/dashboard';
      case 'viewer':
        return '/viewer/dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xl text-center space-y-5 text-slate-900 dark:text-slate-100">
        <div className="relative mx-auto w-16 h-16">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-sm">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <div className="absolute -bottom-1 -right-1 bg-rose-600 rounded-full p-1 text-white ring-2 ring-white dark:ring-slate-900">
            <Lock className="h-3.5 w-3.5" />
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            HTTP 403 • {t('auth.unauthorizedTitle')}
          </span>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {language === 'hi' ? 'सुरक्षा अनुमति आवश्यक है' : 'Security Clearance Required'}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
            {t('auth.unauthorizedMessage')}
          </p>
        </div>

        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl text-left text-xs space-y-1 text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-100 font-semibold text-[11px]">
            <Hospital className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>{language === 'hi' ? 'केंद्र सुरक्षा प्रोटोकॉल' : 'Facility Access Protocol'}</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            {language === 'hi'
              ? 'उच्च अनुमतियों के लिए, कृपया राष्ट्रीय स्वास्थ्य मिशन सिस्टम व्यवस्थापक से संपर्क करें:'
              : 'For elevated privileges, please contact the National Health Mission System Administrator at'}{' '}
            <span className="font-semibold text-teal-700 dark:text-teal-400">admin@healthchain.gov.in</span>.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'hi' ? 'पीछे जाएं' : 'Go Back'}</span>
          </button>
          <button
            onClick={() => navigate(getRoleDashboard(), { replace: true })}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-xs font-bold hover:from-teal-700 hover:to-cyan-700 shadow-md shadow-teal-600/20 transition flex items-center justify-center gap-1.5"
          >
            <HeartPulse className="h-4 w-4" />
            <span>{t('auth.returnToDashboard')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
