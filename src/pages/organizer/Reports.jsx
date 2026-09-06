import React, { useState, useMemo } from 'react';
import {
  FileBarChart,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Users,
  Building,
  TrendingUp,
  Clock,
  MapPin,
} from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { Card, CardHeader } from '../../components/common/Card';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { EmptyState } from '../../components/common/EmptyState';
import { AttendanceTrendsChart } from '../../components/charts/AttendanceTrendsChart';
import { DepartmentBreakdownChart } from '../../components/charts/DepartmentBreakdownChart';
import { formatDate } from '../../utils/formatters';

export function Reports() {
  const { events: eventsList, loading } = useEvents();
  const [selectedRange, setSelectedRange] = useState('30d');

  // Filter events by selected date range
  const filteredEvents = useMemo(() => {
    if (!eventsList || eventsList.length === 0) return [];
    const now = new Date().getTime();
    const daysLimit = selectedRange === '7d' ? 7 : selectedRange === '30d' ? 30 : 90;
    const cutoffTime = now - daysLimit * 24 * 60 * 60 * 1000;

    return eventsList.filter((e) => {
      if (!e.date) return true;
      const eventTime = new Date(e.date).getTime();
      return isNaN(eventTime) || eventTime >= cutoffTime;
    });
  }, [eventsList, selectedRange]);

  // Aggregate real statistics strictly from Supabase events
  const totalRegisteredAll = useMemo(
    () => filteredEvents.reduce((acc, e) => acc + (e.totalRegistered || 0), 0),
    [filteredEvents]
  );
  const totalPresentAll = useMemo(
    () => filteredEvents.reduce((acc, e) => acc + (e.presentCount || 0), 0),
    [filteredEvents]
  );
  const totalFlaggedAll = useMemo(
    () => filteredEvents.reduce((acc, e) => acc + (e.flaggedCount || 0), 0),
    [filteredEvents]
  );

  const overallAttendanceRate =
    totalRegisteredAll > 0
      ? `${((totalPresentAll / totalRegisteredAll) * 100).toFixed(1)}%`
      : '0.0%';

  const complianceRate =
    totalRegisteredAll > 0
      ? `${((totalPresentAll / totalRegisteredAll) * 100).toFixed(1)}% compliance`
      : '0.0% compliance';

  const distinctVenuesCount = useMemo(() => {
    return new Set(filteredEvents.map((e) => e.venue || e.department).filter(Boolean)).size;
  }, [filteredEvents]);

  // Trend chart dataset mapped strictly from real event data
  const trendChartData = useMemo(() => {
    return filteredEvents.slice(0, 10).map((ev) => ({
      day: ev.title ? (ev.title.length > 12 ? `${ev.title.slice(0, 12)}…` : ev.title) : ev.code,
      verified: ev.presentCount || 0,
      flagged: ev.flaggedCount || 0,
      absent: Math.max(0, (ev.totalRegistered || 0) - (ev.presentCount || 0)),
    }));
  }, [filteredEvents]);

  const hasAttendanceData = totalPresentAll > 0 || totalFlaggedAll > 0;

  // Real breakdown of verification status
  const verificationModesData = useMemo(() => {
    const data = [
      { name: 'Geofence GPS Verified', value: totalPresentAll, color: '#10B981' },
      { name: 'Flagged Distance', value: totalFlaggedAll, color: '#F43F5E' },
    ].filter((item) => item.value > 0);
    return data;
  }, [totalPresentAll, totalFlaggedAll]);

  // Real department / venue distribution
  const departmentDistribution = useMemo(() => {
    if (!filteredEvents || filteredEvents.length === 0) return [];
    const deptMap = {};
    filteredEvents.forEach((e) => {
      const key = e.department || e.venue || 'General Campus';
      deptMap[key] = (deptMap[key] || 0) + (e.presentCount || 0);
    });

    const totalStudents = Object.values(deptMap).reduce((a, b) => a + b, 0);
    const colorPalette = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

    return Object.entries(deptMap).map(([name, count], idx) => ({
      name,
      students: count,
      pct: totalStudents > 0 ? Math.round((count / totalStudents) * 100) : 0,
      color: colorPalette[idx % colorPalette.length],
    }));
  }, [filteredEvents]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Compliance Insights</h2>
          <p className="text-xs text-slate-500">Live turnout velocity, geofence verification stats, and venue logs from Supabase</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time range selector */}
          <div className="flex bg-white rounded-xl border border-slate-200 p-1 text-xs font-semibold shadow-sm">
            {['7d', '30d', '90d'].map((range) => (
              <button
                key={range}
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  selectedRange === range
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : 'Last Quarter'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Real High-level KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Overall Attendance Rate"
          value={loading ? '—' : overallAttendanceRate}
          subtitle={
            totalRegisteredAll > 0
              ? `${totalPresentAll} of ${totalRegisteredAll} check-ins`
              : '0 registered attendees'
          }
          icon={TrendingUp}
          iconBg="bg-indigo-50 text-indigo-600"
        />
        <StatCard
          title="Geofence Verified"
          value={loading ? '—' : totalPresentAll.toLocaleString()}
          subtitle={complianceRate}
          icon={CheckCircle2}
          iconBg="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Proxy Attempts Flagged"
          value={loading ? '—' : totalFlaggedAll.toLocaleString()}
          subtitle={totalFlaggedAll > 0 ? `${totalFlaggedAll} out-of-range attempts` : '0 anomalies detected'}
          icon={AlertTriangle}
          iconBg="bg-rose-50 text-rose-600"
        />
        <StatCard
          title="Active Venues / Divisions"
          value={loading ? '—' : distinctVenuesCount.toString()}
          subtitle={`${filteredEvents.length} session${filteredEvents.length === 1 ? '' : 's'} in range`}
          icon={Building}
          iconBg="bg-violet-50 text-violet-600"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Attendance Trends */}
        <div className="lg:col-span-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Attendance Velocity & Anomaly Trends</h3>
                <p className="text-xs text-slate-500">Live verified presence vs out-of-range attempts across events</p>
              </div>
            </div>
            {hasAttendanceData && trendChartData.length > 0 ? (
              <AttendanceTrendsChart data={trendChartData} height={280} />
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">No Check-in Records Yet</p>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  When attendees scan live QR codes and verify geofence coordinates, attendance velocity graphs will appear here.
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Real Verification Methods Breakdown */}
        <div className="lg:col-span-4">
          <Card className="p-6">
            <div className="mb-2">
              <h3 className="text-base font-bold text-slate-900">Verification Modes</h3>
              <p className="text-xs text-slate-500">Breakdown of recorded authentication results</p>
            </div>
            {verificationModesData.length > 0 ? (
              <DepartmentBreakdownChart data={verificationModesData} height={280} />
            ) : (
              <div className="h-[280px] flex flex-col items-center justify-center text-center p-6 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle2 className="w-10 h-10 text-slate-300 mb-2" />
                <p className="text-sm font-semibold text-slate-700">0 Verifications</p>
                <p className="text-xs text-slate-400 max-w-[200px] mt-1">
                  No GPS verification records submitted in this timeframe.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Real Venue/Department Breakdown & Session Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Real Division / Venue Distribution */}
        <div className="lg:col-span-5">
          <Card className="p-6">
            <div className="mb-4">
              <h3 className="text-base font-bold text-slate-900">Venue & Division Distribution</h3>
              <p className="text-xs text-slate-500">Verified attendees grouped by venue or department</p>
            </div>
            {departmentDistribution.length > 0 ? (
              <div className="space-y-3">
                {departmentDistribution.map((dept) => (
                  <div key={dept.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800">{dept.name}</span>
                      <span className="text-slate-500 font-mono">
                        {dept.students} verified ({dept.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${dept.pct}%`, backgroundColor: dept.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <span>No venues or events found for this filter.</span>
              </div>
            )}
          </Card>
        </div>

        {/* Real Session Performance Log Table */}
        <div className="lg:col-span-7">
          <Card className="h-full">
            <CardHeader
              title="Session Performance Log"
              subtitle="Audited records across campus halls"
            />
            {filteredEvents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Session Title</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Turnout</th>
                      <th className="py-3 px-4">Flagged</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredEvents.map((evt) => {
                      const turnout = evt.totalRegistered
                        ? Math.round((evt.presentCount / evt.totalRegistered) * 100)
                        : 0;
                      return (
                        <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{evt.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {evt.code} • {evt.venue}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                            {formatDate(evt.date)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {turnout}% ({evt.presentCount}/{evt.totalRegistered})
                          </td>
                          <td className="py-3 px-4">
                            {evt.flaggedCount > 0 ? (
                              <span className="font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                {evt.flaggedCount} flagged
                              </span>
                            ) : (
                              <span className="text-emerald-600 font-medium">0 anomalies</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Badge status={evt.status} size="sm" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8">
                <EmptyState
                  icon={Calendar}
                  title="No Session Logs Found"
                  description="There are no active or completed sessions recorded for this timeframe."
                />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
