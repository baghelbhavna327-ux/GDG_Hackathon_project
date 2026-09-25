import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { Navbar } from '../components/navigation/Navbar';
import { AIAlert } from '../types';

interface DashboardLayoutProps {
  alerts: AIAlert[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRegion?: string;
  onRegionChange?: (region: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  alerts,
  searchQuery,
  onSearchChange,
  selectedRegion = 'All Regions',
  onRegionChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const criticalAlertCount = alerts.filter(
    (a) => a.status === 'active' && a.severity === 'critical'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Reusable Sidebar with active state and mobile drawer */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Main Content Body */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Reusable Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          alerts={alerts}
          selectedRegion={selectedRegion}
          onRegionChange={onRegionChange}
        />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
