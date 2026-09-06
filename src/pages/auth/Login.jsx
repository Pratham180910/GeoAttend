import React, { useState } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  QrCode,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  UserCheck,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { signIn, profileError } = useAuth();
  const [email, setEmail] = useState('organizer@stanford.edu');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('organizer'); // 'organizer' | 'attendee'
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    try {
      const result = await signIn(email, password);
      if (result?.error) {
        setAuthError(result.error.message || 'Profile verification failed');
        return;
      }
      const userRole = result?.profile?.role ? String(result.profile.role).trim().toLowerCase() : null;
      if (userRole === 'organizer') {
        navigate('/organizer/dashboard');
      } else if (userRole === 'attendee') {
        // Return to the scanned session if arriving from a QR code URL
        const fromState = location.state?.from
          ? `${location.state.from.pathname}${location.state.from.search || ''}`
          : null;
        const returnParam = searchParams.get('returnTo');
        const returnUrl = fromState || returnParam;

        if (returnUrl && returnUrl.startsWith('/attendee')) {
          navigate(returnUrl, { replace: true });
        } else {
          navigate('/attendee/scan');
        }
      } else {
        setAuthError('Your account has no valid role assigned. Contact your administrator.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setAuthError(err.message || 'Invalid email or password. Please check your Supabase credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-navy-900 to-indigo-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Background glowing gradients */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Branding & Highlights */}
        <div className="lg:col-span-6 space-y-6 text-slate-100 pr-0 lg:pr-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Smart Attendance</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/40">
                <MapPin className="w-6 h-6" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                GeoAttend
              </h1>
            </div>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Eliminate proxy attendance with high-precision <strong className="text-white font-semibold">Geofencing</strong> and dynamic <strong className="text-white font-semibold">Time-Synced QR codes</strong>.
            </p>
          </div>

          {/* Feature List */}
          <div className="space-y-3 pt-2">
            {[
              {
                title: 'Sub-meter Geofence Accuracy',
                desc: 'Instant GPS proximity checks guarantee physical presence inside lecture halls.',
              },
              {
                title: 'Rotating Cryptographic QR Tokens',
                desc: 'Dynamic 15-second refresh prevents photo sharing and remote check-ins.',
              },
              {
                title: 'Real-Time Organizer Analytics',
                desc: 'Live check-in stream, exportable rosters, and attendance trend analytics.',
              },
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-white">{feature.title}</h4>
                  <p className="text-xs text-slate-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Login Card */}
        <div className="lg:col-span-6">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Sign In to GeoAttend</h2>
              <p className="text-xs text-slate-400">Select your account role and sign in with Supabase</p>
            </div>

            {/* Role Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setRole('organizer');
                  setEmail('organizer@stanford.edu');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  role === 'organizer'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Organizer / Faculty</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('attendee');
                  setEmail('attendee@stanford.edu');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 ${
                  role === 'attendee'
                    ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Attendee / Student</span>
              </button>
            </div>

            {/* Auth Error Banner */}
            {(authError || profileError) && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{authError || profileError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Work / University Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@institution.edu"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-300">Password</label>
                  <a href="#forgot" onClick={(e) => e.preventDefault()} className="text-[11px] text-indigo-400 hover:text-indigo-300">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-800/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="gradient"
                className="w-full py-3 text-sm font-semibold"
                loading={loading}
                icon={ArrowRight}
                iconPosition="right"
              >
                Sign In as {role === 'organizer' ? 'Organizer' : 'Attendee'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
