import { useState, useEffect } from 'react';
import { mockOrganizer } from '../data/mockData';

const AUTH_STORAGE_KEY = 'geoattend_auth_user';

export function useMockAuth() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // ignore parse error
      }
    }
    return {
      isAuthenticated: true,
      role: 'organizer', // 'organizer' | 'attendee'
      profile: mockOrganizer,
    };
  });

  const loginAsOrganizer = () => {
    const orgUser = {
      isAuthenticated: true,
      role: 'organizer',
      profile: mockOrganizer,
    };
    setUser(orgUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(orgUser));
  };

  const loginAsAttendee = (name = 'Alexander Hayes', studentId = 'STU-9921') => {
    const attUser = {
      isAuthenticated: true,
      role: 'attendee',
      profile: {
        id: 'att-01',
        name,
        email: `${name.toLowerCase().replace(' ', '.')}@stanford.edu`,
        role: 'Student / Attendee',
        studentId,
        department: 'Computer Science',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    };
    setUser(attUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(attUser));
  };

  const logout = () => {
    const guestUser = {
      isAuthenticated: false,
      role: null,
      profile: null,
    };
    setUser(guestUser);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  return {
    user,
    isAuthenticated: user?.isAuthenticated,
    role: user?.role,
    profile: user?.profile,
    loginAsOrganizer,
    loginAsAttendee,
    logout,
  };
}
