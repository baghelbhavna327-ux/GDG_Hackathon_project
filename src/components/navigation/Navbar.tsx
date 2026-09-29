import React, { useState, useRef, useEffect } from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  X,
  AlertTriangle,
  ChevronRight,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Activity,
  Building,
  Home,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { AIAlert } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../i18n';
import { GlobalSearchBar } from '../search/GlobalSearchBar';
import { ThemeToggle } from '../common/ThemeToggle';
import { LanguageSelector } from '../common/LanguageSelector';
import { NotificationDropdown } from '../notifications/NotificationDropdown';
import { fetchUnreadCount } from '../../services/notificationService';

interface NavbarProps {
  onToggleSidebar: () => void;
  isSidebarCollapsed?: boolean;
  onToggleCollapse?: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  alerts: AIAlert[];
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  isSidebarCollapsed,
  onToggleCollapse,
  searchQuery,
  onSearchChange,
  alerts,
  selectedRegion = 'All Regions',
  onRegionChange,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(0);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useTranslation();

  const [isWiggling, setIsWiggling] = useState(false);
  const prevCountRef = useRef<number>(0);

  // Load and sync real backend unread notification count
  useEffect(() => {
    let isMounted = true;
    const updateCount = async () => {
      try {
        const count = await fetchUnreadCount();
        if (isMounted) {
          if (count > prevCountRef.current && count > 0) {
            setIsWiggling(true);
            setTimeout(() => setIsWiggling(false), 900);
          }
          prevCountRef.current = count;
          setUnreadNotificationsCount(count);
        }
      } catch {}
    };

    updateCount();
    const interval = setInterval(updateCount, 25000);
    const handleRefresh = () => updateCount();
    window.addEventListener('healthchain:notification-refresh', handleRefresh);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('healthchain:notification-refresh', handleRefresh);
    };
  }, [user]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name?: string) => {
    if (!name) return 'HC';
    const parts = name.replace(/^(Dr\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0].slice(0, 2).toUpperCase();
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return { label: t('common.role.admin'), color: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900' };
      case 'health_worker':
        return { label: t('common.role.clinician'), color: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900' };
      case 'viewer':
        return { label: t('common.role.viewer'), color: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
      default:
        return { label: t('common.role.personnel'), color: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300 dark:border-cyan-900' };
    }
  };

  const roleInfo = getRoleBadge(user?.role);

  // Page title & Breadcrumb calculation based on route
  const getPageInfo = () => {
    const rolePrefix = user?.role === 'admin' ? t('common.role.admin') : user?.role === 'viewer' ? t('common.role.viewer') : t('common.role.clinician');
    switch (location.pathname) {
      case '/':
      case '/dashboard':
      case '/admin/dashboard':
      case '/clinician/dashboard':
      case '/viewer/dashboard':
        return {
          title: user?.role === 'admin'
            ? t('page.adminDashboard.title')
            : user?.role === 'viewer'
            ? t('page.viewerDashboard.title')
            : t('page.clinicianDashboard.title'),
          subtitle: t('page.adminDashboard.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('nav.dashboard')}`
        };
      case '/admin/phcs':
      case '/phc-management':
        return {
          title: t('page.phcManagement.title'),
          subtitle: t('page.phcManagement.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.phcManagement.breadcrumb')}`
        };
      case '/phc-map':
        return {
          title: t('page.phcMap.title'),
          subtitle: t('page.phcMap.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.phcMap.breadcrumb')}`
        };
      case '/inventory':
        return {
          title: t('page.inventory.title'),
          subtitle: t('page.inventory.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.inventory.breadcrumb')}`
        };
      case '/resources':
        return {
          title: t('page.resources.title'),
          subtitle: t('page.resources.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.resources.breadcrumb')}`
        };
      case '/forecast':
        return {
          title: t('page.forecast.title'),
          subtitle: t('page.forecast.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.forecast.breadcrumb')}`
        };
      case '/redistribution':
        return {
          title: t('page.redistribution.title'),
          subtitle: t('page.redistribution.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.redistribution.breadcrumb')}`
        };
      case '/emergency':
        return {
          title: t('page.emergency.title'),
          subtitle: t('page.emergency.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.emergency.breadcrumb')}`
        };
      case '/federated-ai':
        return {
          title: t('page.federatedAi.title'),
          subtitle: t('page.federatedAi.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.federatedAi.breadcrumb')}`
        };
      case '/admin/users':
        return {
          title: t('page.userManagement.title'),
          subtitle: t('page.userManagement.subtitle'),
          breadcrumb: t('page.userManagement.breadcrumb')
        };
      case '/settings':
        return {
          title: t('page.settings.title'),
          subtitle: t('page.settings.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.settings.breadcrumb')}`
        };
      case '/profile':
        return {
          title: t('page.profile.title'),
          subtitle: t('page.profile.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('page.profile.breadcrumb')}`
        };
      default:
        return {
          title: t('brand.platform'),
          subtitle: t('brand.subtitle'),
          breadcrumb: `${rolePrefix} / ${t('nav.dashboard')}`
        };
    }
  };

  const { title, subtitle, breadcrumb } = getPageInfo();
  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'mitigating');

  const regions = [
    'All Regions',
    'Madhya Pradesh',
    'Rajasthan',
    'Gujarat',
    'Central Metro',
    'North Sector',
    'West District'
  ];

  const handleLogout = async () => {
    setProfileDropdownOpen(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-subtle transition-colors duration-200">
      {/* Left: Hamburger (mobile), Collapse (desktop) & Page Title with Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition shrink-0"
            title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isSidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        )}

        <div className="min-w-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate">
            <Home className="h-3 w-3 text-teal-600 dark:text-teal-400" />
            <span>/</span>
            <span>{breadcrumb}</span>
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-50 truncate leading-tight mt-0.5">
            {title}
          </h1>
        </div>
      </div>

      {/* Middle: Global Search Input with Live Autocomplete */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <GlobalSearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={t('common.searchPlaceholder')}
        />
      </div>

      {/* Right: Region selector, Language Switcher, Theme Toggle, Notification bell & User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        {/* Region Filter */}
        {onRegionChange && (
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg} className="dark:bg-slate-800 dark:text-slate-200">
                  {reg === 'All Regions' ? t('common.allRegions') : reg}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Global Language Selector (EN / हिन्दी) */}
        <LanguageSelector />

        {/* Global Light / Dark Mode Toggle */}
        <ThemeToggle />

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="btn-interactive relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
            aria-label="View notifications"
          >
            <Bell className={`h-5 w-5 transition-transform duration-200 ${isWiggling ? 'animate-bell-ring text-rose-500' : ''}`} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-rose-600 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900 animate-badge-pop">
                {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Real-time Notifications Flyout */}
          <NotificationDropdown
            isOpen={notificationsOpen}
            onClose={() => setNotificationsOpen(false)}
            onUnreadCountChange={setUnreadNotificationsCount}
          />
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-700 hover:opacity-90 transition group text-left cursor-pointer"
            aria-label="User profile menu"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-teal-200 dark:group-hover:ring-teal-700 transition">
              {getInitials(user?.name)}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition truncate max-w-[120px]">
                {user?.name || 'Authorized User'}
              </p>
              <div className="flex items-center gap-1">
                <span className={`text-[8px] font-extrabold px-1 rounded border uppercase ${roleInfo.color}`}>
                  {roleInfo.label}
                </span>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
          </button>

          {/* Flyout Menu */}
          {profileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User Summary Header */}
              <div className="px-2.5 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user?.name || 'Authorized User'}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email || 'user@healthchain.gov.in'}</p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}>
                    {roleInfo.label} {t('common.clearance')}
                  </span>
                  {user?.facility && (
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                      <Building className="h-2.5 w-2.5" />
                      {user.facility}
                    </span>
                  )}
                </div>
              </div>

              {/* Menu Links */}
              <div className="space-y-0.5 text-xs">
                <NavLink
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition"
                >
                  <UserIcon className="h-4 w-4 text-slate-400" />
                  <span>{t('nav.profile')}</span>
                </NavLink>

                {user?.role === 'admin' && (
                  <NavLink
                    to="/admin/users"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition"
                  >
                    <ShieldCheck className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                    <span>{t('nav.userManagement')}</span>
                  </NavLink>
                )}

                <NavLink
                  to="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-teal-700 dark:hover:text-teal-400 font-medium transition"
                >
                  <Activity className="h-4 w-4 text-slate-400" />
                  <span>{t('nav.systemSettings')}</span>
                </NavLink>

                <div className="pt-1 mt-1 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-bold transition text-left cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 text-rose-500" />
                    <span>{t('nav.signOut')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
