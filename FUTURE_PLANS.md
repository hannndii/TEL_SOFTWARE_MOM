# Future Plans & Ideas

Daftar ini berisi rencana, ide fitur, dan peningkatan potensial untuk sistem TELMOM di masa depan.

## 1. Integrasi Dedicated Speech-to-Text (STT) Pipeline
**Deskripsi:** Menambahkan model AI khusus STT seperti **OpenAI Whisper** atau **Groq API** sebelum memproses Notulensi.
**Alasan / Kasus Penggunaan:**
- Berguna jika perusahaan kedepannya membutuhkan dokumen "Transkrip Mentah Kata-per-Kata" (Verbatim Transcript) yang 100% sempurna sebagai lampiran dokumen legal, selain Notulensi ringkas.
- Menangani rekaman rapat dengan banyak suara yang saling tumpang tindih (overlapping) atau memiliki tingkat kebisingan (noise) yang sangat ekstrim.
**Rencana Implementasi:**
1. Mendaftar dan mendapatkan API Key (OpenAI atau Groq).
2. Mengonversi file audio (mp3/wav) menjadi teks murni terlebih dahulu via API STT.
3. Menyisipkan teks hasil transkrip tersebut ke *prompt* Gemini untuk digenerate menjadi struktur MoM (seperti yang saat ini dilakukan untuk file `.docx`).
**Status:** Disimpan untuk evaluasi di masa depan apabila performa *native audio* Gemini dirasa kurang mencukupi untuk *use-case* tertentu.
