-- Enable moddatetime extension
CREATE EXTENSION IF NOT EXISTS moddatetime schema extensions;

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_name TEXT NOT NULL,
    customer_name TEXT,
    dasar_penunjukan JSONB DEFAULT '[]'::jsonb,
    link_tomps JSONB DEFAULT '{}'::jsonb,
    masa_layanan JSONB DEFAULT '{}'::jsonb,
    scope_of_work JSONB DEFAULT '[]'::jsonb,
    dokumen_project JSONB DEFAULT '[]'::jsonb,
    pic_project JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add updated_at trigger for projects
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE moddatetime (updated_at);

-- RLS for projects
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own projects."
    ON public.projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects."
    ON public.projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects."
    ON public.projects FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects."
    ON public.projects FOR DELETE
    USING (auth.uid() = user_id);

-- Alter meeting_mom table
ALTER TABLE public.meeting_mom 
ADD COLUMN project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
ADD COLUMN note_taker TEXT;
