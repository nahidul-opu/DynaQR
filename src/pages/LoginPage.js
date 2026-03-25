import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { hasMissingConfig } from '../firebase';

export default function LoginPage({ user, login }) {
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="page-shell">
      <div className="card stack gap-lg narrow">
        <div>
          <div className="eyebrow">React + GitHub Pages + Firestore</div>
          <h1>Dynamic QR Manager</h1>
          <p className="muted">
            Create QR codes once, change destinations later, and manage everything from a simple dashboard.
          </p>
        </div>

        {hasMissingConfig ? (
          <div className="alert error">
            Firebase config is missing. Copy <code>.env.example</code> to <code>.env.local</code> and add your Firebase values.
          </div>
        ) : null}

        <button className="button" onClick={login} disabled={hasMissingConfig}>Sign in with Google</button>

        <p className="muted small">
          After deployment, add your GitHub Pages URL to Firebase Authentication → Authorized domains and keep your Firestore rules in sync with the provided README.
        </p>

        <Link className="linkish" to="/r/example-slug">Preview redirect route</Link>
      </div>
    </div>
  );
}
