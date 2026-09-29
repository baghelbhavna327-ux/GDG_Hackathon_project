import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/navigation/Sidebar';
import { Navbar } from '../components/navigation/Navbar';
import { AiCopilotWidget } from '../components/ai/AiCopilotWidget';
import { PageTransition } from '../components/common/PageTransition';
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
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const criticalAlertCount = alerts.filter(
    (a) => a.status === 'active' && a.severity === 'critical'
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Fixed Left Persistent Sidebar */}
      <Sidebar
        isOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        criticalAlertCount={criticalAlertCount}
      />

      {/* Main Content Body (Offset on desktop according to sidebar width) */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Sticky Top Navbar */}
        <Navbar
          onToggleSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          alerts={alerts}
          selectedRegion={selectedRegion}
          onRegionChange={onRegionChange}
        />

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
      </div>

      {/* Grounded Healthcare AI Copilot Drawer & Trigger */}
      <AiCopilotWidget />
    </div>
  );
};
