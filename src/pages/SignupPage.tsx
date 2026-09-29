import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/auth';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { LanguageSelector } from '../components/common/LanguageSelector';
import { useTranslation } from '../i18n';
import {
  HeartPulse,
  Lock,
  Mail,
  User as UserIcon,
  Building2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Phone
} from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { t, language } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('health_worker');
  const [facility, setFacility] = useState('PHC Sehore North');
  const [department, setDepartment] = useState('Primary Healthcare Operations');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const { register, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    clearError();

    if (!name.trim()) {
      setFormError(language === 'hi' ? 'कृपया अपना पूरा नाम और पद दर्ज करें।' : 'Please enter your full clinician or officer name.');
      return;
    }
    if (!email.trim()) {
      setFormError(language === 'hi' ? 'कृपया एक वैध आधिकारिक ईमेल पता दर्ज करें।' : 'Please enter a valid official email address.');
      return;
    }
    if (password.length < 6) {
      setFormError(language === 'hi' ? 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।' : 'Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError(language === 'hi' ? 'पासवर्ड पुष्टिकरण मेल नहीं खाता है।' : 'Password confirmation does not match.');
      return;
    }
    if (!acceptTerms) {
      setFormError(language === 'hi' ? 'पंजीकरण करने के लिए आपको अनुपालन शर्तों को स्वीकार करना होगा।' : 'You must accept the healthcare compliance terms to register.');
      return;
    }

    const success = await register({
      name: name.trim(),
      email: email.trim(),
      password,
      confirmPassword,
      role,
      facility: facility.trim(),
      department: department.trim(),
      phoneNumber: phoneNumber.trim() || '+91 98765 43210'
    });

    if (success) {
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-200">
      {/* Top right language selector & theme toggle */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
        <LanguageSelector variant="compact" />
        <ThemeToggle />
      </div>

      {/* Background Tech Grids & Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.25),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 dark:bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-teal-600 to-cyan-500 text-white shadow-xl shadow-teal-500/20 ring-4 ring-teal-500/20 mb-3">
            <HeartPulse className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
            {t('brand.name')}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-teal-700 dark:text-teal-300 tracking-wider uppercase mt-0.5">
            {t('brand.tagline')}
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-slate-900/95 shadow-xl rounded-2xl border border-slate-200 dark:border-slate-800 py-7 px-6 sm:px-10 relative">
          <div className="mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t('auth.signUpTitle')}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {t('auth.signUpSubtitle')}
            </p>
          </div>

          {/* Error Alert */}
          {(formError || error) && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2.5 text-rose-800 dark:text-rose-200 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="text-xs font-medium leading-relaxed">
                {formError || error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Dr. Ananya Roy, MO"
                  className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                />
              </div>
            </div>

            {/* Email and Phone Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
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
                    placeholder="ananya@healthchain.gov.in"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {language === 'hi' ? 'फ़ोन नंबर' : 'Phone Number'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>
            </div>

            {/* Role & Facility Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('auth.role')}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="block w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition cursor-pointer"
                >
                  <option value="health_worker" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('common.role.clinician')}</option>
                  <option value="viewer" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('common.role.viewer')}</option>
                  <option value="admin" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">{t('common.role.admin')}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('auth.assignedPhc')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={facility}
                    onChange={(e) => setFacility(e.target.value)}
                    placeholder="PHC Sehore North"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>
            </div>

            {/* Password and Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('auth.password')}
                </label>
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
                    className="block w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {language === 'hi' ? 'पासवर्ड की पुष्टि करें' : 'Confirm Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white dark:focus:bg-slate-800 transition"
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {password && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <span>{language === 'hi' ? 'पासवर्ड सुरक्षा स्तर:' : 'Password Security:'}</span>
                  <span className={strength >= 4 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : strength >= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}>
                    {strength >= 4 ? (language === 'hi' ? 'मजबूत' : 'Strong') : strength >= 2 ? (language === 'hi' ? 'मध्यम' : 'Moderate') : (language === 'hi' ? 'कमजोर' : 'Weak')}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full transition-all ${strength >= 1 ? 'bg-rose-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`h-full flex-1 rounded-full transition-all ${strength >= 2 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`h-full flex-1 rounded-full transition-all ${strength >= 3 ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  <div className={`h-full flex-1 rounded-full transition-all ${strength >= 4 ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                </div>
              </div>
            )}

            {/* Terms and Compliance Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(e) => setAcceptTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 dark:border-slate-600 text-teal-600 focus:ring-teal-500 dark:bg-slate-800"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  {language === 'hi'
                    ? 'मैं प्रमाणित करता/करती हूँ कि मैं राष्ट्रीय स्वास्थ्य मिशन दिशानिर्देशों के तहत कार्यरत एक अधिकृत स्वास्थ्य सेवा प्रदाता / सार्वजनिक स्वास्थ्य अधिकारी हूँ।'
                    : 'I certify that I am an authorized healthcare provider / public health official operating under National Health Mission guidelines.'}
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
                  <span>{language === 'hi' ? 'प्रोफ़ाइल पंजीकृत हो रही है...' : 'Registering Clinician Profile...'}</span>
                </>
              ) : (
                <>
                  <span>{t('auth.signUpButton')}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {t('auth.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="font-bold text-teal-600 dark:text-teal-400 hover:text-teal-700 underline underline-offset-2 transition"
              >
                {t('auth.signInButton')}
              </Link>
            </p>
          </div>
        </div>

        {/* Security Footer */}
        <div className="mt-5 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
            <span>{language === 'hi' ? 'फेडरेटेड डिफरेंशियल प्राइवेसी एवं भूमिका-आधारित एक्सेस कंट्रोल द्वारा सुरक्षित' : 'Protected by Federated Differential Privacy & Role-Based Access Control'}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
