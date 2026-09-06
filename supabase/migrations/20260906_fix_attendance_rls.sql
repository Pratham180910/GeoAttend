-- ==============================================================================
-- GeoAttend: Attendance Table Row-Level Security (RLS) Authorization Migration
-- ==============================================================================
-- Target Table: public.attendance
-- Objective:
--   1. Grant table-level access to authenticated role so Postgres doesn't throw 42501.
--   2. Ensure RLS is enabled on public.attendance.
--   3. Allow authenticated attendees to INSERT their own attendance record (attendee_id = auth.uid()).
--   4. Prevent attendees from inserting attendance for other users.
--   5. Allow attendees to SELECT their own attendance records, and organizers to SELECT attendance for their events.
--   6. Allow organizers to UPDATE attendance status for events they own.
--   7. Prevent attendees from updating or deleting other users' attendance records.
-- ==============================================================================

-- 1. Ensure table and sequence grants exist for authenticated users
GRANT SELECT, INSERT, UPDATE ON TABLE public.attendance TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 2. Ensure Row Level Security is active
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- 3. Drop conflicting / previous policies on attendance
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.attendance;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.attendance;
DROP POLICY IF EXISTS "Attendees can insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert own attendance" ON public.attendance;
DROP POLICY IF EXISTS "Allow attendee insert" ON public.attendance;
DROP POLICY IF EXISTS "attendance_insert_policy" ON public.attendance;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.attendance;
DROP POLICY IF EXISTS "Authenticated users can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Attendees and organizers can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "attendance_select_policy" ON public.attendance;

DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.attendance;
DROP POLICY IF EXISTS "Organizers can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "attendance_update_policy" ON public.attendance;

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.attendance;
DROP POLICY IF EXISTS "Organizers can delete attendance" ON public.attendance;
DROP POLICY IF EXISTS "attendance_delete_policy" ON public.attendance;

-- 4. INSERT Policy: Authenticated users can insert attendance ONLY for themselves
CREATE POLICY "Attendees can insert own attendance" ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (
  attendee_id = auth.uid()
);

-- 5. SELECT Policy: Attendees can view their own attendance, Organizers can view attendance for their events
CREATE POLICY "Attendees and organizers can view attendance" ON public.attendance
FOR SELECT
TO authenticated
USING (
  attendee_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.attendance.event_id
    AND public.events.organizer_id = auth.uid()
  )
);

-- 6. UPDATE Policy: Only the event organizer can update attendance records (e.g. changing status)
CREATE POLICY "Organizers can update attendance" ON public.attendance
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.attendance.event_id
    AND public.events.organizer_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.attendance.event_id
    AND public.events.organizer_id = auth.uid()
  )
);

-- 7. DELETE Policy: Only the event organizer can delete attendance records
CREATE POLICY "Organizers can delete attendance" ON public.attendance
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.events
    WHERE public.events.id = public.attendance.event_id
    AND public.events.organizer_id = auth.uid()
  )
);
