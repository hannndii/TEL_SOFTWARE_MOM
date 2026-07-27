-- Update the default quota for existing users
UPDATE public.users SET daily_quota_left = 50;

-- Update the default value for the daily_quota_left column
ALTER TABLE public.users ALTER COLUMN daily_quota_left SET DEFAULT 50;

-- Update the handle_new_user trigger to set 50 quota for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, tier, daily_quota_left)
  VALUES (new.id, new.email, 'internal', 50);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
