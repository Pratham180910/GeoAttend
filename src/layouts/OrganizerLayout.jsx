import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarDays,
  FileBarChart,
  LogOut,
  Menu,
  X,
  Plus,
  Bell,
  Search,
  ChevronRight,
  Shield,
  MapPin,
  Smartphone,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';

export function OrganizerLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/organizer/dashboard',
      icon: LayoutDashboard,
      badge: 'Live',
    },
    {
      label: 'Events & Sessions',
      path: '/organizer/events',
      icon: CalendarDays,
      badge: '4',
    },
    {
      label: 'Reports & Analytics',
      path: '/organizer/reports',
      icon: FileBarChart,
    },
  ];

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/dashboard')) return 'Organizer Overview';
    if (path.includes('/attendance')) return 'Live Attendance Roster';
    if (path.includes('/events/') && !path.includes('/attendance')) return 'Event Configuration';
    if (path.includes('/events')) return 'Events Management';
    if (path.includes('/reports')) return 'Attendance Reports & Insights';
    return 'Organizer Portal';
  };

  return (
    <div className="min-h-screen bg-slate-900/5 flex">
      {/* Sidebar Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar - Dark Navy & Deep Purple Theme */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-navy-900 via-[#0E1326] to-[#15132F] text-slate-200 z-50 flex flex-col justify-between border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <MapPin className="w-5 h-5" />
                </div>
                {/* Pulsing Radar Ring */}
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border border-navy-900"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white font-sans">GeoAttend</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded">Pro</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">Smart Geofence Verification</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={() => setMobileOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Button */}
          <div className="px-4 pt-5 pb-2">
            <button
              onClick={() => {
                navigate('/organizer/events');
                setMobileOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-indigo-600/30 transition-all hover:shadow-indigo-500/40 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Event</span>
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-3 space-y-1">
            <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Navigation</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/80 text-white shadow-md shadow-indigo-900/40 border border-indigo-400/20'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300 group-hover:bg-white/20">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>


        </div>

        {/* Bottom Profile & Logout Section */}
        <div className="p-4 border-t border-white/5 bg-black/20">
          <div className="p-3 rounded-xl bg-white/5 border border-white/5 mb-3 flex items-center gap-3">
            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt={profile?.name || 'Organizer'}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/50"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-xl ring-2 ring-indigo-500/50 bg-indigo-600 flex items-center justify-center flex-shrink-0"
                aria-label={profile?.name || 'Organizer'}
              >
                <span className="text-xs font-bold text-white select-none">
                  {(profile?.name || 'O')
                    .split(' ')
                    .slice(0, 2)
                    .map((w) => w[0]?.toUpperCase() || '')
                    .join('')}
                </span>
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-semibold text-white truncate">{profile?.name || 'Organizer'}</h4>
              <p className="text-[11px] text-slate-400 truncate">{profile?.email || 'Organizer Account'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            {/* Mobile Toggle */}
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <span>GeoAttend</span>
                <ChevronRight className="w-3 h-3 text-slate-400" />
                <span className="text-indigo-600 font-semibold">{getPageTitle()}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">{getPageTitle()}</h1>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Geofencing Active • High Precision</span>
            </div>

            <button
              onClick={() => navigate('/organizer/reports')}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
              title="System Alerts"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full"></span>
            </button>

            <Button
              size="sm"
              variant="outline"
              className="hidden sm:inline-flex"
              onClick={() => navigate('/attendee/scan')}
              icon={Smartphone}
            >
              Attendee View
            </Button>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
