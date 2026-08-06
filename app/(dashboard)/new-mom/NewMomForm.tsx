'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { metadataSchema, contentSchema, projectSchema } from '@/utils/formSchemas'
import { submitMomDraft } from './actions'
import { CheckCircle2, UploadCloud, FileText, AlertCircle, Loader2, Info, X, Plus, Trash2 } from 'lucide-react'

export default function NewMomForm({ userTier, projects }: { userTier: string, projects: any[] }) {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // STEP 1: Project Form
  const { register: regProject, handleSubmit: handleProjectSubmit, watch: watchProject, control: controlProject, setValue: setProjectValue, formState: { errors: projErrors } } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      projectId: '',
      projectName: '',
      customerName: '',
      dasarPenunjukan: [''],
      linkTomps: { po: '', url: '', parent_id: '' },
      masaLayanan: { periode_start: '', periode_end: '', tanggal_rfs: '' },
      scopeOfWork: [{ item_layanan: '', spesifikasi: '', qty_volume: '', qty_satuan: '', periode_waktu: '', periode_satuan: '' }],
      dokumenProject: [{ mitra: '', p8: '', kl: '', ao_sid: '', tanggal_dok: '', target_selesai: '' }],
      picProject: [{ name: '' }]
    }
  })
  
  const selectedProjectId = watchProject('projectId')
  
  // Field Arrays
  const { fields: dpFields, append: appendDp, remove: removeDp } = useFieldArray({ control: controlProject, name: "dasarPenunjukan" as never })
  const { fields: sowFields, append: appendSow, remove: removeSow } = useFieldArray({ control: controlProject, name: "scopeOfWork" })
  const { fields: docFields, append: appendDoc, remove: removeDoc } = useFieldArray({ control: controlProject, name: "dokumenProject" })
  const { fields: picFields, append: appendPic, remove: removePic } = useFieldArray({ control: controlProject, name: "picProject" })

  // STEP 2: Meta Form
  const { register: regMeta, handleSubmit: handleMetaSubmit, watch: watchMeta, formState: { errors: metaErrors } } = useForm({
    resolver: zodResolver(metadataSchema)
  })
  const selectedMeetingTypes = watchMeta('type_of_meeting') || [];
  const showOtherInput = selectedMeetingTypes.includes('Other');

  // STEP 3: Content Form
  const { register: regContent, handleSubmit: handleContentSubmit, setValue: setContentValue, watch: watchContent, formState: { errors: contentErrors } } = useForm({
    resolver: zodResolver(contentSchema)
  })
  const contentFiles = (watchContent('contentFiles') || []) as File[]

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (!newFiles.length) return;
    const MAX_SIZE = 20 * 1024 * 1024;
    const oversizedFiles = newFiles.filter(f => f.size > MAX_SIZE);
    if (oversizedFiles.length > 0) {
      alert(`Gagal mengunggah: File melebihi batas 20MB.`);
      e.target.value = '';
      return;
    }
    const existingFileNames = new Set(contentFiles.map(f => f.name));
    const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));
    if (contentFiles.length + uniqueNewFiles.length > 5) {
      alert("Maksimal 5 file.");
      e.target.value = '';
      return;
    }
    setContentValue('contentFiles', [...contentFiles, ...uniqueNewFiles], { shouldValidate: true });
    e.target.value = '';
  }

  const removeFile = (index: number) => {
    setContentValue('contentFiles', contentFiles.filter((_, i) => i !== index), { shouldValidate: true });
  }

  // Handlers
  const onProjectNext = () => setStep(2)
  const onMetaNext = () => setStep(3)

  const onFinalSubmit = async (data: any) => {
    setIsSubmitting(true)
    setError(null)
    try {
      const projData = watchProject()
      const metaData = watchMeta()
      
      const submitData = new FormData()
      
      // Add Project
      submitData.append('projectId', projData.projectId || '')
      if (projData.projectId === 'new') {
        submitData.append('projectData', JSON.stringify(projData))
      }
      
      // Add Meta
      submitData.append('agenda', metaData.agenda)
      submitData.append('meeting_date', metaData.meeting_date)
      submitData.append('time', metaData.time)
      submitData.append('note_taker', metaData.note_taker)
      submitData.append('location', metaData.location)
      submitData.append('attendees', metaData.attendees)
      submitData.append('facilitator', metaData.facilitator)
      
      let finalTypes = [...(metaData.type_of_meeting as string[])]
      if (finalTypes.includes('Other')) {
        finalTypes = finalTypes.filter(t => t !== 'Other')
        if (metaData.other_meeting_type) finalTypes.push(metaData.other_meeting_type)
      }
      submitData.append('type_of_meeting', JSON.stringify(finalTypes))
      
      // Add Files
      contentFiles.forEach(file => submitData.append('contentFiles', file))

      const result = await submitMomDraft(submitData)
      if (result.success) {
        router.push(`/mom/${result.id}`)
      } else {
        setError(result.error || 'Failed to submit form')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleProjectSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value
    setProjectValue('projectId', val)
    if (val && val !== 'new') {
      const selectedProj = projects.find(p => p.id === val)
      if (selectedProj) {
        setProjectValue('projectName', selectedProj.project_name || '')
        setProjectValue('customerName', selectedProj.customer_name || '')
        setProjectValue('dasarPenunjukan', selectedProj.dasar_penunjukan || [''])
        setProjectValue('linkTomps', selectedProj.link_tomps || { po: '', url: '', parent_id: '' })
        setProjectValue('masaLayanan', selectedProj.masa_layanan || { periode_start: '', periode_end: '', tanggal_rfs: '' })
        
        const sow = selectedProj.scope_of_work
        setProjectValue('scopeOfWork', sow && sow.length > 0 ? sow : [{ item_layanan: '', spesifikasi: '', qty_volume: '', qty_satuan: '', periode_waktu: '', periode_satuan: '' }])
        
        const pic = selectedProj.pic_project
        setProjectValue('picProject', pic && pic.length > 0 ? pic : [{ name: '' }])
      }
    } else if (val === 'new') {
        setProjectValue('projectName', '')
        setProjectValue('customerName', '')
        setProjectValue('dasarPenunjukan', [''])
        setProjectValue('linkTomps', { po: '', url: '', parent_id: '' })
        setProjectValue('masaLayanan', { periode_start: '', periode_end: '', tanggal_rfs: '' })
        setProjectValue('scopeOfWork', [{ item_layanan: '', spesifikasi: '', qty_volume: '', qty_satuan: '', periode_waktu: '', periode_satuan: '' }])
        setProjectValue('picProject', [{ name: '' }])
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Stepper */}
      <div className="mb-12 px-16 mx-auto">
        <div className="relative">
          <div className="absolute left-0 top-5 -translate-y-1/2 w-full h-1.5 bg-slate-200 rounded-full z-0"></div>
          <div className="absolute left-0 top-5 -translate-y-1/2 h-1.5 bg-telkom-red rounded-full z-0 transition-all duration-300" style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
          <div className="flex items-center justify-between relative z-10">
            {[1, 2, 3].map((s) => (
              <div key={s} className="relative flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ring-4 ring-white ${step >= s ? 'bg-telkom-red text-white shadow-lg' : 'bg-slate-300 text-slate-600'}`}>
                  {step > s ? <CheckCircle2 size={20} /> : s}
                </div>
                <span className={`absolute top-12 mt-1 text-xs font-semibold tracking-wide whitespace-nowrap ${step >= s ? 'text-slate-900' : 'text-slate-400'}`}>
                  {s === 1 ? 'Project' : s === 2 ? 'Meeting' : 'Transcript'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-3 border border-red-100">
          <AlertCircle size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 mb-20">
        
        {/* STEP 1: PROJECT */}
        {step === 1 && (
          <form onSubmit={handleProjectSubmit(onProjectNext)} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Project Selection</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Project</label>
              <select {...regProject('projectId')} onChange={handleProjectSelect} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red">
                <option value="">-- Choose a Project --</option>
                <option value="new">+ Create New Project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.project_name}</option>)}
              </select>
            </div>

            {selectedProjectId && (
              <div className="space-y-6 border-t pt-6 mt-6">
                <h3 className="font-semibold text-lg">{selectedProjectId === 'new' ? 'New Project Template' : 'Project Template Details (Editable)'}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Project Name</label>
                    <input {...regProject('projectName')} className="w-full px-3 py-2 border rounded-md" />
                    {projErrors.projectName && <p className="text-red-500 text-xs mt-1">{projErrors.projectName.message as string}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Customer Name</label>
                    <input {...regProject('customerName')} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>

                {/* Dasar Penunjukan */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Dasar Penunjukan</h4>
                  {dpFields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2 mb-2">
                      <input {...regProject(`dasarPenunjukan.${idx}`)} className="flex-1 px-3 py-1.5 border rounded-md text-sm" placeholder="e.g. Nota Dinas DIREKTUR..." />
                      <button type="button" onClick={() => removeDp(idx)} className="text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendDp('')} className="text-sm text-telkom-red flex items-center mt-2"><Plus size={16}/> Add Dasar Penunjukan</button>
                </div>

                {/* Link Tomps */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Link Tomps</h4>
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <label className="block text-xs font-medium mb-1">Parent ID</label>
                      <input {...regProject('linkTomps.parent_id')} className="w-full px-3 py-1.5 border rounded-md text-sm" placeholder="e.g. P12345" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">PO</label>
                      <input {...regProject('linkTomps.po')} className="w-full px-3 py-1.5 border rounded-md text-sm" placeholder="e.g. PO-9876" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">URL</label>
                    <input {...regProject('linkTomps.url')} className="w-full px-3 py-1.5 border rounded-md text-sm" placeholder="https://..." />
                  </div>
                </div>

                {/* Masa Layanan */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">Masa Layanan dan RFS</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium mb-1">Mulai Layanan</label>
                      <input {...regProject('masaLayanan.periode_start')} type="date" className="w-full px-3 py-1.5 border rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Berakhir Layanan</label>
                      <input {...regProject('masaLayanan.periode_end')} type="date" className="w-full px-3 py-1.5 border rounded-md text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">Tanggal RFS</label>
                      <input {...regProject('masaLayanan.tanggal_rfs')} type="date" className="w-full px-3 py-1.5 border rounded-md text-sm" />
                    </div>
                  </div>
                </div>

                {/* Scope of Work */}
                <div className="bg-gray-50 p-4 rounded-lg overflow-x-auto">
                  <h4 className="font-medium mb-2 text-sm">Scope of Work</h4>
                  {sowFields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2 mb-2 min-w-max">
                      <input {...regProject(`scopeOfWork.${idx}.item_layanan`)} placeholder="Item" className="w-32 px-2 py-1 border rounded text-sm" />
                      <input {...regProject(`scopeOfWork.${idx}.spesifikasi`)} placeholder="Spesifikasi" className="w-48 px-2 py-1 border rounded text-sm" />
                      <input {...regProject(`scopeOfWork.${idx}.qty_volume`)} placeholder="Vol" className="w-16 px-2 py-1 border rounded text-sm" />
                      <input {...regProject(`scopeOfWork.${idx}.qty_satuan`)} placeholder="Sat" className="w-16 px-2 py-1 border rounded text-sm" />
                      <input {...regProject(`scopeOfWork.${idx}.periode_waktu`)} placeholder="Per" className="w-16 px-2 py-1 border rounded text-sm" />
                      <input {...regProject(`scopeOfWork.${idx}.periode_satuan`)} placeholder="Sat" className="w-16 px-2 py-1 border rounded text-sm" />
                      <button type="button" onClick={() => removeSow(idx)} className="text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendSow({item_layanan:'',spesifikasi:'',qty_volume:'',qty_satuan:'',periode_waktu:'',periode_satuan:''})} className="text-sm text-telkom-red flex items-center mt-2"><Plus size={16}/> Add Scope</button>
                </div>

                {/* PIC Project */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-sm">PIC Project</h4>
                  {picFields.map((field, idx) => (
                    <div key={field.id} className="flex gap-2 mb-2">
                      <input {...regProject(`picProject.${idx}.name`)} className="flex-1 px-3 py-1.5 border rounded-md text-sm" placeholder="e.g. John Doe - Manager" />
                      <button type="button" onClick={() => removePic(idx)} className="text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => appendPic({ name: '' })} className="text-sm text-telkom-red flex items-center mt-2"><Plus size={16}/> Add PIC</button>
                </div>
              </div>
            )}

            <div className="pt-6 flex justify-end">
              <button type="submit" disabled={!selectedProjectId} className="bg-telkom-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900 disabled:opacity-50">Next Step</button>
            </div>
          </form>
        )}

        {/* STEP 2: METADATA */}
        {step === 2 && (
          <form onSubmit={handleMetaSubmit(onMetaNext)} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Meeting Details</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Agenda / Topic</label>
                <input {...regMeta('agenda')} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-telkom-red" />
                {metaErrors.agenda && <p className="text-red-500 text-xs mt-1">{metaErrors.agenda.message as string}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" {...regMeta('meeting_date')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-telkom-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" {...regMeta('time')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-telkom-red" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location / Venue</label>
                  <input {...regMeta('location')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-telkom-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Note Taker (Nama Pembuat MoM)</label>
                  <input {...regMeta('note_taker')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-telkom-red" placeholder="e.g. John Doe" />
                  {metaErrors.note_taker && <p className="text-red-500 text-xs mt-1">{metaErrors.note_taker.message as string}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Facilitator</label>
                  <input {...regMeta('facilitator')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-telkom-red" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Attendees (Comma separated)</label>
                  <input {...regMeta('attendees')} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-telkom-red" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type of Meeting</label>
                <div className="grid grid-cols-3 gap-2">
                  {["Review", "Briefing", "Coordination", "Decision Making", "Other"].map((type) => (
                    <label key={type} className="flex items-center gap-2 text-sm p-2 border rounded-lg cursor-pointer">
                      <input type="checkbox" value={type} {...regMeta('type_of_meeting')} className="text-telkom-red focus:ring-telkom-red rounded" /> {type}
                    </label>
                  ))}
                </div>
                {showOtherInput && (
                  <input {...regMeta('other_meeting_type')} className="mt-2 w-full px-4 py-2 border rounded-lg" placeholder="Specify..." />
                )}
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="text-gray-600 font-medium px-4 py-2">Back</button>
              <button type="submit" className="bg-telkom-navy text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-900">Next Step</button>
            </div>
          </form>
        )}

        {/* STEP 3: TRANSCRIPT */}
        {step === 3 && (
          <form onSubmit={handleContentSubmit(onFinalSubmit)} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Upload Transcript</h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 relative">
              <input type="file" multiple accept=".txt,.docx,.mp3,.wav,.m4a" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} />
              <UploadCloud className="mx-auto text-gray-400 mb-2" size={36} />
              <p className="text-sm font-medium text-gray-900">Click to upload or drag and drop</p>
            </div>
            
            {contentFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                {contentFiles.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-gray-50 border rounded-lg">
                    <span className="text-xs font-semibold truncate">{f.name}</span>
                    <button type="button" onClick={() => removeFile(i)} className="text-gray-400 hover:text-red-500"><X size={14}/></button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-6 flex justify-between">
              <button type="button" onClick={() => setStep(2)} className="text-gray-600 font-medium px-4 py-2">Back</button>
              <button type="submit" disabled={isSubmitting} className="bg-telkom-red text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 flex items-center gap-2">
                {isSubmitting && <Loader2 size={18} className="animate-spin" />}
                {isSubmitting ? 'Generating...' : 'Generate MoM'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
