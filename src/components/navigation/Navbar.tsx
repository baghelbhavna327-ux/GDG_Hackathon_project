import React, { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  SlidersHorizontal,
  ShieldCheck,
  X,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { AIAlert } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  alerts: AIAlert[];
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  alerts,
  selectedRegion = 'All Regions',
  onRegionChange,
}) => {
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const location = useLocation();

  // Page title calculation based on route
  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return { title: 'Healthcare Operations Dashboard', subtitle: 'Network telemetry & real-time bed analytics' };
      case '/phc-map':
        return { title: 'Primary Health Center (PHC) Map', subtitle: 'Geospatial facility status & emergency triage zones' };
      case '/inventory':
        return { title: 'Medicine & Pharmaceutical Inventory', subtitle: 'Live supply stock, burn rate velocity & replenishment' };
      case '/resources':
        return { title: 'Critical Resources & Bed Management', subtitle: 'ICU capacity, mechanical ventilators & oxygen reserves' };
      case '/forecast':
        return { title: 'AI Surge & Outbreak Forecasting', subtitle: 'Machine learning epidemiological surge projection' };
      case '/redistribution':
        return { title: 'Inter-Facility Resource Redistribution', subtitle: 'Logistics rebalancing, transit fleet & dispatch registry' };
      case '/emergency':
        return { title: 'Emergency Surge Command Center', subtitle: 'Critical alert protocols, rapid triage diversion & lockdown' };
      case '/settings':
        return { title: 'System & Platform Settings', subtitle: 'API integration endpoints, telemetry thresholds & preferences' };
      case '/profile':
        return { title: 'Clinician Profile & Credentials', subtitle: 'Active duty node assignment & security clearances' };
      default:
        return { title: 'HealthChain AI Platform', subtitle: 'Predict. Prevent. Protect.' };
    }
  };

  const { title, subtitle } = getPageInfo();
  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'mitigating');

  const regions = [
    'All Regions',
    'Central Metro',
    'North Sector',
    'West District',
    'South Bay',
    'East Valley',
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-subtle">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition shrink-0"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:block min-w-0">
          <h1 className="text-base font-bold text-slate-900 truncate leading-tight">{title}</h1>
          <p className="text-[11px] text-slate-500 truncate hidden md:block">{subtitle}</p>
        </div>
      </div>

      {/* Middle: Global Search Input */}
      <div className="flex-1 max-w-md mx-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search PHCs, medicines, beds, supplies..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition"
          />
        </div>
      </div>

      {/* Right: Region selector, Notification bell & User Profile */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Region Filter */}
        {onRegionChange && (
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={selectedRegion}
              onChange={(e) => onRegionChange(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {activeAlerts.length > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[10px] font-bold text-white ring-2 ring-white">
                {activeAlerts.length}
              </span>
            )}
          </button>

          {/* Notifications Flyout */}
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white p-3 shadow-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Emergency Alerts ({activeAlerts.length})
                  </span>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="p-1 rounded text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                {activeAlerts.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No active critical alerts</p>
                ) : (
                  activeAlerts.map((alert) => (
                    <div key={alert.id} className="py-2.5 text-xs hover:bg-slate-50 px-2 rounded-lg transition">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900">{alert.title}</span>
                        <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-normal">{alert.message}</p>
                      <div className="flex items-center justify-between mt-2 pt-1">
                        <span className="text-[10px] font-semibold text-teal-700">{alert.facilityName}</span>
                        <NavLink
                          to="/emergency"
                          onClick={() => setNotificationsOpen(false)}
                          className="text-[10px] font-bold text-rose-600 hover:underline flex items-center gap-0.5"
                        >
                          View in Emergency Hub
                          <ChevronRight className="h-3 w-3" />
                        </NavLink>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Quick Access */}
        <NavLink
          to="/profile"
          className="flex items-center gap-2.5 pl-2 border-l border-slate-200 group"
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-600 to-cyan-500 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 group-hover:ring-teal-200 transition">
            RV
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-bold text-slate-900 group-hover:text-teal-600 transition truncate">
              Dr. Rachel Vance
            </p>
            <p className="text-[10px] text-slate-500 truncate">Regional Admin</p>
          </div>
        </NavLink>
      </div>
    </header>
  );
};
