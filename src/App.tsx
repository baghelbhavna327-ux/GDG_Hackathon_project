import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { DashboardPage } from './pages/DashboardPage';
import { PhcMapPage } from './pages/PhcMapPage';
import { InventoryPage } from './pages/InventoryPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ForecastPage } from './pages/ForecastPage';
import { RedistributionPage } from './pages/RedistributionPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { FederatedAIPage } from './pages/FederatedAIPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { useHealthcareData } from './hooks/useHealthcareData';

export const App: React.FC = () => {
  const {
    filteredHospitals,
    filteredSupplies,
    alerts,
    forecastData,
    transfers,
    selectedRegion,
    setSelectedRegion,
    searchQuery,
    setSearchQuery,
    dismissAlert,
    mitigateAlert,
    createTransfer,
  } = useHealthcareData();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <DashboardLayout
              alerts={alerts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          }
        >
          {/* Index & /dashboard route */}
          <Route
            index
            element={
              <DashboardPage
                hospitals={filteredHospitals}
                alerts={alerts}
                forecastData={forecastData}
                transfers={transfers}
                onDismissAlert={dismissAlert}
                onMitigateAlert={mitigateAlert}
                onCreateTransfer={createTransfer}
              />
            }
          />
          <Route
            path="dashboard"
            element={
              <DashboardPage
                hospitals={filteredHospitals}
                alerts={alerts}
                forecastData={forecastData}
                transfers={transfers}
                onDismissAlert={dismissAlert}
                onMitigateAlert={mitigateAlert}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* PHC Map Route */}
          <Route
            path="phc-map"
            element={
              <PhcMapPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* Medicine Inventory Route */}
          <Route
            path="inventory"
            element={
              <InventoryPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* Resources & Beds Route */}
          <Route
            path="resources"
            element={
              <ResourcesPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* AI Forecast Route */}
          <Route
            path="forecast"
            element={
              <ForecastPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* Redistribution Route */}
          <Route
            path="redistribution"
            element={
              <RedistributionPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* Emergency Mode Route */}
          <Route
            path="emergency"
            element={
              <EmergencyPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            }
          />

          {/* Federated AI Dashboard Route */}
          <Route
            path="federated-ai"
            element={<FederatedAIPage />}
          />

          {/* Settings Route */}
          <Route path="settings" element={<SettingsPage />} />

          {/* Profile Route */}
          <Route path="profile" element={<ProfilePage />} />

          {/* Wildcard fallback to dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
