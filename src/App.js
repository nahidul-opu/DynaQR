import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RedirectPage from './pages/RedirectPage';
import { useAuth } from './hooks';

export default function App() {
  const authState = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage user={authState.user} login={authState.login} />} />
      <Route path="/r/:slug" element={<RedirectPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={authState.user} loading={authState.loading}>
            <DashboardPage user={authState.user} logout={authState.logout} />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
