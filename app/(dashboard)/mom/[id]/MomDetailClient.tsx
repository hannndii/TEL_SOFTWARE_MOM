'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Printer, CheckCircle2 } from 'lucide-react'

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
  
  // Format date correctly
  const meetingDateObj = new Date(mom.meeting_date)
  const formattedDate = meetingDateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  
  // Parse checkboxes
  const types = ["Review", "Briefing", "Coordination", "Decision Making", "Other"]
  const selectedTypes = Array.isArray(content_json?.type_of_meeting) 
    ? content_json.type_of_meeting 
    : [content_json?.type_of_meeting].filter(Boolean)

  return (
    <div className="max-w-5xl mx-auto mb-20">
      
      {/* ACTION BAR (Hidden in print) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Minutes</h1>
          <p className="text-sm text-gray-500">Document is ready to be exported.</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="bg-telkom-red text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-red-700 transition-colors shadow-sm"
        >
          <Printer size={18} />
          Export to PDF
        </button>
      </div>

      {/* A4 DOCUMENT PAGE */}
      <div className="bg-white mx-auto shadow-xl print:shadow-none print:m-0 print:p-0" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
        <div className="p-10 text-sm text-black font-sans leading-relaxed">
          
          {/* HEADER TABLE */}
          <table className="w-full border-collapse border border-black mb-8">
            <tbody>
              <tr>
                <td rowSpan={4} className="border border-black w-1/4 p-4 text-center align-middle">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Telkom_Indonesia_2013.svg/1200px-Telkom_Indonesia_2013.svg.png" alt="Telkom Indonesia" className="w-24 mx-auto" />
                </td>
                <td colSpan={3} className="border border-black p-2 text-center font-bold text-lg uppercase">
                  MINUTE OF MEETING
                </td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-medium w-32">Date</td>
                <td colSpan={2} className="border border-black p-2">{formattedDate}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-medium">Time</td>
                <td colSpan={2} className="border border-black p-2">{content_json?.time || '-'}</td>
              </tr>
              <tr>
                <td className="border border-black p-2 font-medium">Venue</td>
                <td colSpan={2} className="border border-black p-2">{content_json?.location || '-'}</td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 font-medium">Meeting Called by</td>
                <td className="border border-black p-2">Telkom SDA</td>
                <td className="border border-black p-2 font-medium">Note Taker</td>
                <td className="border border-black p-2">{mom.user?.user_metadata?.full_name || 'System User'}</td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 font-medium">Type of meeting</td>
                <td colSpan={3} className="border border-black p-2">
                  <div className="flex gap-6 flex-wrap">
                    {types.map(type => (
                      <label key={type} className="flex items-center gap-1 cursor-pointer">
                        <input type="checkbox" checked={selectedTypes.includes(type)} readOnly className="w-3 h-3 text-black border-gray-400 rounded-none focus:ring-0" />
                        {type}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-black p-2 font-medium">Facilitator</td>
                <td colSpan={3} className="border border-black p-2">{mom.facilitator || '-'}</td>
              </tr>
              
              <tr>
                <td className="border border-black p-2 font-medium">Attendees</td>
                <td colSpan={3} className="border border-black p-2">{mom.participants?.join(', ') || '-'}</td>
              </tr>

              <tr>
                <td className="border border-black p-2 font-medium">AGENDA</td>
                <td colSpan={3} className="border border-black p-2">{mom.topic || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* CONTENT SECTION */}
          <div className="space-y-6">
            
            {/* A. Dasar Pembahasan */}
            <div>
              <h3 className="font-bold mb-2">A. Dasar Pembahasan</h3>
              <ul className="list-disc pl-8 space-y-1">
                {content_json?.dasar_pembahasan?.length > 0 ? (
                  content_json.dasar_pembahasan.map((item: string, i: number) => <li key={i}>{item}</li>)
                ) : (
                  <li>-</li>
                )}
              </ul>
            </div>

            {/* B. Note */}
            <div>
              <h3 className="font-bold mb-2">B. Note</h3>
              <p className="font-medium mb-2 pl-4">Topik: {mom.topic}</p>
              <div className="pl-4 space-y-4">
                {content_json?.notes?.length > 0 ? (
                  content_json.notes.map((note: any, i: number) => (
                    <div key={i}>
                      <p className="font-medium">{i + 1}. {note.nama_pihak}:</p>
                      <ul className="list-[circle] pl-8 space-y-1 mt-1">
                        {note.informasi?.map((info: string, idx: number) => (
                          <li key={idx}>{info}</li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p className="pl-4">-</p>
                )}
              </div>
            </div>

            {/* C. Action Plan */}
            <div>
              <h3 className="font-bold mb-2">C. Action Plan</h3>
              <table className="w-full border-collapse border border-black text-sm">
                <thead>
                  <tr>
                    <th className="border border-black p-2 text-left w-1/3">PIC</th>
                    <th className="border border-black p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {content_json?.action_plan?.length > 0 ? (
                    content_json.action_plan.map((action: any, i: number) => (
                      <tr key={i}>
                        <td className="border border-black p-2">{action.pic}</td>
                        <td className="border border-black p-2">{action.action}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-black p-2">-</td>
                      <td className="border border-black p-2">-</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* D. Information Tambahan */}
            <div>
              <h3 className="font-bold mb-2">D. Information Tambahan</h3>
              <ul className="list-disc pl-8 space-y-2">
                <li><strong>Keputusan Final:</strong> {content_json?.informasi_tambahan?.keputusan_final || '-'}</li>
                <li><strong>Kendala yang Disampaikan:</strong> {content_json?.informasi_tambahan?.kendala || '-'}</li>
                <li><strong>Risiko yang Disebutkan:</strong> {content_json?.informasi_tambahan?.risiko || '-'}</li>
                <li><strong>Hal yang Masih Menunggu Keputusan:</strong> {content_json?.informasi_tambahan?.menunggu_keputusan || '-'}</li>
              </ul>
            </div>

            {/* SIGNATURE SECTION (Page Break for PDF if needed, but we let it flow naturally) */}
            <div className="pt-20 pb-10">
              <div className="flex justify-center text-center">
                <div>
                  <p>Jakarta, {formattedDate}</p>
                  <p className="font-bold">Mengetahui</p>
                  
                  <div className="mt-24">
                    <p className="font-bold">Via {content_json?.location?.includes('Zoom') ? 'Zoom Meeting' : content_json?.location}</p>
                    <p className="font-bold">(Foto kehadiran)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* EVIDENCE PHOTO */}
            {mom.photo_evidence_url && (
              <div className="mt-10 break-before-page">
                <p className="text-xs italic mb-4">*foto yang diinput sebagai evidance</p>
                <img src={mom.photo_evidence_url} alt="Evidence" className="max-w-full h-auto max-h-[150mm] object-contain border border-gray-200" />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
