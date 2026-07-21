-- 1. Security: Revoke Client-Side UPDATE on Users
-- Users should not be able to upgrade their own tier or quota from the browser.
DROP POLICY IF EXISTS "User can update own data" ON public.users;

-- 2. Security: Secure Storage Bucket (mom_contents)
-- Ensure Row Level Security is enabled on storage objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Allow users to fully manage only their own files inside the mom_contents bucket
DROP POLICY IF EXISTS "Users can manage their own files in mom_contents" ON storage.objects;
CREATE POLICY "Users can manage their own files in mom_contents" 
ON storage.objects 
FOR ALL 
USING (bucket_id = 'mom_contents' AND auth.uid() = owner) 
WITH CHECK (bucket_id = 'mom_contents' AND auth.uid() = owner);

-- 3. Security: Stricter Policy for meeting_mom
-- Prevent users from inserting documents on behalf of other users
DROP POLICY IF EXISTS "User can manage their own MoM documents" ON public.meeting_mom;
CREATE POLICY "User can manage their own MoM documents" 
ON public.meeting_mom
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. Performance: Indexes for Dashboard Queries
-- Speeds up "Recent Meeting Minutes" and draft counting
CREATE INDEX IF NOT EXISTS idx_meeting_mom_user_updated 
ON public.meeting_mom (user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_meeting_mom_user_status 
ON public.meeting_mom (user_id, status);
