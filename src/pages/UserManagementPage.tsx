import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  Trash2,
  Edit2,
  RefreshCw,
  Search,
  FileText,
  Clock,
  AlertCircle,
  Building,
  CheckCircle2,
  X
} from 'lucide-react';
import { SectionHeader } from '../components/common/SectionHeader';
import { userService } from '../services/userService';
import { User, AuditLogEntry, UserRole } from '../types/auth';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../i18n';

export const UserManagementPage: React.FC = () => {
  const { t, language } = useTranslation();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Edit Role Modal State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('health_worker');
  const [newFacility, setNewFacility] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [fetchedUsers, fetchedLogs] = await Promise.all([
        userService.getAllUsers(),
        userService.getAuditLogs()
      ]);
      setUsers(fetchedUsers);
      setAuditLogs(fetchedLogs);
    } catch (err: any) {
      setError(err.message || t('common.unableToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenEditModal = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewFacility(user.facility || '');
    setNewDepartment(user.department || '');
  };

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await userService.updateUserRole(selectedUser.id, newRole, newDepartment, newFacility);
      setSuccessMessage(
        language === 'hi'
          ? `${selectedUser.name} के लिए अनुमतियाँ अपडेट कर दी गईं।`
          : `Permissions updated for ${selectedUser.name}.`
      );
      setSelectedUser(null);
      await fetchData();
    } catch (err: any) {
      setError(err.message || (language === 'hi' ? 'सुरक्षा अनुमति अपडेट विफल रही।' : 'Failed to update user clearance.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmPrompt = language === 'hi'
      ? `क्या आप वाकई ${userName} की अनुमतियों को रद्द करके खाता हटाना चाहते हैं?`
      : `Are you sure you want to revoke clearances and delete the account for ${userName}?`;
    if (!window.confirm(confirmPrompt)) {
      return;
    }
    setError(null);
    try {
      await userService.deleteUser(userId);
      setSuccessMessage(
        language === 'hi'
          ? `उपयोगकर्ता ${userName} को सफलतापूर्वक हटा दिया गया।`
          : `User ${userName} successfully removed.`
      );
      await fetchData();
    } catch (err: any) {
      setError(err.message || (language === 'hi' ? 'उपयोगकर्ता हटाना विफल रहा।' : 'Failed to delete user.'));
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.facility && u.facility.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'health_worker':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'viewer':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title={t('page.userManagement.title')}
        subtitle={t('page.userManagement.subtitle')}
        badge={language === 'hi' ? 'व्यवस्थापक सुरक्षा स्तर 4' : 'Admin Clearance Level 4'}
      />

      {/* Notifications */}
      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Controls & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <Users className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>{t('users.title')} ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            <FileText className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span>{t('users.auditLogs')} ({auditLogs.length})</span>
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'hi' ? 'चिकित्सक या केंद्र खोजें...' : 'Filter clinicians or facilities...'}
                className="pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-500 w-64"
              />
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
              title={t('common.refresh')}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: User Management Table */}
      {activeTab === 'users' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3.5">{t('profile.name')}</th>
                  <th className="px-5 py-3.5">{t('auth.role')}</th>
                  <th className="px-5 py-3.5">{t('profile.facility')}</th>
                  <th className="px-5 py-3.5">{language === 'hi' ? 'विभाग' : 'Department'}</th>
                  <th className="px-5 py-3.5">{language === 'hi' ? 'ड्यूटी स्थिति' : 'Duty Status'}</th>
                  <th className="px-5 py-3.5 text-right">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                      <RefreshCw className="h-5 w-5 animate-spin mx-auto text-teal-600 dark:text-teal-400 mb-2" />
                      {t('common.loading')}
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                      {t('common.noData')}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{u.name}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase ${getRoleBadge(u.role)}`}>
                          {u.role === 'admin' ? t('common.role.admin') : u.role === 'health_worker' ? t('common.role.clinician') : t('common.role.viewer')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                        {u.facility || 'State Healthcare Registry'}
                      </td>
                      <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">
                        {u.department || 'Primary Healthcare'}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.dutyStatus === 'on_duty' ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {u.dutyStatus === 'on_duty' ? (language === 'hi' ? 'ड्यूटी पर' : 'ON DUTY') : (language === 'hi' ? 'ड्यूटी समाप्त' : 'OFF DUTY')}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-teal-700 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-slate-800 transition"
                          title={t('users.promote')}
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        {currentUser?.id !== u.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title={language === 'hi' ? 'खाता हटाएं' : 'Revoke access & delete'}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Audit Logs */}
      {activeTab === 'audit' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t('users.auditLogs')}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {language === 'hi'
                  ? 'सुरक्षा अनुमति अद्यतन, निष्क्रियता और उच्च-प्रभाव वाली कार्रवाइयों का सुरक्षित रिकॉर्ड'
                  : 'Immutable record of clearance updates, deactivations, and high-impact actions'}
              </p>
            </div>
            <button
              onClick={fetchData}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>{t('common.refresh')}</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[500px] overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">{t('common.noData')}</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="py-3 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300' :
                        log.severity === 'WARNING' ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' : 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                      }`}>
                        {log.action}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-slate-100">{log.performedByName}</span>
                      <span className="text-slate-400 dark:text-slate-500">({log.performedByEmail})</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px]">{log.details}</p>
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0">
                    {new Date(log.createdAt).toLocaleString(language === 'hi' ? 'hi-IN' : 'en-US')}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Edit Role Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{t('users.promote')}</h3>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('profile.name')}
                </label>
                <input
                  type="text"
                  disabled
                  value={`${selectedUser.name} (${selectedUser.email})`}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('auth.role')}
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="health_worker" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('common.role.clinician')}</option>
                  <option value="viewer" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('common.role.viewer')}</option>
                  <option value="admin" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">{t('common.role.admin')}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {t('profile.facility')}
                </label>
                <input
                  type="text"
                  value={newFacility}
                  onChange={(e) => setNewFacility(e.target.value)}
                  placeholder="PHC Sehore North"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  {language === 'hi' ? 'विभाग' : 'Department'}
                </label>
                <input
                  type="text"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  placeholder="Primary Healthcare Operations"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedUser(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 disabled:opacity-50"
                >
                  {isSubmitting ? t('common.saving') : t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
