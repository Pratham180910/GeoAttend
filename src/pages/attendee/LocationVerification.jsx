import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  Radio,
  Crosshair,
  ArrowRight,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { useEvent } from '../../hooks/useEvents';
import { useGeolocation } from '../../hooks/useGeolocation';
import { submitAttendance, checkExistingAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../../components/common/Button';

export function LocationVerification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { event, loading } = useEvent(eventId);

  const fallbackLocation = {
    lat: 37.4275,
    lon: -122.1702,
    radius: 80,
  };

  const targetLocation = event?.location || fallbackLocation;

  const {
    currentPosition,
    simulationMode,
    applyPreset,
    requestRealLocation,
    isLoading,
    error,
    distance,
    isWithin,
    radius,
  } = useGeolocation(targetLocation);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let active = true;
    const targetEvId = event?.id || eventId;
    if (user?.id && targetEvId && targetEvId !== 'default') {
      checkExistingAttendance(targetEvId, user.id).then((record) => {
        if (active && record) {
          setAlreadyMarked(true);
        }
      });
    }
    return () => {
      active = false;
    };
  }, [user?.id, event?.id, eventId]);

  const handleConfirmAttendance = async () => {
    // If already marked, go directly to success confirmation
    if (alreadyMarked) {
      navigate(
        `/attendee/success?eventId=${event?.id || eventId || 'default'}&distance=${distance}&status=VERIFIED&alreadyMarked=true`
      );
      return;
    }

    // Hard block: must be inside geofence to submit
    if (!isWithin || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitAttendance({
        eventId: event?.id || eventId,
        attendeeId: user?.id,
        latitude: currentPosition?.lat,
        longitude: currentPosition?.lon,
        distance,
        status: 'VERIFIED',
      });
      const isAlready = Boolean(res?.alreadyMarked);
      navigate(
        `/attendee/success?eventId=${event?.id || eventId || 'default'}&distance=${distance}&status=VERIFIED&lat=${currentPosition?.lat || ''}&lon=${currentPosition?.lon || ''}${isAlready ? '&alreadyMarked=true' : ''}`
      );
    } catch (err) {
      console.error('Attendance submission failed:', err);
      setSubmitError(err?.message || 'Submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-900/90 border border-white/10 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Step 2: GPS Geofence Verification</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">Proximity Range Check</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Verifying that your physical device GPS coordinates match the perimeter of <strong>{event?.venue || 'the venue'}</strong>.
          </p>
        </div>

        {/* High-Tech GPS Radar Visualizer */}
        <div className="relative w-full aspect-square max-w-xs mx-auto rounded-3xl overflow-hidden bg-slate-950 border-2 border-indigo-500/40 shadow-2xl flex flex-col items-center justify-center">
          {/* Radar Background Grids */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-40" />

          {/* Concentric Geofence Boundary Rings */}
          <div className="absolute inset-6 rounded-full border border-indigo-500/20" />
          <div className="absolute inset-16 rounded-full border border-indigo-500/30" />
          
          {/* Geofence Perimeter Ring */}
          <div className="absolute inset-10 rounded-full border-2 border-dashed border-emerald-400/80 bg-emerald-500/5 animate-pulse-subtle flex items-center justify-center">
            {/* Center Hall Beacon */}
            <div className="w-10 h-10 rounded-xl bg-indigo-600 border border-white flex items-center justify-center text-white shadow-lg shadow-indigo-600/50 z-10">
              <MapPin className="w-5 h-5" />
            </div>
          </div>

          {/* Attendee User Location Dot */}
          <div
            className={`absolute w-5 h-5 rounded-full border-2 border-white shadow-xl transition-all duration-700 flex items-center justify-center z-20 ${
              isWithin ? 'bg-emerald-500 shadow-emerald-500/80' : 'bg-rose-500 shadow-rose-500/80'
            }`}
            style={{
              top: isWithin ? '45%' : '15%',
              left: isWithin ? '55%' : '80%',
            }}
          >
            <span className="w-2 h-2 bg-white rounded-full" />
          </div>

          {/* Distance overlay tag */}
          <div className="absolute bottom-4 left-4 right-4 z-20 bg-slate-900/90 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Distance from Center:</span>
            <span
              className={`font-bold font-mono px-2 py-0.5 rounded ${
                isWithin ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
              }`}
            >
              {distance} meters
            </span>
          </div>
        </div>

        {/* Verification Status Result Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-start gap-3 transition-colors ${
            isWithin
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
          }`}
        >
          {isWithin ? (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div className="text-xs">
            <h4 className="font-bold mb-0.5 text-white">
              {isWithin ? 'Inside Approved Geofence Radius' : 'Outside Approved Geofence Perimeter'}
            </h4>
            <p className="text-slate-300">
              {isWithin
                ? `You are ${distance}m from ${event?.venue || 'the venue'} (Allowance: ${radius}m). Your attendance will be marked Verified.`
                : `You are ${distance}m away, which exceeds the ${radius}m limit. Submitting will flag your record for organizer review.`}
            </p>
          </div>
        </div>

        {/* Simulation Mode Switcher for Demo */}
        <div className="space-y-2 pt-2 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">GPS Scenario Simulator:</span>
            <span className="text-[10px] text-slate-400 font-mono">Simulate Distance</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset('inside')}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                simulationMode === 'inside'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Inside (14m)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('borderline')}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                simulationMode === 'borderline'
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Boundary (72m)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('outside')}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                simulationMode === 'outside'
                  ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-sm'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              Outside (290m)
            </button>
          </div>

          <button
            type="button"
            onClick={requestRealLocation}
            className="w-full mt-2 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
          >
            <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
            <span>Test Real Device GPS Sensor</span>
          </button>
        </div>

        {/* Attendance Already Marked banner */}
        {alreadyMarked && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Attendance already marked for this session.</span>
            </div>
            <button
              onClick={() =>
                navigate(
                  `/attendee/success?eventId=${event?.id || eventId || 'default'}&distance=${distance}&status=VERIFIED&alreadyMarked=true`
                )
              }
              className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 rounded-lg font-semibold text-[11px] whitespace-nowrap transition-colors"
            >
              View Ticket
            </button>
          </div>
        )}

        {/* Submission error */}
        {submitError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Action Button */}
        {alreadyMarked ? (
          <Button
            variant="outline"
            size="lg"
            className="w-full text-sm font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/10"
            onClick={() =>
              navigate(
                `/attendee/success?eventId=${event?.id || eventId || 'default'}&distance=${distance}&status=VERIFIED&alreadyMarked=true`
              )
            }
            icon={ArrowRight}
            iconPosition="right"
          >
            Attendance Already Marked — View Ticket
          </Button>
        ) : isWithin ? (
          <Button
            variant="gradient"
            size="lg"
            className="w-full text-sm font-bold shadow-indigo-600/40"
            loading={isSubmitting}
            onClick={handleConfirmAttendance}
            icon={ArrowRight}
            iconPosition="right"
          >
            Confirm &amp; Submit Attendance
          </Button>
        ) : (
          <div className="w-full flex flex-col items-center gap-2">
            <div className="w-full py-3 px-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 flex items-center justify-center gap-2 text-rose-300 text-sm font-semibold cursor-not-allowed opacity-80">
              <Lock className="w-4 h-4" />
              <span>Attendance Blocked — Outside Geofence</span>
            </div>
            <p className="text-xs text-slate-500 text-center">
              Move closer to <strong className="text-slate-300">{event?.venue || 'the venue'}</strong> to unlock submission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
