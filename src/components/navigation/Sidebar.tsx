import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Hospital,
  MapPin,
  Pill,
  TrendingUp,
  AlertOctagon,
  AlertTriangle,
  BellRing,
  ArrowRightLeft,
  Network,
  Users,
  BarChart3,
  Layers,
  Settings,
  UserCheck,
  User as UserIcon,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  X,
  LogOut,
  ShieldCheck,
  Eye
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  criticalAlertCount?: number;
}

interface SidebarMenuItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  aliases?: string[];
  badge?: string;
  isEmergency?: boolean;
  alertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  criticalAlertCount = 2,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const userRole = user?.role || 'health_worker';

  // Helper for initials
  const getInitials = (name?: string) => {
    if (!name) return 'HC';
    const parts = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  // Helper for role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return { label: t('common.role.admin').toUpperCase(), modeLabel: t('nav.adminMode'), color: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900' };
      case 'health_worker':
        return { label: t('common.role.clinician').toUpperCase(), modeLabel: t('nav.clinicianMode'), color: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900' };
      case 'viewer':
        return { label: t('common.role.viewer').toUpperCase(), modeLabel: t('nav.viewerMode'), color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
      default:
        return { label: t('common.role.personnel').toUpperCase(), modeLabel: t('nav.userMode'), color: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900' };
    }
  };

  const roleBadge = getRoleBadge(userRole);

  // Active path checker
  const isItemActive = (path: string, aliases: string[] = []) => {
    if (location.pathname === path) return true;
    if (aliases.includes(location.pathname)) return true;
    return false;
  };

  interface SidebarSection {
    title: string;
    items: SidebarMenuItem[];
  }

  // 1. Admin Menu Sections
  const adminSections: SidebarSection[] = [
    {
      title: t('nav.section.adminOps'),
      items: [
        { name: t('nav.dashboard'), path: '/admin/dashboard', icon: LayoutDashboard, aliases: ['/dashboard', '/'] },
        { name: t('nav.phcManagement'), path: '/admin/phcs', icon: Building2, aliases: ['/phc-map', '/phc-management'] },
        { name: t('nav.inventory'), path: '/inventory', icon: Pill },
        { name: t('nav.demandForecast'), path: '/forecast', icon: TrendingUp, badge: t('nav.badge.neural') },
      ],
    },
    {
      title: t('nav.section.alertsResponse'),
      items: [
        { name: t('nav.emergencyMode'), path: '/emergency', icon: AlertOctagon, isEmergency: true, alertCount: criticalAlertCount },
        { name: t('nav.stockoutAlerts'), path: '/emergency', icon: BellRing },
        { name: t('nav.redistribution'), path: '/redistribution', icon: ArrowRightLeft, badge: t('nav.badge.live') },
      ],
    },
    {
      title: t('nav.section.aiAnalytics'),
      items: [
        { name: t('nav.federatedAi'), path: '/federated-ai', icon: Network, badge: t('nav.badge.fedAvg') },
        { name: t('nav.reportsAnalytics'), path: '/resources', icon: BarChart3 },
      ],
    },
    {
      title: t('nav.section.system'),
      items: [
        { name: t('nav.userManagement'), path: '/admin/users', icon: Users, badge: t('nav.badge.admin') },
        { name: t('nav.settings'), path: '/settings', icon: Settings },
      ],
    },
  ];

  // 2. Clinician Menu Sections
  const clinicianSections: SidebarSection[] = [
    {
      title: t('nav.section.phcOps'),
      items: [
        { name: t('nav.dashboard'), path: '/clinician/dashboard', icon: LayoutDashboard, aliases: ['/dashboard', '/'] },
        { name: t('nav.myPhc'), path: '/phc-map', icon: Hospital },
        { name: t('nav.medicineInventory'), path: '/inventory', icon: Pill },
        { name: t('nav.demandForecast'), path: '/forecast', icon: TrendingUp, badge: t('nav.badge.neural') },
      ],
    },
    {
      title: t('nav.section.alertsFlow'),
      items: [
        { name: t('nav.emergencyAlerts'), path: '/emergency', icon: AlertOctagon, isEmergency: true, alertCount: criticalAlertCount },
        { name: t('nav.resourceRequests'), path: '/resources', icon: Layers },
        { name: t('nav.redistributionStatus'), path: '/redistribution', icon: ArrowRightLeft, badge: t('nav.badge.live') },
      ],
    },
    {
      title: t('nav.section.account'),
      items: [
        { name: t('nav.profileSettings'), path: '/profile', icon: UserCheck },
      ],
    },
  ];

  // 3. Viewer Menu Sections
  const viewerSections: SidebarSection[] = [
    {
      title: t('nav.section.execOverview'),
      items: [
        { name: t('nav.dashboard'), path: '/viewer/dashboard', icon: LayoutDashboard, aliases: ['/dashboard', '/'] },
        { name: t('nav.phcOverview'), path: '/phc-map', icon: MapPin },
        { name: t('nav.inventoryOverview'), path: '/inventory', icon: Pill },
        { name: t('nav.demandForecast'), path: '/forecast', icon: TrendingUp, badge: t('nav.badge.neural') },
      ],
    },
    {
      title: t('nav.section.alertsRedist'),
      items: [
        { name: t('nav.alertsOverview'), path: '/emergency', icon: BellRing },
        { name: t('nav.redistributionTracking'), path: '/redistribution', icon: ArrowRightLeft, badge: t('nav.badge.live') },
      ],
    },
    {
      title: t('nav.section.aiSystem'),
      items: [
        { name: t('nav.federatedAiInsights'), path: '/federated-ai', icon: Network, badge: t('nav.badge.fedAvg') },
        { name: t('nav.reports'), path: '/resources', icon: BarChart3 },
        { name: t('nav.profileSettings'), path: '/profile', icon: Settings },
      ],
    },
  ];

  const currentSections: SidebarSection[] =
    userRole === 'admin'
      ? adminSections
      : userRole === 'viewer'
      ? viewerSections
      : clinicianSections;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const dashboardHomePath =
    userRole === 'admin'
      ? '/admin/dashboard'
      : userRole === 'viewer'
      ? '/viewer/dashboard'
      : '/clinician/dashboard';

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Persistent Left Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-all duration-300 ease-in-out ${
          isCollapsed ? 'lg:w-20' : 'lg:w-64'
        } w-64 ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Top Section: Brand & Navigation */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <NavLink
              to={dashboardHomePath}
              onClick={onClose}
              className="flex items-center gap-2.5 overflow-hidden group"
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-100 dark:ring-teal-900/50 group-hover:scale-105 transition-transform shrink-0">
                <HeartPulse className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden">
                  <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-1 truncate">
                    HealthChain <span className="text-teal-600 dark:text-teal-400">AI</span>
                  </span>
                  <p className="text-[9px] font-semibold text-teal-700 dark:text-teal-400 tracking-wider uppercase truncate">
                    {t('brand.tagline')}
                  </p>
                </div>
              )}
            </NavLink>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Role Mode Indicator Pill */}
          {!isCollapsed && (
            <div className="px-3 pt-3">
              <div className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate uppercase">
                    {roleBadge.modeLabel}
                  </span>
                </div>
                <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${roleBadge.color}`}>
                  {roleBadge.label}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Menu Links */}
          <nav className="flex-1 px-3 py-3 space-y-3.5 overflow-y-auto">
            {currentSections.map((section, idx) => (
              <div key={section.title || idx} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item.path, item.aliases);

                  if (item.isEmergency) {
                    return (
                      <NavLink
                        key={item.name}
                        to={item.path}
                        onClick={onClose}
                        title={isCollapsed ? item.name : undefined}
                        className={`flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-xl text-xs font-semibold transition-all group ${
                          active
                            ? 'bg-rose-600 text-white shadow-sm font-bold'
                            : 'text-rose-700 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40 hover:bg-rose-100/90 dark:hover:bg-rose-900/40 border border-rose-200/70 dark:border-rose-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`h-4 w-4 shrink-0 ${active ? 'text-white' : 'text-rose-600 dark:text-rose-400 animate-pulse'}`} />
                          {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </div>
                        {!isCollapsed && item.alertCount && item.alertCount > 0 ? (
                          <span
                            className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                              active ? 'bg-white text-rose-700' : 'bg-rose-600 text-white animate-pulse'
                            }`}
                          >
                            {t('nav.activeAlertsCount', { count: item.alertCount })}
                          </span>
                        ) : null}
                      </NavLink>
                    );
                  }

                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={onClose}
                      title={isCollapsed ? item.name : undefined}
                      className={`group flex items-center ${isCollapsed ? 'justify-center px-2' : 'justify-between px-3'} py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 font-bold border border-teal-200/80 dark:border-teal-800/80 shadow-subtle translate-x-0.5'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100 hover:translate-x-0.5'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${active ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        {!isCollapsed && <span className="truncate">{item.name}</span>}
                      </div>
                      {!isCollapsed && item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                            item.badge === 'Live' || item.badge === 'लाइव'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                              : item.badge === 'Admin' || item.badge === 'एडमिन'
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300'
                              : 'bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Anchored Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 shrink-0 space-y-2">
          {/* Desktop Collapse / Expand Toggle */}
          <div className="hidden lg:flex items-center justify-between px-1">
            {!isCollapsed && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t('nav.navigation')}
              </span>
            )}
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition mx-auto"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* User Account Card */}
          <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <NavLink
              to="/profile"
              onClick={onClose}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'} overflow-hidden text-left flex-1`}
              title="View Clinician Profile"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
                {getInitials(user?.name)}
              </div>
              {!isCollapsed && (
                <div className="overflow-hidden min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.name || 'Dr. Rachel Vance'}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`text-[8px] font-extrabold px-1 rounded border ${roleBadge.color}`}>
                      {roleBadge.label}
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                      {user?.facility ? user.facility.split(' ')[0] : 'NHM'}
                    </span>
                  </div>
                </div>
              )}
            </NavLink>

            {!isCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                title="Sign out of HealthChain AI"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};
