'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { metadataSchema, contentSchema } from '@/utils/formSchemas'
import { submitMomDraft } from './actions'
import { CheckCircle2, UploadCloud, FileText, AlertCircle, Loader2, Info } from 'lucide-react'

export default function NewMomForm({ userTier }: { userTier: string }) {
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
    facilitator: '',
    contentFiles: [] as File[],
  })

  const isPremium = userTier === 'premium'

  // Forms
  const { register: registerMeta, handleSubmit: handleMetaSubmit, formState: { errors: metaErrors } } = useForm({
    resolver: zodResolver(metadataSchema),
    defaultValues: { agenda: formData.agenda, meeting_date: formData.meeting_date, time: formData.time, type_of_meeting: formData.type_of_meeting, location: formData.location, attendees: formData.attendees, facilitator: formData.facilitator }
  })

  const { register: registerContent, handleSubmit: handleContentSubmit, setValue: setContentValue, watch: watchContent, formState: { errors: contentErrors } } = useForm({
    resolver: zodResolver(contentSchema)
  })
  const contentFiles = watchContent('contentFiles')

  // Step Handlers
  const onMetaSubmit = (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
    setStep(2)
  }

  const onFinalSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      const finalData = { ...formData, contentFiles: data.contentFiles }
      
      const submitData = new FormData()
      submitData.append('agenda', finalData.agenda)
      submitData.append('meeting_date', finalData.meeting_date)
      submitData.append('time', finalData.time)
      submitData.append('type_of_meeting', JSON.stringify(finalData.type_of_meeting))
      submitData.append('location', finalData.location)
      submitData.append('attendees', finalData.attendees)
      submitData.append('facilitator', finalData.facilitator)
      
      if (finalData.contentFiles && finalData.contentFiles.length > 0) {
        for (let i = 0; i < finalData.contentFiles.length; i++) {
          submitData.append('contentFiles', finalData.contentFiles[i])
        }
      }

      const result = await submitMomDraft(submitData)
      
      if (result.success) {
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
      <div className="mb-8 px-16">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 rounded-full z-0"></div>
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-telkom-red rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 1) * 100}%` }}></div>
          
          {[
            { num: 1, label: 'Metadata' },
            { num: 2, label: 'Transcript' }
          ].map((s) => (
            <div key={s.num} className="relative z-10 flex flex-col items-center bg-gray-50 px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${step >= s.num ? 'bg-telkom-red text-white shadow-md' : 'bg-gray-200 text-gray-500'}`}>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Venue</label>
                  <input {...registerMeta('location')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" placeholder="e.g. Zoom or Room 302" />
                  {metaErrors.location && <p className="text-red-500 text-xs mt-1">{metaErrors.location.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (Comma separated)</label>
                  <input {...registerMeta('attendees')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" placeholder="e.g. John Doe, Jane Smith" />
                  {metaErrors.attendees && <p className="text-red-500 text-xs mt-1">{metaErrors.attendees.message as string}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator</label>
                <input {...registerMeta('facilitator')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red focus:border-transparent outline-none transition-all" placeholder="e.g. Budi Santoso" />
                {metaErrors.facilitator && <p className="text-red-500 text-xs mt-1">{metaErrors.facilitator.message as string}</p>}
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button type="submit" className="bg-telkom-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 transition-colors">
                Next Step
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: TRANSCRIPT */}
        {step === 2 && (
          <form onSubmit={handleContentSubmit(onFinalSubmit)} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Upload Transcript</h2>
              <p className="text-sm text-gray-500 mt-1">
                Upload up to 5 transcript files (.txt, .docx). They will be combined by the AI to form the full meeting record.
              </p>
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors relative">
              <input 
                type="file" 
                multiple
                accept={isPremium ? ".txt,.docx,.mp3,.wav,.m4a" : ".txt,.docx"}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                {...registerContent('contentFiles')}
              />
              <UploadCloud className="mx-auto text-gray-400 mb-4" size={48} />
              
              {contentFiles && contentFiles.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-telkom-navy">{contentFiles.length} file(s) selected:</p>
                  <ul className="text-xs text-gray-500 inline-block text-left list-disc list-inside">
                    {Array.from(contentFiles).map((f: any, i) => (
                      <li key={i}>{f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500">
                    Max 5 files. {isPremium ? 'TXT, DOCX, MP3, WAV up to 20MB.' : 'TXT, DOCX up to 20MB each.'}
                  </p>
                </>
              )}
            </div>
            
            {contentErrors.contentFiles && <p className="text-red-500 text-xs mt-1 text-center">{contentErrors.contentFiles.message as string}</p>}

            {!isPremium && (
              <div className="bg-blue-50 text-blue-800 p-4 rounded-lg flex gap-3 text-sm border border-blue-100">
                <Info className="shrink-0" size={20} />
                <p>Free tier allows text formats only. <a href="/settings" className="font-bold underline">Upgrade to Premium</a> to support audio uploads.</p>
              </div>
            )}

            <div className="pt-6 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="text-gray-600 font-medium hover:text-gray-900 px-4 py-2">
                Back
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-telkom-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-70"
              >
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting ? 'Generating Draft...' : 'Generate MoM'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
