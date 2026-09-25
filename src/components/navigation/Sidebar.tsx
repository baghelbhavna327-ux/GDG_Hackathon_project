import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Pill,
  Layers,
  TrendingUp,
  ArrowRightLeft,
  AlertOctagon,
  Network,
  Settings,
  User,
  HeartPulse,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  criticalAlertCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  criticalAlertCount = 2,
}) => {
  const location = useLocation();

  const primaryMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, aliases: ['/'] },
    { name: 'PHC Map', path: '/phc-map', icon: MapPin },
    { name: 'Medicine Inventory', path: '/inventory', icon: Pill },
    { name: 'Resources', path: '/resources', icon: Layers },
    { name: 'AI Forecast', path: '/forecast', icon: TrendingUp, badge: 'Neural' },
    { name: 'Redistribution', path: '/redistribution', icon: ArrowRightLeft, badge: 'Live' },
    { name: 'Federated AI', path: '/federated-ai', icon: Network, badge: 'FedAvg' },
    { name: 'Emergency Mode', path: '/emergency', icon: AlertOctagon, isEmergency: true, alertCount: criticalAlertCount },
  ];

  const bottomMenuItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  const isItemActive = (path: string, aliases?: string[]) => {
    if (location.pathname === path) return true;
    if (aliases && aliases.includes(location.pathname)) return true;
    return false;
  };

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

      {/* Main Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header & Navigation Group */}
        <div className="flex flex-col flex-1 min-h-0">
          {/* Brand Header */}
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between shrink-0">
            <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-cyan-500 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-100 group-hover:scale-105 transition-transform">
                <HeartPulse className="h-5 w-5" />
              </div>
              <div>
                <span className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1">
                  HealthChain <span className="text-teal-600">AI</span>
                </span>
                <p className="text-[10px] font-semibold text-teal-700 tracking-wider uppercase">
                  Predict • Prevent • Protect
                </p>
              </div>
            </NavLink>

            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Network System Live Indicator Pill */}
          <div className="px-3 pt-3">
            <div className="px-3 py-2 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
                <span className="text-[11px] font-bold text-teal-900">PHC Grid Active</span>
              </div>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded">
                6 Nodes
              </span>
            </div>
          </div>

          {/* Primary Menu Items */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
            <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations & Management
            </p>
            {primaryMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.path, item.aliases);

              if (item.isEmergency) {
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all group ${
                      active
                        ? 'bg-rose-600 text-white shadow-sm font-bold'
                        : 'text-rose-700 bg-rose-50/70 hover:bg-rose-100/80 border border-rose-200/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-rose-600 animate-pulse'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.alertCount && item.alertCount > 0 ? (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          active ? 'bg-white text-rose-700' : 'bg-rose-600 text-white animate-pulse'
                        }`}
                      >
                        {item.alertCount} ALERTS
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    active
                      ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200/80 shadow-subtle'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        item.badge === 'Live'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-teal-100 text-teal-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Menu Items (Settings & Profile) */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0 space-y-1">
          <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Account & System
          </p>
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${active ? 'text-teal-600' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}

          {/* Clinician Card */}
          <NavLink
            to="/profile"
            onClick={onClose}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition border border-transparent hover:border-slate-200 mt-2"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 text-white flex items-center justify-center text-xs font-bold shadow-sm shrink-0">
              RV
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-bold text-slate-900 truncate">Dr. Rachel Vance</p>
              <p className="text-[10px] text-slate-500 truncate">Regional Crisis Director</p>
            </div>
          </NavLink>
        </div>
      </aside>
    </>
  );
};
