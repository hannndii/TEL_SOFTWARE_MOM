'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, CheckCircle2, AlertCircle } from 'lucide-react'

export default function MomDetailClient({ mom }: { mom: any }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(mom.status === 'draft')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (mom.status === 'draft') {
      const processMom = async () => {
        try {
          const res = await fetch('/api/generate-mom', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ momId: mom.id })
          })
          
          const data = await res.json()
          
          if (!res.ok) {
            throw new Error(data.error || 'Failed to generate MoM')
          }
          
          // Refresh page to get the updated status and JSON content
          router.refresh()
          setIsProcessing(false)
        } catch (err: any) {
          setError(err.message)
          setIsProcessing(false)
        }
      }

      processMom()
    }
  }, [mom.id, mom.status, router])

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-lg mx-auto text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center animate-pulse">
            <Loader2 className="text-telkom-red animate-spin" size={40} />
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI is analyzing your meeting...</h2>
          <p className="text-gray-500 mt-2">Please wait while Gemini processes your transcript and extracts the main discussion, notes, and action plans. This may take a minute.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl border border-red-100 max-w-2xl mx-auto mt-10 flex gap-4">
        <AlertCircle className="text-red-600 shrink-0" size={24} />
        <div>
          <h3 className="font-semibold text-red-900">Processing Failed</h3>
          <p className="text-red-700 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  const { content_json } = mom

  // For Sprint 4, we just display the JSON result cleanly. 
  // In Sprint 5, we will build the Rich Text Editor here.
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-start border-b border-gray-100 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{mom.topic}</h1>
              <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                <CheckCircle2 size={14} /> Completed
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              {new Date(mom.meeting_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              {content_json?.location && ` • ${content_json.location}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">AI Model</p>
            <p className="text-xs text-gray-500">{mom.ai_model_used}</p>
          </div>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-bold text-telkom-navy flex items-center gap-2 mb-3">
              <FileText size={20} /> Pembahasan Utama
            </h2>
            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 text-sm leading-relaxed border border-gray-100">
              {content_json?.pembahasan_utama || 'Tidak ada data pembahasan.'}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-telkom-navy flex items-center gap-2 mb-3">
              <FileText size={20} /> Catatan Partisipan
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
              {content_json?.note_dari_tiap_pihak?.length > 0 ? (
                content_json.note_dari_tiap_pihak.map((note: string, idx: number) => (
                  <li key={idx}>{note}</li>
                ))
              ) : (
                <li className="text-gray-500 italic">Tidak ada catatan spesifik.</li>
              )}
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-telkom-navy flex items-center gap-2 mb-3">
              <FileText size={20} /> Action Plan
            </h2>
            <div className="grid gap-3">
              {content_json?.action_plan?.length > 0 ? (
                content_json.action_plan.map((action: string, idx: number) => (
                  <div key={idx} className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm flex items-start gap-3">
                    <div className="bg-red-50 text-telkom-red w-6 h-6 rounded-full flex items-center justify-center shrink-0 font-bold text-xs">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 mt-0.5">{action}</p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 italic">Tidak ada action plan.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
