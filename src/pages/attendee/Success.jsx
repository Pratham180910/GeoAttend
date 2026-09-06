import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useEvent } from '../../hooks/useEvents';
import { Button } from '../../components/common/Button';
import { formatDateTime } from '../../utils/formatters';

export function Success() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, profile, role } = useAuth();

  const eventId = searchParams.get('eventId') || 'evt-101';
  const status = searchParams.get('status') || 'VERIFIED';
  const distance = searchParams.get('distance') || '14';
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const alreadyMarked = searchParams.get('alreadyMarked') === 'true';

  const { event } = useEvent(eventId);
  const isVerified = status === 'VERIFIED';
  const [checkInTimestamp] = React.useState(() => new Date().toISOString());
  const [verificationHash] = React.useState(
    () => `GA-SEC-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
  );

  const attendeeName = profile?.name || profile?.full_name || user?.email || 'Alexander Hayes';
  const attendeeIdDisplay = user?.id ? `ID-${user.id.slice(0, 6).toUpperCase()}` : 'STU-9921';

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Animated Status Icon */}
        <div className="text-center space-y-3">
          <div className="relative inline-flex items-center justify-center">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-2xl ${
                alreadyMarked
                  ? 'bg-gradient-to-tr from-amber-500 to-emerald-500 shadow-amber-500/50'
                  : isVerified
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-emerald-500/50'
                  : 'bg-gradient-to-tr from-rose-500 to-amber-500 shadow-rose-500/50'
              }`}
            >
              {isVerified || alreadyMarked ? (
                <CheckCircle2 className="w-12 h-12" />
              ) : (
                <AlertTriangle className="w-12 h-12" />
              )}
            </div>
            {(isVerified || alreadyMarked) && (
              <span className="absolute -inset-2 rounded-3xl border-2 border-emerald-400/40 animate-ping pointer-events-none" />
            )}
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-white">
              {alreadyMarked
                ? 'Attendance Already Marked'
                : isVerified
                ? 'Attendance Verified!'
                : 'Submitted with Warning'}
            </h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {alreadyMarked
                ? 'Your attendance for this session was already recorded previously.'
                : isVerified
                ? 'Your physical presence inside the venue perimeter has been authenticated and recorded.'
                : 'Your check-in was logged, but your GPS location was flagged for organizer manual verification.'}
            </p>
          </div>
        </div>

        {/* Digital Ticket / Proof of Attendance Card */}
        <div className="rounded-2xl bg-black/40 border border-white/10 p-5 space-y-4 relative overflow-hidden">
          {/* Top Notch Decorative line */}
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded">
                {event?.code || 'SESSION'}
              </span>
              <span className="text-xs text-slate-300 font-semibold">{event?.category || 'Lecture'}</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                alreadyMarked
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : isVerified
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              }`}
            >
              {alreadyMarked ? 'ALREADY RECORDED' : isVerified ? 'VERIFIED PRESENT' : 'FLAGGED DISTANCE'}
            </span>
          </div>

          {/* Event and User Specs */}
          <div className="space-y-2.5 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-semibold">Course / Event</span>
              <h4 className="text-sm font-bold text-white">{event?.title || 'Attendance Session'}</h4>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Attendee</span>
                <p className="font-bold text-slate-200">{attendeeName}</p>
                <p className="text-[11px] text-slate-400 font-mono">{attendeeIdDisplay}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Recorded Time</span>
                <p className="font-bold text-slate-200">{formatDateTime(checkInTimestamp)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">Venue</span>
                <p className="text-slate-200 font-medium">{event?.venue || 'Campus Hall'}</p>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-semibold">GPS Proximity</span>
                <p className={`font-mono font-bold ${isVerified ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {distance}m from center
                </p>
              </div>
            </div>
          </div>

          {/* Cryptographic Hash Footer */}
          <div className="pt-3 border-t border-dashed border-white/10 flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>HASH: {verificationHash}</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" /> Encrypted & Stamped
            </span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="md"
            className="border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
            icon={QrCode}
            onClick={() => navigate('/attendee/scan')}
          >
            Scan Another Event
          </Button>

          <Button
            variant="gradient"
            size="md"
            icon={ArrowRight}
            iconPosition="right"
            onClick={() =>
              navigate(role === 'organizer' ? '/organizer/dashboard' : '/attendee/scan')
            }
          >
            {role === 'organizer' ? 'Go to Organizer Portal' : 'Back to Scanner'}
          </Button>
        </div>
      </div>
    </div>
  );
}
