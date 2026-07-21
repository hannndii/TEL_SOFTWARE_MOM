'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, AlertCircle, Printer, CheckCircle2, UploadCloud, Edit2, Save, X, Plus, Trash2, ChevronDown, Download, FileText as FileTextIcon, Camera } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function MomDetailClient({ mom }: { mom: any }) {
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(mom.status === 'draft')
  const [error, setError] = useState<string | null>(null)
  
  // Evidence State
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false)
  const [evidenceUrl, setEvidenceUrl] = useState(mom.photo_evidence_url)

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedTopic, setEditedTopic] = useState(mom.topic || '')
  const [editedFacilitator, setEditedFacilitator] = useState(mom.facilitator || '')
  const [editedContent, setEditedContent] = useState<any>(mom.content_json || {})
  const [isExportOpen, setIsExportOpen] = useState(false)

  const exportToPDF = async () => {
    window.print();
    setIsExportOpen(false);
  }

  const exportToWord = () => {
    const element = document.getElementById('mom-document');
    if (!element) return;
    
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const html = header + element.innerHTML + footer;
    
    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MoM_${mom.topic?.substring(0,20) || 'Document'}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsExportOpen(false);
  }

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
    } else {
      // Sync state if mom data changes from parent
      setEditedTopic(mom.topic || '')
      setEditedFacilitator(mom.facilitator || '')
      setEditedContent(mom.content_json || {})
      setEvidenceUrl(mom.photo_evidence_url)
    }
  }, [mom, router])

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setIsUploadingEvidence(true)
    try {
      const supabase = createClient()
      const evidenceExt = file.name.split('.').pop()
      const evidenceFileName = `${mom.user_id}/${Date.now()}_evidence.${evidenceExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('mom_evidences')
        .upload(evidenceFileName, file)

      if (uploadError) throw new Error("Failed to upload image")

      const { data: publicUrlData } = supabase.storage
        .from('mom_evidences')
        .getPublicUrl(evidenceFileName)

      const newUrl = publicUrlData.publicUrl

      const { error: dbError } = await supabase
        .from('meeting_mom')
        .update({ photo_evidence_url: newUrl })
        .eq('id', mom.id)

      if (dbError) throw new Error("Failed to update database")

      setEvidenceUrl(newUrl)
    } catch (err: any) {
      alert(err.message || "An error occurred uploading evidence")
    } finally {
      setIsUploadingEvidence(false)
    }
  }

  const handleSaveEdit = async () => {
    setIsSaving(true)
    try {
      const supabase = createClient()
      const { error: dbError } = await supabase
        .from('meeting_mom')
        .update({ 
          topic: editedTopic,
          facilitator: editedFacilitator,
          content_json: editedContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', mom.id)

      if (dbError) throw new Error("Failed to save changes")
      
      setIsEditing(false)
      router.refresh()
    } catch (err: any) {
      alert(err.message || "An error occurred while saving edits")
    } finally {
      setIsSaving(false)
    }
  }

  // --- Handlers for deep state updates in Edit Mode ---
  const handleArrayChange = (key: string, index: number, value: string) => {
    const newArray = [...(editedContent[key] || [])]
    newArray[index] = value
    setEditedContent({ ...editedContent, [key]: newArray })
  }
  
  const addArrayItem = (key: string) => {
    const newArray = [...(editedContent[key] || []), '']
    setEditedContent({ ...editedContent, [key]: newArray })
  }

  const removeArrayItem = (key: string, index: number) => {
    const newArray = [...(editedContent[key] || [])]
    newArray.splice(index, 1)
    setEditedContent({ ...editedContent, [key]: newArray })
  }

  // Meeting Type
  const handleTypeChange = (type: string, isChecked: boolean) => {
    const currentTypes = Array.isArray(editedContent?.type_of_meeting) ? editedContent.type_of_meeting : [];
    let newTypes;
    if (isChecked) {
      newTypes = [...currentTypes, type];
    } else {
      newTypes = currentTypes.filter((t: string) => t !== type);
    }
    setEditedContent({ ...editedContent, type_of_meeting: newTypes });
  }

  // Action Plan
  const handleActionPlanChange = (index: number, field: 'pic' | 'action', value: string) => {
    const newPlan = [...(editedContent.action_plan || [])]
    if (!newPlan[index]) newPlan[index] = { pic: '', action: '' }
    newPlan[index][field] = value
    setEditedContent({ ...editedContent, action_plan: newPlan })
  }

  const addActionPlan = () => {
    const newPlan = [...(editedContent.action_plan || []), { pic: '', action: '' }]
    setEditedContent({ ...editedContent, action_plan: newPlan })
  }
  
  const removeActionPlan = (index: number) => {
    const newPlan = [...(editedContent.action_plan || [])]
    newPlan.splice(index, 1)
    setEditedContent({ ...editedContent, action_plan: newPlan })
  }

  // Notes
  const handleNoteChange = (index: number, field: 'nama_pihak' | 'informasi', value: string, infoIndex?: number) => {
    const newNotes = [...(editedContent.notes || [])]
    if (!newNotes[index]) newNotes[index] = { nama_pihak: '', informasi: [] }
    
    if (field === 'nama_pihak') {
      newNotes[index].nama_pihak = value
    } else if (field === 'informasi' && typeof infoIndex === 'number') {
      const newInfos = [...(newNotes[index].informasi || [])]
      newInfos[infoIndex] = value
      newNotes[index].informasi = newInfos
    }
    setEditedContent({ ...editedContent, notes: newNotes })
  }
  
  const addNoteInfo = (noteIndex: number) => {
    const newNotes = [...(editedContent.notes || [])]
    if (!newNotes[noteIndex].informasi) newNotes[noteIndex].informasi = []
    newNotes[noteIndex].informasi.push('')
    setEditedContent({ ...editedContent, notes: newNotes })
  }
  
  const removeNoteInfo = (noteIndex: number, infoIndex: number) => {
    const newNotes = [...(editedContent.notes || [])]
    newNotes[noteIndex].informasi.splice(infoIndex, 1)
    setEditedContent({ ...editedContent, notes: newNotes })
  }
  
  const addNotePerson = () => {
    const newNotes = [...(editedContent.notes || []), { nama_pihak: '', informasi: [''] }]
    setEditedContent({ ...editedContent, notes: newNotes })
  }
  
  const removeNotePerson = (noteIndex: number) => {
    const newNotes = [...(editedContent.notes || [])]
    newNotes.splice(noteIndex, 1)
    setEditedContent({ ...editedContent, notes: newNotes })
  }

  // Informasi Tambahan
  const handleInfoChange = (field: string, value: string) => {
    setEditedContent({
      ...editedContent,
      informasi_tambahan: {
        ...(editedContent.informasi_tambahan || {}),
        [field]: value
      }
    })
  }

  // --------------------------------------------------

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-32 max-w-lg mx-auto text-center space-y-6">
        <div className="relative">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center animate-pulse shadow-inner border border-red-100">
            <Loader2 className="text-telkom-red animate-spin" size={48} />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Generating MoM Document...</h2>
          <p className="text-gray-600 mt-3 font-medium text-lg leading-relaxed">The system is summarizing the transcript, extracting key points, and generating the Action Plan.</p>
          <div className="mt-8">
            <span className="bg-slate-100 text-slate-600 px-4 py-2 rounded-md text-sm font-medium border border-slate-200 shadow-sm inline-block">
              Estimated completion time: 30 - 60 seconds
            </span>
          </div>
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
  
  // Format date correctly
  const meetingDateObj = new Date(mom.meeting_date)
  const formattedDate = meetingDateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  
  // Parse checkboxes
  const types = ["Review", "Briefing", "Coordination", "Decision Making", "Other"]
  const selectedTypes = Array.isArray(editedContent?.type_of_meeting) 
    ? editedContent.type_of_meeting 
    : [editedContent?.type_of_meeting].filter(Boolean)

  const actContent = isEditing ? editedContent : mom.content_json;
  const actTopic = isEditing ? editedTopic : mom.topic;

  return (
    <div className="max-w-5xl mx-auto mb-20">
      
      {/* ACTION BAR (Hidden in print) */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Minutes</h1>
          <p className="text-sm text-gray-500">Document is ready to be exported.</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                onClick={() => {
                  setIsEditing(false)
                  setEditedContent(mom.content_json)
                  setEditedTopic(mom.topic)
                }} 
                className="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm"
                disabled={isSaving}
              >
                Batal
              </button>
              <button 
                onClick={handleSaveEdit} 
                className="bg-telkom-navy text-white px-5 py-2 rounded-md font-medium hover:bg-blue-900 transition-colors shadow-sm flex items-center gap-2"
                disabled={isSaving}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                Simpan Perubahan
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => setIsEditing(true)} 
                className="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Edit Dokumen
              </button>
              <div className="relative">
                <button 
                  onClick={() => setIsExportOpen(!isExportOpen)} 
                  className="bg-telkom-navy text-white px-5 py-2 rounded-md font-medium flex items-center gap-2 hover:bg-blue-900 transition-colors shadow-sm"
                >
                  Export
                  <ChevronDown size={16} className={`transition-transform duration-200 ${isExportOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <button onClick={exportToPDF} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 border-b border-slate-100 transition-colors">
                      <FileTextIcon size={18} className="text-red-500" /> Export as PDF
                    </button>
                    <button onClick={() => {
                      alert("NOTE: Microsoft Word does not support modern web layouts (like flexbox). The exported file might not exactly match the preview. For a 100% accurate export, please use Export as PDF.");
                      exportToWord();
                    }} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors">
                      <FileTextIcon size={18} className="text-blue-600" /> Export as Word (.doc)
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* A4 DOCUMENT PAGE */}
      <div id="mom-document" className={`bg-white mx-auto shadow-2xl print:shadow-none print:m-0 print:p-0 ${isEditing ? 'border-2 border-blue-400 rounded-lg overflow-hidden' : 'rounded-sm border border-slate-200'}`} style={{ maxWidth: '210mm', minHeight: '297mm' }}>
        {isEditing && (
          <div className="absolute -top-3 left-4 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200 flex items-center gap-1">
            <Edit2 size={16} /> Edit Mode Active
          </div>
        )}
        
        <div className="p-10 text-sm text-black font-sans leading-relaxed">
          
          {/* HEADER TABLE */}
          <table className="w-full border-collapse border border-slate-300 mb-8">
            <tbody>
              <tr>
                <td rowSpan={4} className="border border-slate-300 w-1/4 p-4 text-center align-middle">
                  <img src="/telkom-logo.svg" alt="Telkom Indonesia" className="w-24 mx-auto" />
                </td>
                <td colSpan={3} className="border border-slate-300 p-2 text-center font-bold text-lg uppercase">
                  MINUTE OF MEETING
                </td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium w-32">Date</td>
                <td colSpan={2} className="border border-slate-300 p-2">{formattedDate}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">Time</td>
                <td colSpan={2} className="border border-slate-300 p-2">{actContent?.time || '-'}</td>
              </tr>
              <tr>
                <td className="border border-slate-300 p-2 font-medium">Venue</td>
                <td colSpan={2} className="border border-slate-300 p-2">{actContent?.location || '-'}</td>
              </tr>
              
              <tr>
                <td className="border border-slate-300 p-2 font-medium">Meeting Called by</td>
                <td className="border border-slate-300 p-2">Telkom SDA</td>
                <td className="border border-slate-300 p-2 font-medium">Note Taker</td>
                <td className="border border-slate-300 p-2">{mom.user?.user_metadata?.full_name || 'System User'}</td>
              </tr>
              
              <tr>
                <td className="border border-slate-300 p-2 font-medium">Type of meeting</td>
                <td colSpan={3} className={`border border-slate-300 p-2 ${isEditing ? 'bg-yellow-50' : ''}`}>
                  <div className="flex gap-6 flex-wrap">
                    {types.map(type => (
                      <label key={type} className={`flex items-center gap-1 ${isEditing ? 'cursor-pointer' : ''}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedTypes.includes(type)} 
                          readOnly={!isEditing} 
                          onChange={(e) => {
                            if (isEditing) {
                              handleTypeChange(type, e.target.checked)
                            }
                          }}
                          className="w-3 h-3 text-black border-gray-400 rounded-none focus:ring-0" 
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </td>
              </tr>

              <tr>
                <td className="border border-slate-300 p-2 font-medium">Facilitator</td>
                <td colSpan={3} className={`border border-slate-300 p-2 ${isEditing ? 'bg-yellow-50' : ''}`}>
                  {isEditing ? (
                    <input 
                      value={editedFacilitator} 
                      onChange={(e) => setEditedFacilitator(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-400 focus:border-telkom-red outline-none"
                    />
                  ) : mom.facilitator || '-'}
                </td>
              </tr>
              
              <tr>
                <td className="border border-slate-300 p-2 font-medium">Attendees</td>
                <td colSpan={3} className="border border-slate-300 p-2">{mom.participants?.join(', ') || '-'}</td>
              </tr>

              <tr>
                <td className="border border-slate-300 p-2 font-medium">AGENDA</td>
                <td colSpan={3} className={`border border-slate-300 p-2 ${isEditing ? 'bg-yellow-50' : ''}`}>
                  {isEditing ? (
                    <input 
                      value={editedTopic} 
                      onChange={(e) => setEditedTopic(e.target.value)}
                      className="w-full bg-transparent border-b border-gray-400 focus:border-telkom-red outline-none"
                    />
                  ) : actTopic || '-'}
                </td>
              </tr>
            </tbody>
          </table>

          {/* CONTENT SECTION */}
          <div className="space-y-6">
            
            {/* A. Dasar Pembahasan */}
            <div>
              <h3 className="font-bold mb-2">A. Dasar Pembahasan</h3>
              {isEditing ? (
                <div className="pl-4 space-y-2">
                  {actContent?.dasar_pembahasan?.map((item: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-1 font-bold">-</span>
                      <textarea 
                        value={item} 
                        onChange={(e) => handleArrayChange('dasar_pembahasan', i, e.target.value)}
                        className="w-full bg-yellow-50 border-b border-gray-300 focus:border-telkom-red outline-none min-h-[40px] resize-y p-1"
                      />
                      <button onClick={() => removeArrayItem('dasar_pembahasan', i)} className="text-red-500 mt-1"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button onClick={() => addArrayItem('dasar_pembahasan')} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-2">
                    <Plus size={14} /> Tambah Dasar Pembahasan
                  </button>
                </div>
              ) : (
                <ul className="list-disc pl-8 space-y-1">
                  {actContent?.dasar_pembahasan?.length > 0 ? (
                    actContent.dasar_pembahasan.map((item: string, i: number) => <li key={i}>{item}</li>)
                  ) : (
                    <li>-</li>
                  )}
                </ul>
              )}
            </div>

            {/* B. Note */}
            <div>
              <h3 className="font-bold mb-2">B. Note</h3>
              <p className="font-medium mb-2 pl-4">Topik: {actTopic}</p>
              
              {isEditing ? (
                <div className="pl-4 space-y-6">
                  {actContent?.notes?.map((note: any, i: number) => (
                    <div key={i} className="bg-yellow-50/50 p-2 border border-gray-200 rounded">
                      <div className="flex gap-2 items-center mb-2">
                        <span className="font-medium">{i + 1}.</span>
                        <input 
                          value={note.nama_pihak} 
                          onChange={(e) => handleNoteChange(i, 'nama_pihak', e.target.value)}
                          placeholder="Nama Pihak"
                          className="font-bold bg-white border border-gray-300 focus:border-telkom-red outline-none p-1 flex-1"
                        />
                        <button onClick={() => removeNotePerson(i)} className="text-red-500"><Trash2 size={16} /></button>
                      </div>
                      <div className="pl-6 space-y-2">
                        {note.informasi?.map((info: string, idx: number) => (
                          <div key={idx} className="flex gap-2 items-start">
                            <span className="mt-1 text-[10px]">⚫</span>
                            <textarea 
                              value={info} 
                              onChange={(e) => handleNoteChange(i, 'informasi', e.target.value, idx)}
                              className="w-full bg-white border border-gray-300 focus:border-telkom-red outline-none p-1 min-h-[40px] resize-y"
                            />
                            <button onClick={() => removeNoteInfo(i, idx)} className="text-red-500 mt-1"><X size={16} /></button>
                          </div>
                        ))}
                        <button onClick={() => addNoteInfo(i)} className="text-blue-600 text-xs font-bold flex items-center gap-1 mt-1">
                          <Plus size={14} /> Tambah Poin Informasi
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={addNotePerson} className="text-blue-600 text-sm font-bold flex items-center gap-1">
                    <Plus size={16} /> Tambah Pembicara (Note)
                  </button>
                </div>
              ) : (
                <div className="pl-4 space-y-4">
                  {actContent?.notes?.length > 0 ? (
                    actContent.notes.map((note: any, i: number) => (
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
              )}
            </div>

            {/* C. Action Plan */}
            <div>
              <h3 className="font-bold mb-2">C. Action Plan</h3>
              <table className="w-full border-collapse border border-slate-300 text-sm">
                <thead>
                  <tr>
                    <th className="border border-slate-300 p-2 text-left w-1/3">PIC</th>
                    <th className="border border-slate-300 p-2 text-left">Action</th>
                    {isEditing && <th className="border border-slate-300 p-2 w-10 text-center"></th>}
                  </tr>
                </thead>
                <tbody>
                  {actContent?.action_plan?.length > 0 ? (
                    actContent.action_plan.map((action: any, i: number) => (
                      <tr key={i} className={isEditing ? 'bg-yellow-50' : ''}>
                        <td className="border border-slate-300 p-2">
                          {isEditing ? (
                            <textarea 
                              value={action.pic} 
                              onChange={(e) => handleActionPlanChange(i, 'pic', e.target.value)}
                              className="w-full bg-transparent outline-none min-h-[40px] resize-none"
                            />
                          ) : action.pic}
                        </td>
                        <td className="border border-slate-300 p-2">
                          {isEditing ? (
                            <textarea 
                              value={action.action} 
                              onChange={(e) => handleActionPlanChange(i, 'action', e.target.value)}
                              className="w-full bg-transparent outline-none min-h-[40px] resize-none"
                            />
                          ) : action.action}
                        </td>
                        {isEditing && (
                          <td className="border border-slate-300 p-2 text-center align-middle">
                            <button onClick={() => removeActionPlan(i)} className="text-red-500"><Trash2 size={16}/></button>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="border border-slate-300 p-2">-</td>
                      <td className="border border-slate-300 p-2">-</td>
                      {isEditing && <td className="border border-slate-300 p-2"></td>}
                    </tr>
                  )}
                  {isEditing && (
                    <tr>
                      <td colSpan={3} className="border border-slate-300 p-2 text-center">
                        <button onClick={addActionPlan} className="text-blue-600 text-xs font-bold flex items-center justify-center gap-1 w-full">
                          <Plus size={14} /> Tambah Action Plan
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* D. Information Tambahan */}
            <div>
              <h3 className="font-bold mb-2">D. Information Tambahan</h3>
              {isEditing ? (
                <div className="pl-4 space-y-3 bg-yellow-50 p-4 border border-gray-200 rounded">
                  <div>
                    <label className="font-bold text-xs text-gray-500 uppercase">Keputusan Final:</label>
                    <textarea 
                      value={actContent?.informasi_tambahan?.keputusan_final || ''} 
                      onChange={(e) => handleInfoChange('keputusan_final', e.target.value)}
                      className="w-full border border-gray-300 focus:border-telkom-red outline-none p-2 mt-1 rounded min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-xs text-gray-500 uppercase">Kendala yang Disampaikan:</label>
                    <textarea 
                      value={actContent?.informasi_tambahan?.kendala || ''} 
                      onChange={(e) => handleInfoChange('kendala', e.target.value)}
                      className="w-full border border-gray-300 focus:border-telkom-red outline-none p-2 mt-1 rounded min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-xs text-gray-500 uppercase">Risiko yang Disebutkan:</label>
                    <textarea 
                      value={actContent?.informasi_tambahan?.risiko || ''} 
                      onChange={(e) => handleInfoChange('risiko', e.target.value)}
                      className="w-full border border-gray-300 focus:border-telkom-red outline-none p-2 mt-1 rounded min-h-[60px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-xs text-gray-500 uppercase">Hal yang Masih Menunggu Keputusan:</label>
                    <textarea 
                      value={actContent?.informasi_tambahan?.menunggu_keputusan || ''} 
                      onChange={(e) => handleInfoChange('menunggu_keputusan', e.target.value)}
                      className="w-full border border-gray-300 focus:border-telkom-red outline-none p-2 mt-1 rounded min-h-[60px]"
                    />
                  </div>
                </div>
              ) : (
                <ul className="list-disc pl-8 space-y-2">
                  <li><strong>Keputusan Final:</strong> {actContent?.informasi_tambahan?.keputusan_final || '-'}</li>
                  <li><strong>Kendala yang Disampaikan:</strong> {actContent?.informasi_tambahan?.kendala || '-'}</li>
                  <li><strong>Risiko yang Disebutkan:</strong> {actContent?.informasi_tambahan?.risiko || '-'}</li>
                  <li><strong>Hal yang Masih Menunggu Keputusan:</strong> {actContent?.informasi_tambahan?.menunggu_keputusan || '-'}</li>
                </ul>
              )}
            </div>

            {/* SIGNATURE SECTION */}
            <div className="pt-20 pb-10">
              <div className="flex justify-center text-center">
                <div>
                  <p>Jakarta, {formattedDate}</p>
                  <p className="font-bold">Mengetahui</p>
                  
                  <div className="mt-24">
                    <p className="font-bold">Via {actContent?.location?.includes('Zoom') ? 'Zoom Meeting' : actContent?.location}</p>
                    <p className="font-bold">(Foto kehadiran)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* EVIDENCE PHOTO */}
            {evidenceUrl ? (
              <div className="mt-10 break-before-page flex flex-col items-center">
                <p className="text-xs italic mb-4">*photo input as evidence</p>
                <img src={evidenceUrl} alt="Evidence" className="max-w-full h-auto max-h-[150mm] object-contain border border-slate-200 shadow-sm" />
                {isEditing && (
                  <div className="mt-4 print:hidden">
                    <input type="file" id="evidenceUploadEdit" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleEvidenceUpload} />
                    <label htmlFor="evidenceUploadEdit" className="cursor-pointer bg-slate-100 text-slate-700 px-4 py-2 rounded-md font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2 border border-slate-300 shadow-sm">
                      {isUploadingEvidence ? <Loader2 size={16} className="animate-spin" /> : <Edit2 size={16} />}
                      {isUploadingEvidence ? 'Replacing...' : 'Replace Photo'}
                    </label>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-10 pt-10 border-t border-dashed border-gray-300 print:hidden flex flex-col items-center">
                <p className="text-sm text-gray-500 mb-4 font-medium">Add an evidence photo (Optional)</p>
                <input type="file" id="evidenceUpload" className="hidden" accept="image/jpeg,image/png,image/jpg" onChange={handleEvidenceUpload} />
                <label htmlFor="evidenceUpload" className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                  {isUploadingEvidence ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
                  {isUploadingEvidence ? 'Uploading...' : 'Upload Photo'}
                </label>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
