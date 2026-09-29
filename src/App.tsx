import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ClinicianDashboardPage } from './pages/ClinicianDashboardPage';
import { ViewerDashboardPage } from './pages/ViewerDashboardPage';
import { UserManagementPage } from './pages/UserManagementPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
import { PhcMapPage } from './pages/PhcMapPage';
import { PhcManagementPage } from './pages/PhcManagementPage';
import { InventoryPage } from './pages/InventoryPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { ForecastPage } from './pages/ForecastPage';
import { RedistributionPage } from './pages/RedistributionPage';
import { EmergencyPage } from './pages/EmergencyPage';
import { FederatedAIPage } from './pages/FederatedAIPage';
import { SettingsPage } from './pages/SettingsPage';
import { ProfilePage } from './pages/ProfilePage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { LanguageProvider } from './i18n';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { useHealthcareData } from './hooks/useHealthcareData';

// Component that dynamically redirects authenticated users to their specific role dashboard
const RoleDashboardRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }
  if (user.role === 'viewer') {
    return <Navigate to="/viewer/dashboard" replace />;
  }
  return <Navigate to="/clinician/dashboard" replace />;
};

const AuthenticatedApp: React.FC = () => {
  const {
    filteredHospitals,
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
    <Routes>
      {/* 1. Root / Route: If unauthenticated, redirect to /login; If authenticated, route by role */}
      <Route path="/" element={<RoleDashboardRedirect />} />

      {/* 2. Public Authentication Routes (Wrapped in PublicRoute) */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        }
      />

      {/* 3. 403 Forbidden Unauthorized Screen */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* 4. Protected Dashboard Layout Routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout
              alerts={alerts}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedRegion={selectedRegion}
              onRegionChange={setSelectedRegion}
            />
          </ProtectedRoute>
        }
      >
        {/* /dashboard redirects authenticated user to their role dashboard */}
        <Route path="dashboard" element={<RoleDashboardRedirect />} />

        {/* 4.1 Admin Dedicated Dashboard (Admin only) */}
        <Route
          path="admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage
                hospitals={filteredHospitals}
                alerts={alerts}
                forecastData={forecastData}
                transfers={transfers}
                onDismissAlert={dismissAlert}
                onMitigateAlert={mitigateAlert}
                onCreateTransfer={createTransfer}
              />
            </ProtectedRoute>
          }
        />

        {/* 4.2 Clinician Dedicated Dashboard (Clinician & Admin) */}
        <Route
          path="clinician/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'health_worker']}>
              <ClinicianDashboardPage
                hospitals={filteredHospitals}
                alerts={alerts}
                forecastData={forecastData}
                transfers={transfers}
                onDismissAlert={dismissAlert}
                onMitigateAlert={mitigateAlert}
                onCreateTransfer={createTransfer}
              />
            </ProtectedRoute>
          }
        />

        {/* 4.3 Viewer Dedicated Dashboard (Viewer, Clinician, Admin) */}
        <Route
          path="viewer/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin', 'health_worker', 'viewer']}>
              <ViewerDashboardPage
                hospitals={filteredHospitals}
                alerts={alerts}
                forecastData={forecastData}
                transfers={transfers}
              />
            </ProtectedRoute>
          }
        />

        {/* 4.4 Admin User Management & Audit Logs */}
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />

        {/* 4.5 Operations Routes */}
        <Route
          path="admin/phcs"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <PhcManagementPage
                hospitals={filteredHospitals}
                onCreateTransfer={createTransfer}
              />
            </ProtectedRoute>
          }
        />

        <Route
          path="phc-management"
          element={
            <PhcManagementPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
            />
          }
        />

        <Route
          path="phc-map"
          element={
            <PhcMapPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
            />
          }
        />

        <Route
          path="inventory"
          element={
            <InventoryPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
            />
          }
        />

        <Route
          path="resources"
          element={
            <ResourcesPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
            />
          }
        />

        <Route
          path="forecast"
          element={
            <ForecastPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
            />
          }
        />

        <Route
          path="redistribution"
          element={
            <RedistributionPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
            />
          }
        />

        <Route
          path="emergency"
          element={
            <EmergencyPage
              hospitals={filteredHospitals}
              onCreateTransfer={createTransfer}
              alerts={alerts}
            />
          }
        />

        <Route
          path="federated-ai"
          element={<FederatedAIPage />}
        />

        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>

      {/* 5. Fallback Route: Redirect to root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AuthProvider>
            <BrowserRouter>
              <AuthenticatedApp />
            </BrowserRouter>
          </AuthProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
