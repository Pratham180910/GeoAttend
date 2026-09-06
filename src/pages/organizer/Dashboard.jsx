import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  CheckCircle2,
  AlertTriangle,
  QrCode,
  MapPin,
  ArrowRight,
  TrendingUp,
  Clock,
  Radio,
  BarChart2,
} from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { useAttendance } from '../../hooks/useAttendance';
import { useAuth } from '../../hooks/useAuth';
import { StatCard } from '../../components/common/StatCard';
import { Card, CardHeader, CardBody } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { AttendanceTrendsChart } from '../../components/charts/AttendanceTrendsChart';
import { ArrivalPatternChart } from '../../components/charts/ArrivalPatternChart';
import { Modal } from '../../components/common/Modal';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import { formatTime } from '../../utils/formatters';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { events: eventsList, loading } = useEvents();
  const [selectedEventForQR, setSelectedEventForQR] = useState(null);

  const activeEvents = eventsList.filter((e) => e.status === 'Active');
  const firstActiveEventId = activeEvents[0]?.id || eventsList[0]?.id;
  const { attendees: recentCheckIns } = useAttendance(firstActiveEventId);

  // â”€â”€ KPI Metrics â€” all derived from real Supabase data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalActiveCount = activeEvents.length;
  const totalRegisteredAll = eventsList.reduce((acc, e) => acc + (e.totalRegistered || 0), 0);
  const totalPresentAll = eventsList.reduce((acc, e) => acc + (e.presentCount || 0), 0);
  const totalFlaggedAll = eventsList.reduce((acc, e) => acc + (e.flaggedCount || 0), 0);

  // Real rate when data exists; 0% when no attendees yet (no invented fallback)
  const attendanceRate =
    totalRegisteredAll > 0
      ? ((totalPresentAll / totalRegisteredAll) * 100).toFixed(1)
      : '0.0';

  // â”€â”€ Banner text derived from actual live events â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const firstActive = activeEvents[0];
  const bannerVenue = firstActive?.venue || eventsList[0]?.venue || null;
  const bannerTitle = bannerVenue
    ? bannerVenue
    : profile?.name
    ? `${profile.name}'s GeoAttend Portal`
    : 'GeoAttend Organizer Portal';
  const bannerSubtitle =
    totalActiveCount > 0
      ? `${totalActiveCount} session${totalActiveCount > 1 ? 's' : ''} currently active with live GPS geofencing & dynamic QR code verification.`
      : eventsList.length > 0
      ? `${eventsList.length} event${eventsList.length > 1 ? 's' : ''} configured. Start a session to begin live attendance tracking.`
      : 'No events yet. Create your first event to start tracking attendance.';

  // â”€â”€ Chart data â€” per-event real records only; show empty state if none â”€â”€â”€â”€â”€â”€
  const hasAttendanceData = totalRegisteredAll > 0 || recentCheckIns.length > 0;

  const eventChartData = eventsList.slice(0, 7).map((ev) => ({
    day: (ev.title || 'Event').slice(0, 8),
    verified: ev.presentCount || 0,
    flagged: ev.flaggedCount || 0,
    absent: Math.max(0, (ev.totalRegistered || 0) - (ev.presentCount || 0)),
  }));

  const arrivalChartData = recentCheckIns
    .filter((a) => a.checkInTime)
    .reduce((acc, a) => {
      const t = new Date(a.checkInTime);
      const label = `${t.getHours()}:${String(t.getMinutes()).padStart(2, '0')}`;
      const existing = acc.find((x) => x.time === label);
      if (existing) existing.count += 1;
      else acc.push({ time: label, count: 1 });
      return acc;
    }, [])
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-navy-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white border border-white/10 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Live Attendance Service Active</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {bannerTitle}
            </h2>
            <p className="text-sm text-slate-300 max-w-xl">
              {bannerSubtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="gradient"
              size="md"
              icon={QrCode}
              onClick={() => setSelectedEventForQR(activeEvents[0])}
              disabled={!activeEvents[0]}
            >
              Display Live QR Code
            </Button>
            <Button
              variant="dark"
              size="md"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/15"
              icon={Calendar}
              onClick={() => navigate('/organizer/events')}
            >
              All Events
            </Button>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Active Sessions"
          value={loading ? '-' : totalActiveCount}
          subtitle={`${eventsList.length} total session${eventsList.length !== 1 ? 's' : ''}`}
          icon={Radio}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Today's Attendance Rate"
          value={loading ? '-' : `${attendanceRate}%`}
          subtitle={
            totalRegisteredAll === 0
              ? 'No check-ins recorded yet'
              : `${totalPresentAll} of ${totalRegisteredAll} registered`
          }
          icon={TrendingUp}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Geofence Verified"
          value={loading ? '-' : totalPresentAll}
          subtitle={
            totalRegisteredAll > 0
              ? `of ${totalRegisteredAll} total check-ins`
              : 'No verified attendees yet'
          }
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Flagged (Out-of-Bounds)"
          value={loading ? '-' : totalFlaggedAll}
          subtitle={totalFlaggedAll > 0 ? 'Manual review suggested' : 'No flags raised'}
          icon={AlertTriangle}
          iconBg="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Velocity &amp; Geofence Validation</h3>
                <p className="text-xs text-slate-500">Verified on-site check-ins vs out-of-bounds flagged attempts</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">Per Event</span>
              </div>
            </div>
            {hasAttendanceData && eventChartData.length > 0 ? (
              <AttendanceTrendsChart data={eventChartData} height={280} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400" style={{ height: 280 }}>
                <BarChart2 className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-medium text-slate-500">No attendance data yet</p>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Charts will populate once attendees begin checking in to your events.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Arrival Pattern Chart */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Arrival Flow Pattern</h3>
              <p className="text-xs text-slate-500">Peak check-in distribution across sessions</p>
            </div>
            {arrivalChartData.length > 0 ? (
              <ArrivalPatternChart data={arrivalChartData} height={280} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400" style={{ height: 280 }}>
                <Clock className="w-12 h-12 text-slate-200" />
                <p className="text-sm font-medium text-slate-500">No arrival data yet</p>
                <p className="text-xs text-slate-400 text-center max-w-xs">
                  Arrival timing charts will appear once attendees start checking in.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Active Events & Live Check-in Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Active Events */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Active & Upcoming Sessions"
              subtitle="Real-time geofenced event locations"
              action={
                <button
                  onClick={() => navigate('/organizer/events')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <span>View all</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              }
            />
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-6 h-6 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Loading events...</p>
                </div>
              ) : eventsList.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No events yet</p>
                  <p className="text-xs text-slate-400 mt-1">Create your first event to get started.</p>
                </div>
              ) : (
                eventsList.slice(0, 3).map((event) => (
                  <div key={event.id} className="p-6 hover:bg-slate-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge status={event.status} size="sm" />
                        <span className="text-xs font-mono font-semibold text-slate-500">{event.code}</span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">{event.title}</h4>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                          {event?.venue || 'Venue'} ({event?.location?.radius ?? 80}m radius)
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        icon={QrCode}
                        onClick={() => setSelectedEventForQR(event)}
                      >
                        QR Code
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={Users}
                        onClick={() => navigate(`/organizer/events/${event.id}/attendance`)}
                      >
                        Roster ({event.presentCount})
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Live Check-in Stream */}
        <div className="lg:col-span-5">
          <Card className="h-full">
            <CardHeader
              title="Live Check-in Stream"
              subtitle="Latest attendees scanned & verified"
              action={
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              }
            />
            <div className="divide-y divide-slate-100">
              {recentCheckIns.length === 0 ? (
                <div className="p-8 text-center">
                  <Users className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-500">No check-ins yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {firstActiveEventId
                      ? 'Waiting for attendees to scan the QR code.'
                      : 'Start a live session to see real-time check-ins here.'}
                  </p>
                </div>
              ) : (
                recentCheckIns.map((att) => (
                  <div key={att.id} className="p-4 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900 truncate">{att.name}</p>
                        <span className="text-[10px] font-mono text-slate-400">{att.studentId}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                        <span>{att.email || att.department}</span>
                        {att.distanceMeters !== null && (
                          <>
                            <span>â€¢</span>
                            <span className={att.distanceMeters > 80 ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                              {att.distanceMeters}m away
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <Badge status={att.status} size="sm" />
                      {att.checkInTime && (
                        <p className="text-[10px] text-slate-400 mt-1">{formatTime(att.checkInTime)}</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Dynamic QR Code Modal */}
      {selectedEventForQR && (
        <Modal
          isOpen={!!selectedEventForQR}
          onClose={() => setSelectedEventForQR(null)}
          title="Live Projection QR Code"
          subtitle={selectedEventForQR.title}
          size="md"
        >
          <div className="space-y-4">
            <QRCodeDisplay event={selectedEventForQR} />
            <div className="text-center text-xs text-slate-500">
              Project this screen in the lecture hall. Students must be within{' '}
              <strong className="text-slate-900 font-semibold">
                {selectedEventForQR?.location?.radius ?? 80} meters
              </strong>{' '}
              of {selectedEventForQR?.venue || 'the venue'} to successfully submit attendance.
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedEventForQR(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigate(`/organizer/events/${selectedEventForQR.id}/attendance`);
                }}
              >
                Open Live Roster
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
