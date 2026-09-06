import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Clock,
  Users,
  Shield,
  QrCode,
  ArrowLeft,
  Share2,
  Edit,
  Save,
  CheckCircle2,
  AlertCircle,
  Radio,
} from 'lucide-react';
import { useEvent } from '../../hooks/useEvents';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import { formatDate } from '../../utils/formatters';

export function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { event, loading, updateEventRadius } = useEvent(id);

  const [radius, setRadius] = useState(80);
  const [isSaved, setIsSaved] = useState(false);

  React.useEffect(() => {
    if (event?.location?.radius) {
      setRadius(event.location.radius);
    }
  }, [event?.location?.radius]);

  const handleSaveSettings = async () => {
    try {
      await updateEventRadius(radius);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert(err.message || 'Failed to update event radius');
    }
  };

  if (loading && !event) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-base font-semibold text-slate-800">Event not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/organizer/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/organizer/events')}
            className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge status={event.status} size="sm" />
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {event.code}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{event.title}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="md"
            icon={Users}
            onClick={() => navigate(`/organizer/events/${event.id}/attendance`)}
          >
            View Live Roster ({event.presentCount})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Geofence Map Simulator & Session Parameters */}
        <div className="lg:col-span-7 space-y-6">
          {/* Simulated Geofence Interactive Radar View */}
          <Card className="overflow-hidden">
            <CardHeader
              title="Geofence Boundary Map Simulation"
              subtitle={`Center: ${event.location.lat.toFixed(4)}°, ${event.location.lon.toFixed(4)}° • Current Radius: ${radius}m`}
              action={
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  GPS Active
                </span>
              }
            />

            <div className="p-6 bg-slate-950 relative flex items-center justify-center min-h-[300px] overflow-hidden">
              {/* Radar Grid Circles */}
              <div className="absolute inset-0 bg-[radial-gradient(#1E293B_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

              {/* Center Beacon */}
              <div className="relative z-10 flex flex-col items-center">
                {/* Outer dynamic Geofence circle */}
                <div
                  className="rounded-full border-2 border-dashed border-emerald-400/80 bg-emerald-500/10 flex items-center justify-center transition-all duration-300"
                  style={{
                    width: `${Math.min(260, Math.max(120, radius * 1.8))}px`,
                    height: `${Math.min(260, Math.max(120, radius * 1.8))}px`,
                  }}
                >
                  {/* Ping Animation */}
                  <span className="w-16 h-16 rounded-full bg-indigo-500/30 animate-radar-ping absolute pointer-events-none" />

                  {/* Venue Core */}
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 border-2 border-white shadow-xl flex items-center justify-center text-white z-20">
                    <MapPin className="w-6 h-6" />
                  </div>
                </div>

                <div className="mt-3 text-center z-20 bg-slate-900/80 px-3 py-1 rounded-full border border-white/10 backdrop-blur-sm">
                  <span className="text-xs font-bold text-white">{event.venue}</span>
                  <span className="text-[11px] text-emerald-400 font-semibold block">Geofence: {radius} meters</span>
                </div>
              </div>

              {/* Simulated attendees inside/outside radar */}
              <div
                className="absolute top-1/3 left-1/3 w-3 h-3 rounded-full bg-emerald-400 border border-white shadow-md animate-pulse"
                title="Verified Attendee"
              />
              <div
                className="absolute bottom-1/3 right-1/3 w-3 h-3 rounded-full bg-emerald-400 border border-white shadow-md animate-pulse"
                title="Verified Attendee"
              />
              <div
                className="absolute top-1/4 right-1/4 w-3 h-3 rounded-full bg-rose-500 border border-white shadow-md animate-pulse"
                title="Flagged (Outside Geofence)"
              />
            </div>

            {/* Radius Slider Bar */}
            <div className="p-6 bg-white border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-indigo-600" />
                  Adjust Geofence Perimeter Radius
                </span>
                <span className="text-indigo-600 font-bold">{radius} meters</span>
              </div>
              <input
                type="range"
                min="20"
                max="250"
                step="5"
                value={radius}
                onChange={(e) => setRadius(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>Small Room (20m)</span>
                <span>Auditorium (80m)</span>
                <span>Campus Zone (250m)</span>
              </div>
            </div>
          </Card>

          {/* Session Metadata Configuration */}
          <Card className="p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Session Details & Schedule</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Date & Time</span>
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  {formatDate(event.date)} ({event.startTime} - {event.endTime})
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Assigned Department</span>
                <span className="font-bold text-slate-800">{event.department}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Lead Organizer</span>
                <span className="font-bold text-slate-800">{event.organizer}</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block mb-1">Verification Security</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Dual GPS + Dynamic QR
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {isSaved ? (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Changes saved successfully!
                </span>
              ) : (
                <span className="text-xs text-slate-400">Settings auto-synced locally</span>
              )}

              <Button
                variant="primary"
                size="sm"
                icon={Save}
                onClick={handleSaveSettings}
              >
                Save Configuration
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Projection QR Code */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Live Dynamic QR Token</h3>
              <p className="text-xs text-slate-500">Project this QR on the classroom projector screen</p>
            </div>

            <QRCodeDisplay event={{ ...event, location: { ...event.location, radius } }} />

            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Anti-Proxy Warning</strong>
                Attendees attempting to scan outside the {radius}m boundary or using forwarded screenshots will be flagged automatically.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
