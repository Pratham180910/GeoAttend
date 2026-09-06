import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Plus,
  MapPin,
  Clock,
  Users,
  QrCode,
  Shield,
  ArrowRight,
  Filter,
  Layers,
} from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchInput } from '../../components/common/SearchInput';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { QRCodeDisplay } from '../../components/common/QRCodeDisplay';
import { formatDate } from '../../utils/formatters';

export function Events() {
  const navigate = useNavigate();
  const { events: eventsList, loading, createEvent } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [qrModalEvent, setQrModalEvent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    code: '',
    category: 'Lecture',
    venue: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00 AM',
    endTime: '11:30 AM',
    radius: 75,
    lat: 37.4275,
    lon: -122.1702,
    totalRegistered: 100,
  });

  const filteredEvents = eventsList.filter((event) => {
    const matchesSearch =
      (event.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.code || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.venue || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || (event.status || '').toUpperCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createEvent({
        title: newEvent.title,
        venue: newEvent.venue,
        date: newEvent.date,
        startTime: newEvent.startTime,
        endTime: newEvent.endTime,
        radius: newEvent.radius,
        lat: newEvent.lat,
        lon: newEvent.lon,
        status: 'Active',
      });

      setIsCreateModalOpen(false);
      // Reset form
      setNewEvent({
        title: '',
        code: '',
        category: 'Lecture',
        venue: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00 AM',
        endTime: '11:30 AM',
        radius: 75,
        lat: 37.4275,
        lon: -122.1702,
        totalRegistered: 100,
      });
    } catch (err) {
      console.error('Error creating event:', err);
      alert(err.message || 'Failed to create event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Events & Geofenced Sessions</h2>
          <p className="text-xs text-slate-500">Configure attendance zones, geofence radius, and dynamic QR generators</p>
        </div>

        <Button
          variant="gradient"
          size="md"
          icon={Plus}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Create New Event
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by event title, code, venue..."
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'ACTIVE', 'UPCOMING', 'COMPLETED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === status
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {status === 'ALL' ? 'All Events' : status.charAt(0) + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-600">Loading events from Supabase...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          description="Try adjusting your search query or status filter to see other attendance sessions."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setStatusFilter('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => {
            const attendancePct = event.totalRegistered
              ? Math.round((event.presentCount / event.totalRegistered) * 100)
              : 0;

            return (
              <Card key={event.id} className="p-6 flex flex-col justify-between" hover>
                <div className="space-y-4">
                  {/* Card Top Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge status={event.status} size="sm" />
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                          {event.code}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          {event.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {event.title}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Geofence & Location Info Box */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-slate-700 font-medium truncate">
                        <MapPin className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                        <span className="truncate">{event.venue}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded text-[11px] shrink-0">
                        <Shield className="w-3 h-3 text-emerald-600" />
                        {event.location.radius}m Geofence
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200/50">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {formatDate(event.date)} • {event.startTime}
                      </span>
                      <span className="font-mono text-[11px]">
                        {event.location.lat.toFixed(4)}°, {event.location.lon.toFixed(4)}°
                      </span>
                    </div>
                  </div>

                  {/* Attendance Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Turnout Roster
                      </span>
                      <span className="font-bold text-slate-900">
                        {event.presentCount} / {event.totalRegistered}{' '}
                        <span className="text-slate-400 font-normal">({attendancePct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          attendancePct > 80
                            ? 'bg-emerald-500'
                            : attendancePct > 50
                            ? 'bg-indigo-500'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${attendancePct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Bottom Actions */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={QrCode}
                    onClick={() => setQrModalEvent(event)}
                  >
                    Display QR
                  </Button>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate(`/organizer/events/${event.id}`)}
                    >
                      Configure
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      icon={ArrowRight}
                      iconPosition="right"
                      onClick={() => navigate(`/organizer/events/${event.id}/attendance`)}
                    >
                      Roster
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Event Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Geofenced Attendance Session"
        subtitle="Define location coordinates, geofence radius perimeter, and session schedule"
        size="lg"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Event / Session Title</label>
              <input
                type="text"
                required
                placeholder="e.g. CS402: Cloud Architecture & Scalability"
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Course / Event Code</label>
              <input
                type="text"
                required
                placeholder="e.g. CS402-L01"
                value={newEvent.code}
                onChange={(e) => setNewEvent({ ...newEvent, code: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Category</label>
              <select
                value={newEvent.category}
                onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Lecture">Lecture</option>
                <option value="Lab Session">Lab Session</option>
                <option value="Conference">Conference</option>
                <option value="Workshop">Workshop</option>
                <option value="General Meeting">General Meeting</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-semibold text-slate-700">Classroom / Venue Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Gates Computer Science Hall 101"
                value={newEvent.venue}
                onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Date</label>
              <input
                type="date"
                required
                value={newEvent.date}
                onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Expected Registered Count</label>
              <input
                type="number"
                value={newEvent.totalRegistered}
                onChange={(e) => setNewEvent({ ...newEvent, totalRegistered: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Geofence Settings */}
          <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600" />
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">Geofence Parameters</h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Geofence Radius ({newEvent.radius}m)</label>
                <input
                  type="range"
                  min="20"
                  max="300"
                  step="5"
                  value={newEvent.radius}
                  onChange={(e) => setNewEvent({ ...newEvent, radius: e.target.value })}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newEvent.lat}
                  onChange={(e) => setNewEvent({ ...newEvent, lat: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-600">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newEvent.lon}
                  onChange={(e) => setNewEvent({ ...newEvent, lon: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Create Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Projection Modal */}
      {qrModalEvent && (
        <Modal
          isOpen={!!qrModalEvent}
          onClose={() => setQrModalEvent(null)}
          title="Live Projection QR Code"
          subtitle={qrModalEvent.title}
          size="md"
        >
          <div className="space-y-4">
            <QRCodeDisplay event={qrModalEvent} />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQrModalEvent(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  navigate(`/organizer/events/${qrModalEvent.id}/attendance`);
                }}
              >
                View Live Roster
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
