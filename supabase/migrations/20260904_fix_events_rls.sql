-- ==============================================================================
-- GeoAttend: Events Table Row-Level Security (RLS) Authorization Migration
-- ==============================================================================
-- Target Table: public.events
-- Objective:
--   1. Require organizer_id = auth.uid() AND user profile role = 'organizer' for INSERT.
--   2. Ensure attendees can never insert events, even via direct Supabase API calls.
--   3. Restrict UPDATE and DELETE to the event's organizer with 'organizer' role.
--   4. Allow SELECT for authenticated users (organizers and attendees).
--   5. Do not disable RLS. Do not modify table schema. Do not delete existing data.
-- ==============================================================================

-- 1. Ensure Row Level Security is active on public.events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 2. Inspect & drop existing/obsolete policies on public.events to prevent conflicts
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.events;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON public.events;
DROP POLICY IF EXISTS "Users can insert events" ON public.events;
DROP POLICY IF EXISTS "Users can create events" ON public.events;
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.events;
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can insert events" ON public.events;
DROP POLICY IF EXISTS "Allow insert for organizers" ON public.events;
DROP POLICY IF EXISTS "events_insert_policy" ON public.events;

DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.events;
DROP POLICY IF EXISTS "Users can update own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update own events" ON public.events;
DROP POLICY IF EXISTS "Allow update for organizers" ON public.events;
DROP POLICY IF EXISTS "events_update_policy" ON public.events;

DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON public.events;
DROP POLICY IF EXISTS "Users can delete own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete own events" ON public.events;
DROP POLICY IF EXISTS "Allow delete for organizers" ON public.events;
DROP POLICY IF EXISTS "events_delete_policy" ON public.events;

DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
DROP POLICY IF EXISTS "Events are viewable by authenticated users" ON public.events;
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
DROP POLICY IF EXISTS "Anyone can view events" ON public.events;
DROP POLICY IF EXISTS "events_select_policy" ON public.events;

-- ==============================================================================
-- 3. Create strict, authoritative RLS policies on public.events
-- ==============================================================================

-- INSERT: Requires organizer_id = auth.uid() AND authenticated user's profile role is 'organizer'
CREATE POLICY "Organizers can insert events" ON public.events
FOR INSERT
TO authenticated
WITH CHECK (
  organizer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role = 'organizer'
  )
);

-- UPDATE: Only the event's organizer whose profile role is 'organizer' can update it
CREATE POLICY "Organizers can update own events" ON public.events
FOR UPDATE
TO authenticated
USING (
  organizer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role = 'organizer'
  )
)
WITH CHECK (
  organizer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role = 'organizer'
  )
);

-- DELETE: Only the event's organizer whose profile role is 'organizer' can delete it
CREATE POLICY "Organizers can delete own events" ON public.events
FOR DELETE
TO authenticated
USING (
  organizer_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles
    WHERE public.profiles.id = auth.uid()
    AND public.profiles.role = 'organizer'
  )
);

-- SELECT: Authenticated users (both organizers and attendees) can view events
CREATE POLICY "Authenticated users can view events" ON public.events
FOR SELECT
TO authenticated
USING (auth.role() = 'authenticated');
