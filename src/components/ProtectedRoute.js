import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ user, loading, children }) {
  if (loading) {
    return <div className="page-shell"><div className="card">Checking sign-in…</div></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
