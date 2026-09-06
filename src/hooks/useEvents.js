import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

// Map DB enum status to UI status display
export const mapEventStatusToUI = (dbStatus) => {
  switch (dbStatus?.toLowerCase()) {
    case 'live':
      return 'Active';
    case 'upcoming':
      return 'Upcoming';
    case 'completed':
      return 'Completed';
    case 'draft':
      return 'Draft';
    case 'cancelled':
      return 'Cancelled';
    default:
      return dbStatus || 'Upcoming';
  }
};

// Map UI status display to DB enum status
export const mapEventStatusToDB = (uiStatus) => {
  switch (uiStatus) {
    case 'Active':
      return 'live';
    case 'Upcoming':
      return 'upcoming';
    case 'Completed':
      return 'completed';
    case 'Draft':
      return 'draft';
    case 'Cancelled':
      return 'cancelled';
    default:
      return 'upcoming';
  }
};

// Normalise a Supabase `events` row to the UI component shape
export const normaliseEvent = (row, attendanceCount = { present: 0, total: 0 }) => {
  if (!row) return null;
  const lat = Number(row.latitude) || 37.4275;
  const lon = Number(row.longitude) || -122.1702;
  const radius = Number(row.allowed_radius) || 80;

  return {
    id: row.id,
    title: row.name || 'Untitled Event',
    name: row.name,
    code: row.id ? `#${row.id.slice(0, 8).toUpperCase()}` : 'EVENT',
    category: 'Session',
    venue: row.venue || 'Campus Venue',
    date: row.event_date || new Date().toISOString().split('T')[0],
    startTime: row.start_time || '10:00 AM',
    endTime: row.end_time || '11:30 AM',
    status: mapEventStatusToUI(row.status),
    rawStatus: row.status,
    organizer: row.profiles?.full_name || row.profiles?.email || 'Organizer',
    organizerId: row.organizer_id,
    department: '',
    description: row.description || '',
    location: {
      name: row.venue || 'Venue',
      lat,
      lon,
      radius,
    },
    totalRegistered: attendanceCount.total || 0,
    presentCount: attendanceCount.present || 0,
    flaggedCount: 0,
    absentCount: Math.max(0, (attendanceCount.total || 0) - (attendanceCount.present || 0)),
    qrCodeString: row.qr_token || `GEOATTEND:EVENT:${row.id}:TOKEN:${row.id?.slice(0, 6) || 'TOKEN'}`,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export function useEvents() {
  const { user, role } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Direct select from events without embedding foreign relationships that could cause PGRST200
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // 2. Fetch organizer profiles separately if organizer_ids exist
      const profileMap = {};
      const organizerIds = [
        ...new Set((eventsData || []).map((e) => e.organizer_id).filter(Boolean)),
      ];

      if (organizerIds.length > 0) {
        try {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, full_name, email')
            .in('id', organizerIds);

          if (profilesData) {
            profilesData.forEach((p) => {
              profileMap[p.id] = p;
            });
          }
        } catch (profErr) {
          console.warn('Could not fetch profiles for organizers:', profErr);
        }
      }

      // 3. Fetch attendance counts to compute turnouts
      const countMap = {};
      try {
        const { data: attendanceData } = await supabase
          .from('attendance')
          .select('event_id, status');

        if (attendanceData) {
          attendanceData.forEach((att) => {
            if (!countMap[att.event_id]) {
              countMap[att.event_id] = { present: 0, total: 0 };
            }
            countMap[att.event_id].total += 1;
            if (att.status === 'present') {
              countMap[att.event_id].present += 1;
            }
          });
        }
      } catch (attErr) {
        console.warn('Could not fetch attendance counts:', attErr);
      }

      const normalised = (eventsData || []).map((row) =>
        normaliseEvent(
          { ...row, profiles: profileMap[row.organizer_id] || null },
          countMap[row.id] || { present: 0, total: 0 }
        )
      );

      setEvents(normalised);
    } catch (err) {
      console.error('Error in useEvents:', err);
      setError(err.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (formData) => {
    if (!user) throw new Error('User must be logged in to create an event');
    if (role !== 'organizer') throw new Error('Unauthorized: Only organizer accounts can create events');

    const payload = {
      organizer_id: user.id,
      name: formData.title || formData.name,
      description: formData.description || '',
      event_date: formData.date || formData.event_date || new Date().toISOString().split('T')[0],
      start_time: formData.startTime || formData.start_time || '10:00 AM',
      end_time: formData.endTime || formData.end_time || '11:30 AM',
      venue: formData.venue || 'Campus Venue',
      latitude: parseFloat(formData.lat || formData.latitude || 37.4275),
      longitude: parseFloat(formData.lon || formData.longitude || -122.1702),
      allowed_radius: parseInt(formData.radius || formData.allowed_radius || 80, 10),
      qr_token: `GEOATTEND:EVENT:${Date.now()}:TOKEN:${Math.random().toString(36).substring(7)}`,
      status: mapEventStatusToDB(formData.status || 'Active'),
    };

    const { data, error: insertError } = await supabase
      .from('events')
      .insert(payload)
      .select()
      .single();

    if (insertError) throw insertError;
    await fetchEvents();
    return data;
  };

  const updateEvent = async (id, updateFields) => {
    if (!user) throw new Error('User must be logged in to update an event');
    if (role !== 'organizer') throw new Error('Unauthorized: Only organizer accounts can update events');

    const payload = {};
    if (updateFields.title !== undefined || updateFields.name !== undefined) {
      payload.name = updateFields.title || updateFields.name;
    }
    if (updateFields.description !== undefined) payload.description = updateFields.description;
    if (updateFields.date !== undefined || updateFields.event_date !== undefined) {
      payload.event_date = updateFields.date || updateFields.event_date;
    }
    if (updateFields.startTime !== undefined || updateFields.start_time !== undefined) {
      payload.start_time = updateFields.startTime || updateFields.start_time;
    }
    if (updateFields.endTime !== undefined || updateFields.end_time !== undefined) {
      payload.end_time = updateFields.endTime || updateFields.end_time;
    }
    if (updateFields.venue !== undefined) payload.venue = updateFields.venue;
    if (updateFields.lat !== undefined || updateFields.latitude !== undefined) {
      payload.latitude = parseFloat(updateFields.lat ?? updateFields.latitude);
    }
    if (updateFields.lon !== undefined || updateFields.longitude !== undefined) {
      payload.longitude = parseFloat(updateFields.lon ?? updateFields.longitude);
    }
    if (updateFields.radius !== undefined || updateFields.allowed_radius !== undefined) {
      payload.allowed_radius = parseInt(updateFields.radius ?? updateFields.allowed_radius, 10);
    }
    if (updateFields.status !== undefined) {
      payload.status = mapEventStatusToDB(updateFields.status);
    }

    const { data, error: updateError } = await supabase
      .from('events')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    await fetchEvents();
    return data;
  };

  const deleteEvent = async (id) => {
    if (!user) throw new Error('User must be logged in to delete an event');
    if (role !== 'organizer') throw new Error('Unauthorized: Only organizer accounts can delete events');

    const { error: deleteError } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;
    await fetchEvents();
  };

  return {
    events,
    loading,
    error,
    refetch: fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}

export function useEvent(id) {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Direct select from events
      const { data, error: fetchErr } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (fetchErr) throw fetchErr;

      if (data) {
        // 2. Fetch organizer profile separately
        let profile = null;
        if (data.organizer_id) {
          try {
            const { data: profData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', data.organizer_id)
              .maybeSingle();
            profile = profData;
          } catch (pErr) {
            console.warn('Could not fetch organizer profile:', pErr);
          }
        }

        // 3. Fetch attendance stats for this single event
        let totalCount = 0;
        let presentCount = 0;
        try {
          const { count: tc } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', id);
          totalCount = tc || 0;

          const { count: pc } = await supabase
            .from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', id)
            .eq('status', 'present');
          presentCount = pc || 0;
        } catch (attErr) {
          console.warn('Could not fetch attendance stats:', attErr);
        }

        setEvent(
          normaliseEvent(
            { ...data, profiles: profile },
            { present: presentCount, total: totalCount }
          )
        );
      } else {
        setEvent(null);
      }
    } catch (err) {
      console.error('Error in useEvent:', err);
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const updateEventRadius = async (newRadius) => {
    if (!id) return;
    const { data, error: updateErr } = await supabase
      .from('events')
      .update({ allowed_radius: parseInt(newRadius, 10) })
      .eq('id', id)
      .select()
      .single();

    if (updateErr) throw updateErr;
    await fetchEvent();
    return data;
  };

  return {
    event,
    loading,
    error,
    refetch: fetchEvent,
    updateEventRadius,
  };
}
