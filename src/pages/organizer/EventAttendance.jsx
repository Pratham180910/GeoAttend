import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  RefreshCw,
  Smartphone,
  ShieldCheck,
  MoreVertical,
  Check,
  X,
} from 'lucide-react';
import { useEvent } from '../../hooks/useEvents';
import { useAttendance } from '../../hooks/useAttendance';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { formatTime } from '../../utils/formatters';

export function EventAttendance() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { event, loading: eventLoading } = useEvent(id);
  const { attendees, loading: attLoading, refetch, updateAttendanceStatus } = useAttendance(id);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtered List
  const filteredList = attendees.filter((item) => {
    const matchesSearch =
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.studentId || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.department || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const verifiedCount = attendees.filter((a) => a.status === 'VERIFIED').length;
  const flaggedCount = attendees.filter((a) => a.status === 'FLAGGED_DISTANCE' || a.status === 'PENDING_LOCATION').length;
  const absentCount = attendees.filter((a) => a.status === 'ABSENT').length;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };


  const handleStatusChange = async (attId, newStatus) => {
    try {
      await updateAttendanceStatus(attId, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.message || 'Failed to update attendance status');
    }
  };

  if (eventLoading && !event) {
    return (
      <div className="py-16 text-center text-slate-500">
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm font-medium text-slate-600">Loading attendance roster...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-12 text-center text-slate-500">
        <p className="text-base font-semibold text-slate-800">Event session not found</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/organizer/events')}>
          Back to Events
        </Button>
      </div>
    );
  }

  const allowedRadius = event?.location?.radius ?? 80;

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
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {event?.code || 'EVENT'}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-indigo-600" />
                {event?.venue || 'Venue'} ({allowedRadius}m Geofence)
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{event?.title || 'Event Roster'}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={RefreshCw}
            loading={isRefreshing}
            onClick={handleRefresh}
          >
            Live Sync
          </Button>
        </div>
      </div>

      {/* Roster Stat Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-indigo-50/50 to-white border-indigo-100">
          <span className="text-xs text-indigo-700 font-medium">Total Registered</span>
          <p className="text-2xl font-bold text-indigo-950 mt-1">{attendees.length}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-emerald-50/50 to-white border-emerald-100">
          <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified Inside Geofence
          </span>
          <p className="text-2xl font-bold text-emerald-950 mt-1">{verifiedCount}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-rose-50/50 to-white border-rose-100">
          <span className="text-xs text-rose-700 font-medium flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Flagged (Out of Range)
          </span>
          <p className="text-2xl font-bold text-rose-950 mt-1">{flaggedCount}</p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-slate-50 to-white">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-slate-400" />
            Not Checked In
          </span>
          <p className="text-2xl font-bold text-slate-700 mt-1">{absentCount}</p>
        </Card>
      </div>

      {/* Filter and Table Container */}
      <Card className="overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/40">
          <div className="w-full sm:w-80">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by student name, roll ID, email..."
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'ALL', label: 'All Roster' },
              { id: 'VERIFIED', label: 'Verified' },
              { id: 'FLAGGED_DISTANCE', label: 'Flagged' },
              { id: 'ABSENT', label: 'Absent' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table Content */}
        {filteredList.length === 0 ? (
          <div className="p-6">
            <EmptyState
              icon={Users}
              title="No attendees match filter"
              description="No attendee records match the search query or selected filter criteria."
              actionLabel="Clear Filter"
              onAction={() => {
                setSearchQuery('');
                setStatusFilter('ALL');
              }}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sm:px-6">Student Details</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Verification Status</th>
                  <th className="py-3.5 px-4">GPS Proximity</th>
                  <th className="py-3.5 px-4">Check-in Time</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Student Info */}
                    <td className="py-3.5 px-4 sm:px-6">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">{att.name}</div>
                        <div className="flex items-center gap-2 text-slate-400 text-[11px] mt-0.5">
                          <span className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px]">
                            {att.studentId}
                          </span>
                          <span>{att.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {att.department}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <Badge status={att.status} />
                    </td>

                    {/* Distance */}
                    <td className="py-3.5 px-4">
                      {att.distanceMeters !== null ? (
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-semibold ${
                              att.distanceMeters <= allowedRadius
                                ? 'text-emerald-700'
                                : 'text-rose-600'
                            }`}
                          >
                            {att.distanceMeters}m away
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (max {allowedRadius}m)
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No GPS signal</span>
                      )}
                    </td>

                    {/* Timestamp & Device */}
                    <td className="py-3.5 px-4">
                      {att.checkInTime ? (
                        <div>
                          <div className="font-semibold text-slate-800">
                            {formatTime(att.checkInTime)}
                          </div>
                          {att.device && (
                            <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                              {att.device}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {att.status !== 'VERIFIED' && (
                          <button
                            onClick={() => handleStatusChange(att.id, 'VERIFIED')}
                            title="Approve / Mark Present"
                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {att.status !== 'FLAGGED_DISTANCE' && (
                          <button
                            onClick={() => handleStatusChange(att.id, 'FLAGGED_DISTANCE')}
                            title="Flag Distance Violation"
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
