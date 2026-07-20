'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { metadataSchema, contentSchema, evidenceSchema } from '@/utils/formSchemas'
import { UploadCloud, CheckCircle2, FileText, Camera, AlertCircle, Loader2 } from 'lucide-react'
import { submitMomDraft } from './actions'
import { useRouter } from 'next/navigation'

interface NewMomFormProps {
  userTier: string
}

export default function NewMomForm({ userTier }: NewMomFormProps) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Shared State for all steps
  const [formData, setFormData] = useState({
    agenda: '',
    meeting_date: '',
    time: '',
    type_of_meeting: [] as string[],
    location: '',
    attendees: '',
    contentFile: null as File | null,
    evidenceFile: null as File | null,
  })

  const isPremium = userTier === 'premium'

  // Forms
  const { register: registerMeta, handleSubmit: handleMetaSubmit, formState: { errors: metaErrors } } = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: { agenda: formData.agenda, meeting_date: formData.meeting_date, time: formData.time, type_of_meeting: formData.type_of_meeting, location: formData.location, attendees: formData.attendees }
  })

  const { register: registerContent, handleSubmit: handleContentSubmit, setValue: setContentValue, watch: watchContent, formState: { errors: contentErrors } } = useForm({
    resolver: zodResolver(contentSchema)
  })
  const contentFile = watchContent('contentFile')

  const { register: registerEvidence, handleSubmit: handleEvidenceSubmit, setValue: setEvidenceValue, watch: watchEvidence, formState: { errors: evidenceErrors } } = useForm({
    resolver: zodResolver(evidenceSchema)
  })
  const evidenceFile = watchEvidence('evidenceFile')

  // Step Handlers
  const onMetaSubmit = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  const onContentSubmit = (data: any) => {
    setFormData(prev => ({ ...prev, contentFile: data.contentFile }))
    setStep(3)
  }

  const onFinalSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const finalData = { ...formData, evidenceFile: data.evidenceFile }
      
      const submitData = new FormData()
      submitData.append('agenda', finalData.agenda)
      submitData.append('meeting_date', finalData.meeting_date)
      submitData.append('time', finalData.time)
      // Since it's an array, append each item separately or stringify
      submitData.append('type_of_meeting', JSON.stringify(finalData.type_of_meeting))
      submitData.append('location', finalData.location)
      submitData.append('attendees', finalData.attendees)
      if (finalData.contentFile) submitData.append('contentFile', finalData.contentFile)
      if (finalData.evidenceFile) submitData.append('evidenceFile', finalData.evidenceFile)

      const result = await submitMomDraft(submitData)
      
      if (result.success) {
        // Redirect to dashboard or success page
        router.push('/')
      } else {
        setError(result.error || 'Failed to submit form')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Stepper UI */}
      <div className="mb-8">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-telkom-red rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Metadata' },
            { num: 2, label: 'Content' },
            { num: 3, label: 'Evidence' }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.num ? 'bg-telkom-red text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > s.num ? <CheckCircle2 size={20} /> : s.num}
              </div>
              <span className={`mt-2 text-xs font-medium ${step >= s.num ? 'text-gray-900' : 'text-gray-500'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3 border border-red-100">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        
        {/* STEP 1: METADATA */}
        {step === 1 && (
          <form onSubmit={handleMetaSubmit(onMetaSubmit)} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Meeting Details</h2>
              <p className="text-sm text-gray-500 mt-1">Provide the basic context of your meeting.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda</label>
                <input {...registerMeta('agenda')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" placeholder="e.g. Q3 Marketing Strategy" />
                {metaErrors.agenda && <p className="text-red-500 text-xs mt-1">{metaErrors.agenda.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" {...registerMeta('meeting_date')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" />
                  {metaErrors.meeting_date && <p className="text-red-500 text-xs mt-1">{metaErrors.meeting_date.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" {...registerMeta('time')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" />
                  {metaErrors.time && <p className="text-red-500 text-xs mt-1">{metaErrors.time.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Meeting</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Review", "Briefing", "Coordination", "Decision Making", "Other"].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm text-gray-700 p-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input type="checkbox" value={type} {...registerMeta('type_of_meeting')} className="text-telkom-red focus:ring-telkom-red rounded" />
                      {type}
                    </label>
                  ))}
                </div>
                {metaErrors.type_of_meeting && <p className="text-red-500 text-xs mt-1">{metaErrors.type_of_meeting.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Venue / Link</label>
                <input {...registerMeta('location')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" placeholder="e.g. Zoom or Meeting Room A" />
                {metaErrors.location && <p className="text-red-500 text-xs mt-1">{metaErrors.location.message as string}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (Comma separated)</label>
                <textarea {...registerMeta('attendees')} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" placeholder="John Doe, Jane Smith..."></textarea>
                {metaErrors.attendees && <p className="text-red-500 text-xs mt-1">{metaErrors.attendees.message as string}</p>}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-telkom-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors">
                Next Step
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: CONTENT */}
        {step === 2 && (
          <form onSubmit={handleContentSubmit(onContentSubmit)} className="space-y-6">
             <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Content</h2>
              <p className="text-sm text-gray-500 mt-1">
                {isPremium ? "Upload your meeting transcript or audio recording." : "Upload your meeting transcript (.txt or .docx). Upgrade to Premium for audio support."}
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              <FileText className="text-gray-400 mb-4" size={48} />
              
              <input 
                type="file" 
                id="contentUpload" 
                className="hidden" 
                accept={isPremium ? ".txt,.docx,.mp3,.wav,.m4a" : ".txt,.docx"}
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setContentValue('contentFile', file, { shouldValidate: true })
                }}
              />
              
              <label htmlFor="contentUpload" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-2 shadow-sm">
                Choose File
              </label>
              
              {contentFile ? (
                <p className="text-sm font-medium text-telkom-navy mt-2">Selected: {(contentFile as File).name}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-2">
                  {isPremium ? "Supported formats: TXT, DOCX, MP3, WAV, M4A" : "Supported formats: TXT, DOCX only"}
                </p>
              )}
            </div>
            {contentErrors.contentFile && <p className="text-red-500 text-xs text-center">{contentErrors.contentFile.message as string}</p>}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(1)} className="text-gray-600 font-medium px-6 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                Back
              </button>
              <button type="submit" className="bg-telkom-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors">
                Next Step
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: EVIDENCE */}
        {step === 3 && (
          <form onSubmit={handleEvidenceSubmit(onFinalSubmit)} className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Evidence</h2>
              <p className="text-sm text-gray-500 mt-1">Upload a photo of the meeting (Max 3MB).</p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-gray-50 hover:bg-gray-100 transition-colors">
              {evidenceFile ? (
                <div className="mb-4 relative group">
                  <div className="w-40 h-40 rounded-lg overflow-hidden border border-gray-200 shadow-sm mx-auto relative">
                    <img 
                      src={URL.createObjectURL(evidenceFile as File)} 
                      alt="Evidence Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm font-medium text-telkom-navy mt-3 truncate max-w-xs mx-auto px-4" title={(evidenceFile as File).name}>
                    Selected: {(evidenceFile as File).name}
                  </p>
                </div>
              ) : (
                <Camera className="text-gray-400 mb-4" size={48} />
              )}
              
              <input 
                type="file" 
                id="evidenceUpload" 
                className="hidden" 
                accept="image/jpeg,image/png,image/jpg"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) setEvidenceValue('evidenceFile', file, { shouldValidate: true })
                }}
              />
              
              <label htmlFor="evidenceUpload" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors mb-2 shadow-sm">
                {evidenceFile ? 'Change Photo' : 'Choose Photo'}
              </label>
              
              {!evidenceFile && (
                <p className="text-xs text-gray-500 mt-2">Supported formats: JPG, PNG (Max 3MB)</p>
              )}
            </div>
            {evidenceErrors.evidenceFile && <p className="text-red-500 text-xs text-center">{evidenceErrors.evidenceFile.message as string}</p>}

            <div className="flex justify-between pt-4">
              <button type="button" onClick={() => setStep(2)} disabled={isSubmitting} className="text-gray-600 font-medium px-6 py-2 hover:bg-gray-100 rounded-lg transition-colors">
                Back
              </button>
              <button type="submit" disabled={isSubmitting} className="bg-telkom-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 shadow-sm">
                {isSubmitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Saving Draft...</>
                ) : (
                  <><UploadCloud size={18} /> Save & Process Later</>
                )}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  )
}
