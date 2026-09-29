import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useTranslation } from '../i18n';
import {
  HeartPulse,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Activity,
  Network,
  Hospital
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const [activeDemoRole, setActiveDemoRole] = useState<string | null>(null);
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const navigateByRole = (role?: string) => {
    let targetPath = from;
    if (!from || from === '/dashboard' || from === '/' || from === '/login') {
      if (role === 'admin') targetPath = '/admin/dashboard';
      else if (role === 'viewer') targetPath = '/viewer/dashboard';
      else targetPath = '/clinician/dashboard';
    }
    navigate(targetPath, { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!email.trim() || !password) {
      setFormError(language === 'hi' ? 'कृपया ईमेल और पासवर्ड दोनों दर्ज करें।' : 'Please enter both email and password.');
      return;
    }

    const success = await login({ email: email.trim(), password });
    if (success) {
      const storedUser = JSON.parse(localStorage.getItem('healthchain_auth_user') || '{}');
      navigateByRole(storedUser.role);
    }
  };

  const handleDemoLogin = async (demoEmail: string, demoPass: string, roleName: string) => {
    if (isLoading) return;
    setActiveDemoRole(roleName);
    setEmail(demoEmail);
    setPassword(demoPass);
    setFormError(null);
    clearError();

    const success = await login({ email: demoEmail, password: demoPass });
    if (success) {
      const storedUser = JSON.parse(localStorage.getItem('healthchain_auth_user') || '{}');
      navigateByRole(storedUser.role || roleName);
    }
    setActiveDemoRole(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Top right language selector & theme toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSelector variant="compact" />
        <ThemeToggle />
      </div>

      {/* Background Decorative Tech Grids & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.25),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-xl shadow-teal-500/20 ring-4 ring-teal-500/20 mb-4 animate-in zoom-in-90 duration-300">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
            {t('brand.name')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300 tracking-wider uppercase mt-1">
            {t('brand.tagline')}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {language === 'hi'
              ? 'राष्ट्रीय लोक स्वास्थ्य एवं फेडरेटेड AI आपूर्ति ग्रिड'
              : 'National Public Healthcare & Federated AI Supply Grid'}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900/95 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 py-8 px-6 sm:px-10 relative">
          <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('auth.signInTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {language === 'hi'
                ? 'रीयल-टाइम PHC टेलीमेट्री एवं पूर्वानुमान एक्सेस करने के लिए क्रेडेंशियल्स दर्ज करें।'
                : 'Enter your credentials to access real-time PHC telemetry & forecasting.'}
            </p>
          </div>

          {/* Error Alert */}
          {(formError || error) && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs font-medium leading-relaxed">
                {formError || error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@healthchain.gov.in"
                  className="block w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  {t('auth.password')}
                </label>
                <span className="text-[11px] text-teal-600 dark:text-teal-400 hover:text-teal-700 font-medium cursor-pointer">
                  {language === 'hi' ? 'पासवर्ड भूल गए?' : 'Forgot key?'}
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-9 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 dark:bg-slate-800"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'hi' ? 'इस टर्मिनल पर क्रेडेंशियल याद रखें' : 'Remember credentials on this terminal'}
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 hover:shadow-lg hover:shadow-teal-600/30 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{t('auth.signingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.signInButton')}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2.5">
              {t('auth.demoLogins')}
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('admin@healthchain.gov.in', 'Admin@123456', 'admin')}
                className="p-2 rounded-lg bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100/80 dark:hover:bg-teal-950/70 border border-teal-200/60 dark:border-teal-800/60 text-left transition group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-1.5 text-teal-800 dark:text-teal-300 font-bold text-[11px]">
                  {activeDemoRole === 'admin' ? (
                    <div className="h-3.5 w-3.5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  )}
                  {t('common.role.admin')}
                </div>
                <p className="text-[9px] text-teal-600 dark:text-teal-400 truncate mt-0.5">
                  {activeDemoRole === 'admin' ? (language === 'hi' ? 'लॉगिन...' : 'Logging in...') : 'Dr. Rachel Vance'}
                </p>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('worker@healthchain.gov.in', 'Worker@123456', 'health_worker')}
                className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100/80 dark:hover:bg-cyan-950/70 border border-cyan-200/60 dark:border-cyan-800/60 text-left transition group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-1.5 text-cyan-900 dark:text-cyan-300 font-bold text-[11px]">
                  {activeDemoRole === 'health_worker' ? (
                    <div className="h-3.5 w-3.5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Hospital className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
                  )}
                  {t('common.role.clinician')}
                </div>
                <p className="text-[9px] text-cyan-700 dark:text-cyan-400 truncate mt-0.5">
                  {activeDemoRole === 'health_worker' ? (language === 'hi' ? 'लॉगिन...' : 'Logging in...') : 'Dr. Priya Sharma'}
                </p>
              </button>

              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleDemoLogin('viewer@healthchain.gov.in', 'Viewer@123456', 'viewer')}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-bold text-[11px]">
                  {activeDemoRole === 'viewer' ? (
                    <div className="h-3.5 w-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Activity className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
                  )}
                  {t('common.role.viewer')}
                </div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {activeDemoRole === 'viewer' ? (language === 'hi' ? 'लॉगिन...' : 'Logging in...') : 'Rajesh Gupta'}
                </p>
              </button>
            </div>
          </div>

          {/* Registration Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('auth.noAccount')}{' '}
              <Link
                to="/signup"
                className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 underline underline-offset-2 transition"
              >
                {t('auth.requestAccess')}
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice Footer */}
        <div className="mt-6 text-center space-y-1">
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            <span>{language === 'hi' ? 'एंड-टू-एंड एन्क्रिप्टेड • HIPAA / ABDM अनुरूप सिमुलेशन' : 'End-to-End Encrypted • HIPAA / ABDM Compliant Simulation'}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            HealthChain AI Platform v1.0 • National Health Mission Telemetry
          </p>
        </div>
      </div>
    </div>
  );
};
