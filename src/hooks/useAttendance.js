import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const mapAttendanceStatusToUI = (dbStatus) => {
  switch (dbStatus?.toLowerCase()) {
    case 'present':
      return 'VERIFIED';
    case 'late':
      return 'PENDING_LOCATION';
    case 'absent':
      return 'ABSENT';
    default:
      return 'VERIFIED';
  }
};

export const mapAttendanceStatusToDB = (uiStatus) => {
  switch (uiStatus) {
    case 'VERIFIED':
      return 'present';
    case 'FLAGGED_DISTANCE':
      return 'late';
    case 'PENDING_LOCATION':
      return 'late';
    case 'ABSENT':
      return 'absent';
    default:
      return 'present';
  }
};

export const normaliseAttendee = (row) => {
  if (!row) return null;
  const lat = row.latitude ? Number(row.latitude) : null;
  const lon = row.longitude ? Number(row.longitude) : null;

  return {
    id: row.id,
    eventId: row.event_id,
    attendeeId: row.attendee_id,
    name: row.profiles?.full_name || row.profiles?.email || 'Attendee',
    email: row.profiles?.email || '',
    studentId: row.attendee_id ? `ID-${row.attendee_id.slice(0, 6).toUpperCase()}` : 'STU',
    department: 'Attendee',
    checkInTime: row.checked_in_at || row.created_at,
    distanceMeters: row.distance !== null && row.distance !== undefined ? Math.round(Number(row.distance)) : null,
    status: mapAttendanceStatusToUI(row.status),
    rawStatus: row.status,
    device: 'Mobile Browser',
    coordinates: lat !== null && lon !== null ? { lat, lon } : null,
    verificationMethod: 'QR + Geofence GPS',
  };
};

export function useAttendance(eventId) {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAttendance = useCallback(async () => {
    if (!eventId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // 1. Direct select from attendance
      const { data, error: attError } = await supabase
        .from('attendance')
        .select('*')
        .eq('event_id', eventId)
        .order('checked_in_at', { ascending: false });

      if (attError) throw attError;

      // 2. Fetch attendee profiles safely
      const profileMap = {};
      const attendeeIds = [
        ...new Set((data || []).map((a) => a.attendee_id).filter(Boolean)),
      ];

      if (attendeeIds.length > 0) {
        try {
          const { data: profData } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url')
            .in('id', attendeeIds);

          if (profData) {
            profData.forEach((p) => {
              profileMap[p.id] = p;
            });
          }
        } catch (pErr) {
          console.warn('Could not fetch attendee profiles:', pErr);
        }
      }

      const normalised = (data || []).map((row) =>
        normaliseAttendee({
          ...row,
          profiles: profileMap[row.attendee_id] || null,
        })
      );
      setAttendees(normalised);
    } catch (err) {
      console.error('Error fetching attendance in useAttendance:', err);
      setError(err.message || 'Failed to load attendance');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const updateAttendanceStatus = async (attendanceId, newUIStatus) => {
    const dbStatus = mapAttendanceStatusToDB(newUIStatus);
    const { data, error: updateErr } = await supabase
      .from('attendance')
      .update({ status: dbStatus })
      .eq('id', attendanceId)
      .select()
      .single();

    if (updateErr) throw updateErr;
    await fetchAttendance();
    return data;
  };

  return {
    attendees,
    loading,
    error,
    refetch: fetchAttendance,
    updateAttendanceStatus,
  };
}

export async function checkExistingAttendance(eventId, attendeeId) {
  if (!eventId || !attendeeId) return null;
  try {
    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('event_id', eventId)
      .eq('attendee_id', attendeeId)
      .maybeSingle();
    return data;
  } catch (err) {
    console.warn('Error checking existing attendance:', err);
    return null;
  }
}

export async function submitAttendance({
  eventId,
  attendeeId,
  latitude,
  longitude,
  distance,
  status = 'present',
}) {
  let finalAttendeeId = attendeeId;
  if (!finalAttendeeId) {
    const { data: authData } = await supabase.auth.getUser();
    finalAttendeeId = authData?.user?.id;
  }

  // Pre-check if attendance was already recorded to avoid duplicate insert error
  if (eventId && finalAttendeeId) {
    const existing = await checkExistingAttendance(eventId, finalAttendeeId);
    if (existing) {
      return {
        ...existing,
        alreadyMarked: true,
      };
    }
  }

  const payload = {
    event_id: eventId,
    attendee_id: finalAttendeeId,
    latitude: latitude !== undefined && latitude !== '' ? parseFloat(latitude) : null,
    longitude: longitude !== undefined && longitude !== '' ? parseFloat(longitude) : null,
    distance: distance !== undefined && distance !== '' ? parseFloat(distance) : null,
    status: status === 'VERIFIED' ? 'present' : status === 'FLAGGED' ? 'late' : status,
    checked_in_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('attendance')
    .insert(payload)
    .select()
    .single();

  if (error) {
    // Gracefully catch unique constraint violation
    if (
      error.code === '23505' ||
      error.message?.includes('unique_event_attendee') ||
      error.message?.includes('duplicate key')
    ) {
      const existingRecord = await checkExistingAttendance(eventId, finalAttendeeId);
      return {
        ...(existingRecord || payload),
        alreadyMarked: true,
      };
    }

    console.error('Error submitting attendance to Supabase:', error);
    throw error;
  }

  return data;
}
