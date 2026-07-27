-- Tabel Usability Feedback
CREATE TABLE public.usability_feedbacks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    name VARCHAR(255),
    department VARCHAR(255),
    frequency VARCHAR(50),
    ui_login INT CHECK (ui_login BETWEEN 1 AND 5),
    ui_dashboard INT CHECK (ui_dashboard BETWEEN 1 AND 5),
    ui_navigation INT CHECK (ui_navigation BETWEEN 1 AND 5),
    ux_upload INT CHECK (ux_upload BETWEEN 1 AND 5),
    ux_generate INT CHECK (ux_generate BETWEEN 1 AND 5),
    ux_accuracy INT CHECK (ux_accuracy BETWEEN 1 AND 5),
    ux_quota_clarity VARCHAR(50),
    feedback_favorite TEXT,
    feedback_bugs TEXT,
    feedback_improvements TEXT,
    recommend_score INT CHECK (recommend_score BETWEEN 1 AND 10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan RLS pada tabel usability_feedbacks
ALTER TABLE public.usability_feedbacks ENABLE ROW LEVEL SECURITY;

-- Pengguna yang terautentikasi (karyawan) dapat menyisipkan data (insert)
CREATE POLICY "Authenticated users can insert feedback" 
ON public.usability_feedbacks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Pengguna yang terautentikasi (karyawan) dapat melihat feedback mereka sendiri
CREATE POLICY "Users can view their own feedback" 
ON public.usability_feedbacks 
FOR SELECT 
USING (auth.uid() = user_id);
