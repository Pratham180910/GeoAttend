import React from 'react';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { MapPin, QrCode, Navigation, CheckCircle2, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export function AttendeeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getStep = () => {
    if (location.pathname.includes('/scan')) return 1;
    if (location.pathname.includes('/location')) return 2;
    if (location.pathname.includes('/success')) return 3;
    return 1;
  };

  const currentStep = getStep();

  const steps = [
    { number: 1, label: 'Scan QR', icon: QrCode },
    { number: 2, label: 'Verify GPS', icon: Navigation },
    { number: 3, label: 'Confirmed', icon: CheckCircle2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-white/10 bg-slate-900/40 backdrop-blur-md px-4 py-3.5 sticky top-0 z-20">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link to="/attendee/scan" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/30">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="text-left">
              <span className="font-extrabold text-sm tracking-tight text-white block">GeoAttend</span>
              <span className="text-[10px] text-slate-400 block -mt-1">Attendee Portal</span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSignOut}
              className="text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 w-full max-w-xl mx-auto">
        {/* Step Indicator */}
        <div className="w-full mb-6 bg-white/5 border border-white/10 p-3.5 rounded-2xl backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between relative">
            {/* Connecting Bar */}
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-white/10 -z-0" />
            <div
              className="absolute left-6 top-1/2 -translate-y-1/2 h-0.5 bg-indigo-500 transition-all duration-500 -z-0"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />

            {steps.map((step) => {
              const StepIcon = step.icon;
              const isCompleted = step.number < currentStep;
              const isCurrent = step.number === currentStep;

              return (
                <div key={step.number} className="relative z-10 flex flex-col items-center gap-1.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/50 ring-4 ring-indigo-500/20 scale-105'
                        : 'bg-slate-800 text-slate-500 border border-white/10'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                  </div>
                  <span
                    className={`text-[11px] font-medium transition-colors ${
                      isCurrent ? 'text-indigo-300 font-semibold' : isCompleted ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Step Content */}
        <div className="w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-white/5">
        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Anti-Spoof Geofence Protected • GeoAttend v2.4</span>
        </div>
      </footer>
    </div>
  );
}
