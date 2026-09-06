import React from 'react';

import { Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { OrganizerLayout } from './layouts/OrganizerLayout';
import { AttendeeLayout } from './layouts/AttendeeLayout';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/organizer/Dashboard';
import { Events } from './pages/organizer/Events';
import { EventDetails } from './pages/organizer/EventDetails';
import { EventAttendance } from './pages/organizer/EventAttendance';
import { Reports } from './pages/organizer/Reports';
import { Scan } from './pages/attendee/Scan';
import { LocationVerification } from './pages/attendee/LocationVerification';
import { Success } from './pages/attendee/Success';
import { NotFound } from './pages/NotFound';

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs text-slate-400 font-medium tracking-wide">Authenticating...</p>
    </div>
  </div>
);

function RootRedirect() {
  const { isAuthenticated, role, loading, profileError } = useAuth();

  // Auth session resolving
  if (loading) return <Spinner />;

  if (!isAuthenticated || profileError) {
    return <Navigate to="/login" replace />;
  }

  const normalizedRole = role ? String(role).trim().toLowerCase() : null;
  if (normalizedRole === 'organizer') {
    return <Navigate to="/organizer/dashboard" replace />;
  }

  if (normalizedRole === 'attendee') {
    return <Navigate to="/attendee/scan" replace />;
  }

  return <Navigate to="/login" replace />;
}

function PublicAuthRoute({ children }) {
  const { isAuthenticated, role, loading, profileError } = useAuth();
  const [searchParams] = useSearchParams();

  // Auth session resolving
  if (loading) return <Spinner />;

  // If there's an active profile error, keep user on login page to see error banner
  if (profileError) {
    return children;
  }

  if (isAuthenticated) {
    const normalizedRole = role ? String(role).trim().toLowerCase() : null;
    if (normalizedRole === 'organizer') {
      return <Navigate to="/organizer/dashboard" replace />;
    }
    if (normalizedRole === 'attendee') {
      // Honor returnTo from QR scan so the attendee lands on the event page
      const returnTo = searchParams.get('returnTo');
      if (returnTo && returnTo.startsWith('/')) {
        return <Navigate to={returnTo} replace />;
      }
      return <Navigate to="/attendee/scan" replace />;
    }
    // Unresolved role: remain on children (login)
    return children;
  }

  return children;
}

function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Auth */}
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <Login />
          </PublicAuthRoute>
        }
      />

      {/* Organizer Portal - Accessible ONLY to Organizer users */}
      <Route
        path="/organizer"
        element={
          <ProtectedRoute allowedRoles={['organizer']}>
            <OrganizerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/organizer/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="events" element={<Events />} />
        <Route path="events/:id" element={<EventDetails />} />
        <Route path="events/:id/attendance" element={<EventAttendance />} />
        <Route path="reports" element={<Reports />} />
      </Route>

      {/* Attendee Mobile-First Check-In Flow - Protected for Authenticated users */}
      <Route
        path="/attendee"
        element={
          <ProtectedRoute allowedRoles={['attendee', 'organizer']}>
            <AttendeeLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/attendee/scan" replace />} />
        <Route path="scan" element={<Scan />} />
        <Route path="location" element={<LocationVerification />} />
        <Route path="success" element={<Success />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
