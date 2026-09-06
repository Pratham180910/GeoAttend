import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-slate-400 font-medium tracking-wide">Authenticating...</p>
    </div>
  </div>
);

export function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading, profileError, signOut } = useAuth();
  const location = useLocation();

  // Still resolving the auth session
  if (loading) {
    return <Spinner />;
  }

  // Not logged in at all — redirect to login
  if (!isAuthenticated) {
    const returnPath = `${location.pathname}${location.search || ''}`;
    return (
      <Navigate
        to={`/login?returnTo=${encodeURIComponent(returnPath)}`}
        state={{ from: location }}
        replace
      />
    );
  }

  // Profile loading / query error: NEVER grant organizer access and NEVER silently treat as attendee
  if (profileError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4">
        <div className="max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Profile Authentication Error</h3>
            <p className="text-xs text-rose-300 mt-1">{profileError}</p>
            <p className="text-[11px] text-slate-400 mt-2">
              Could not securely verify your account permissions. An unresolved role cannot access protected routes.
            </p>
          </div>
          <button
            onClick={async () => {
              await signOut();
              window.location.href = '/login';
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold transition-colors"
          >
            Sign Out & Return to Login
          </button>
        </div>
      </div>
    );
  }

  // Normalize role string
  const normalizedRole = role ? String(role).trim().toLowerCase() : null;

  // Role not resolved — redirect to login safely
  if (!normalizedRole) {
    return <Navigate to="/login" replace />;
  }

  // Enforce allowedRoles
  const normalizedAllowed = allowedRoles?.map((r) => String(r).trim().toLowerCase());
  if (normalizedAllowed && !normalizedAllowed.includes(normalizedRole)) {
    if (normalizedRole === 'attendee') {
      return <Navigate to="/attendee/scan" replace />;
    }
    return <Navigate to="/organizer/dashboard" replace />;
  }

  return children;
}
