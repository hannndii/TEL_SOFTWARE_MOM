-- Mengaktifkan ekstensi UUID jika belum ada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabel Users dengan Quota Tracking (Sinkron dengan Supabase Auth)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR UNIQUE NOT NULL,
    tier VARCHAR(20) DEFAULT 'free', -- Kategori: 'free' atau 'premium'
    daily_quota_left INT DEFAULT 3, -- Batas sisa kuota harian untuk pengguna Free
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan RLS pada tabel users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can read own data" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "User can update own data" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Tabel Rincian Pelaksanaan Rapat & Hasil MoM
CREATE TABLE public.meeting_mom (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    topic VARCHAR NOT NULL,
    meeting_date DATE NOT NULL,
    facilitator VARCHAR NOT NULL,
    participants TEXT[] NOT NULL,
    logo_url TEXT,
    photo_evidence_url TEXT, -- Validasi batas file maksimal 5MB wajib diterapkan di sisi client
    content_json JSONB NOT NULL, -- Berisi skema: pembahasan_utama, note_dari_tiap_pihak, action_plan, informasi_tambahan
    ai_model_used VARCHAR(50) NOT NULL, -- Mencatat model yang digunakan (e.g., 'gemini-1.5-flash', 'gpt-4o')
    language VARCHAR(2) DEFAULT 'id', -- Kode bahasa: 'id' atau 'en'
    status VARCHAR(20) DEFAULT 'draft', -- Siklus: 'draft' atau 'exported'
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mengaktifkan RLS pada tabel meeting_mom
ALTER TABLE public.meeting_mom ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User can manage their own MoM documents" ON public.meeting_mom
    FOR ALL USING (auth.uid() = user_id);

-- Trigger untuk membuat baris 'users' secara otomatis saat mendaftar di auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, tier, daily_quota_left)
  VALUES (new.id, new.email, 'free', 3);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
