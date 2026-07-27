'use client'

import { useState, useEffect } from 'react'
import { submitFeedback } from './actions'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

export default function FeedbackPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const result = await submitFeedback(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (success) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        const particleCount = 50 * (timeLeft / duration);
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
    }
  }, [success]);

  if (success) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-12 bg-white p-14 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 text-center relative overflow-hidden">
        <div className="relative z-10">
          <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm rotate-3">
            <CheckCircle2 size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Terima Kasih Banyak!</h2>
          <p className="text-gray-500 text-lg mb-10 leading-relaxed max-w-md mx-auto">
            Masukan Anda sangat berharga bagi kami. Setiap opini Anda membantu kami merancang <b>TELMOM</b> menjadi jauh lebih baik untuk produktivitas tim internal kita.
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="bg-gray-900 text-white px-8 py-3.5 rounded-xl font-medium hover:bg-gray-800 focus:ring-4 focus:ring-gray-200 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            Isi Form Kembali
          </button>
        </div>
      </div>
    )
  }

  const renderRatingScale = (name: string, label: string) => (
    <div className="mb-10 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <label className="block text-base font-bold text-gray-900 mb-4">{label}</label>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">Sangat Kurang</span>
        <div className="flex gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-center">
          {[1, 2, 3, 4, 5].map(num => (
            <label key={`${name}-${num}`} className="relative cursor-pointer group">
              <input type="radio" name={name} value={num} required className="peer sr-only" />
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-gray-600 font-bold text-lg 
                            peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 peer-checked:shadow-lg peer-checked:shadow-blue-600/30
                            group-hover:bg-gray-100 transition-all duration-200">
                {num}
              </div>
            </label>
          ))}
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider hidden sm:block">Sangat Baik</span>
      </div>
      <div className="flex justify-between w-full mt-3 sm:hidden">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Kurang</span>
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Baik</span>
      </div>
    </div>
  )

  const renderRadioCards = (name: string, label: string, options: string[]) => (
    <div className="mb-10 bg-white border border-gray-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <label className="block text-base font-bold text-gray-900 mb-4">{label}</label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {options.map(opt => (
          <label key={opt} className="relative cursor-pointer">
            <input type="radio" name={name} value={opt} required className="peer sr-only" />
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 font-medium 
                          peer-checked:bg-blue-50 peer-checked:text-blue-700 peer-checked:border-blue-300 peer-checked:ring-1 peer-checked:ring-blue-300
                          hover:bg-gray-100 transition-all duration-200 flex items-center justify-between">
              <span>{opt}</span>
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 peer-checked:border-blue-600 peer-checked:bg-blue-600 flex items-center justify-center transition-colors">
                <div className="w-2 h-2 rounded-full bg-white opacity-0 peer-checked:opacity-100 transition-opacity"></div>
              </div>
            </div>
          </label>
        ))}
      </div>
    </div>
  )

  return (
    <div className="w-full max-w-4xl mx-auto pb-20 pt-4">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center p-3 bg-blue-50 text-blue-600 rounded-2xl mb-4">
          <Sparkles size={28} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Usability Testing</h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Bantu kami mendesain pengalaman aplikasi yang lebih baik dengan membagikan pemikiran dan masukan jujur Anda.
        </p>
      </div>

      <div className="bg-white/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/80">
        {error && (
          <div className="mb-10 p-5 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 shadow-sm">
            <AlertCircle size={22} className="mt-0.5 shrink-0 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-12">
          
          {/* Section 1: Basic Info */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">1</div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Informasi Dasar</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
                <input type="text" name="name" required 
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900" 
                  placeholder="Masukkan nama Anda" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Departemen / Divisi</label>
                <input type="text" name="department" required 
                  className="w-full px-5 py-3.5 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900" 
                  placeholder="Cth: IT, HR, dll" />
              </div>
            </div>
            
            {renderRadioCards("frequency", "Seberapa sering Anda membuat Notulensi Rapat (MoM) dalam seminggu?", [
              '1 - 2 kali', '3 - 5 kali', 'Lebih dari 5 kali', 'Jarang / Tidak pernah'
            ])}
          </section>

          {/* Section 2: UI */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">2</div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pengalaman Antarmuka (UI)</h2>
            </div>
            
            {renderRatingScale("ui_login", "Bagaimana penilaian Anda terhadap tampilan visual halaman Login dan Registrasi?")}
            {renderRatingScale("ui_dashboard", "Apakah warna, teks, dan tata letak di halaman Dashboard mudah dibaca dan nyaman di mata?")}
            {renderRatingScale("ui_navigation", "Seberapa mudah Anda menemukan menu 'Create New MoM' atau navigasi lainnya?")}
          </section>

          {/* Section 3: UX */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">3</div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Pengalaman Pengguna (UX)</h2>
            </div>

            {renderRatingScale("ux_upload", "Seberapa mudah proses mengunggah file (audio/dokumen) pada halaman Create MoM?")}
            {renderRatingScale("ux_generate", "Apakah proses 'Generate' (pembuatan notulensi) berjalan lancar dan mudah dimengerti?")}
            {renderRatingScale("ux_accuracy", "Bagaimana penilaian Anda terhadap keakuratan hasil rangkuman Notulensi (MoM)?")}
            
            {renderRadioCards("ux_quota_clarity", "Apakah informasi 'Generated Today / Quota' pada Dashboard cukup jelas bagi Anda?", [
              'Ya, sangat jelas', 'Cukup jelas, namun butuh penyesuaian', 'Tidak jelas sama sekali', 'Tidak memperhatikan'
            ])}
          </section>

          {/* Section 4: Qualitative */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-sm">4</div>
              <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Masukan Kualitatif</h2>
            </div>
            
            <div className="space-y-8 bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Fitur apa yang paling Anda sukai dari aplikasi TELMOM ini?</label>
                <textarea name="feedback_favorite" required rows={3} 
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 resize-none"></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Apakah Anda menemukan kendala (error/bug)? Jika ya, tolong jelaskan di bagian mana.</label>
                <textarea name="feedback_bugs" rows={3} 
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 resize-none"></textarea>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Adakah fitur tambahan yang Anda harapkan ada di pembaruan selanjutnya?</label>
                <textarea name="feedback_improvements" rows={3} 
                  className="w-full px-5 py-4 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-gray-900 resize-none"></textarea>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <label className="block text-sm font-bold text-gray-900 mb-4 text-center">Seberapa besar kemungkinan Anda merekomendasikan aplikasi ini ke divisi lain? (1-10)</label>
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <label key={`recommend-${num}`} className="relative cursor-pointer group">
                      <input type="radio" name="recommend_score" value={num} required className="peer sr-only" />
                      <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 font-bold text-gray-600 
                                    peer-checked:bg-gray-900 peer-checked:text-white peer-checked:border-gray-900 peer-checked:shadow-lg peer-checked:shadow-gray-900/30
                                    group-hover:bg-gray-100 transition-all duration-200 text-sm sm:text-base">
                        {num}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <div className="pt-10 flex justify-center">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full sm:w-auto min-w-[240px] bg-blue-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Mengirim...</span>
                </div>
              ) : (
                'Kirim Masukan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
