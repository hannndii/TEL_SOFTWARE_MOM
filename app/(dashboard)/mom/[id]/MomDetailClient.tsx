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
  const [editedNoteTaker, setEditedNoteTaker] = useState(mom.note_taker || '')
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
          if (!res.ok) throw new Error(data.error || 'Failed to generate MoM')
          router.refresh()
          setIsProcessing(false)
        } catch (err: any) {
          setError(err.message)
          setIsProcessing(false)
        }
      }
      processMom()
    } else {
      setEditedTopic(mom.topic || '')
      setEditedFacilitator(mom.facilitator || '')
      setEditedNoteTaker(mom.note_taker || '')
      setEditedContent(mom.content_json || {})
      setEvidenceUrl(mom.photo_evidence_url)
    }
  }, [mom, router])

  const handleEvidenceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // simplified for brevity...
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
          note_taker: editedNoteTaker,
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

  // --- Helpers for Deep Updates ---
  const updateArray = (key: string, index: number, field: string | null, value: string) => {
    const arr = [...(editedContent[key] || [])]
    if (field) {
      if (!arr[index]) arr[index] = {}
      arr[index][field] = value
    } else {
      arr[index] = value
    }
    setEditedContent({ ...editedContent, [key]: arr })
  }

  const addArrayItem = (key: string, defaultObj: any) => {
    setEditedContent({ ...editedContent, [key]: [...(editedContent[key] || []), defaultObj] })
  }

  const removeArrayItem = (key: string, index: number) => {
    const arr = [...(editedContent[key] || [])]
    arr.splice(index, 1)
    setEditedContent({ ...editedContent, [key]: arr })
  }

  const updateObject = (key: string, field: string, value: string) => {
    setEditedContent({ ...editedContent, [key]: { ...(editedContent[key] || {}), [field]: value } })
  }

  if (isProcessing) {
    return <div className="text-center py-20">Generating...</div>
  }

  const meetingDateObj = new Date(mom.meeting_date)
  const formattedDate = meetingDateObj.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
  const types = ["Review", "Briefing", "Coordination", "Decision Making", "Other"]
  const actContent = isEditing ? editedContent : mom.content_json;

  return (
    <div className="max-w-5xl mx-auto mb-20">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Meeting Minutes</h1>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Batal</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-telkom-navy text-white rounded">Simpan</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 border rounded">Edit</button>
              <button onClick={exportToPDF} className="px-4 py-2 bg-telkom-navy text-white rounded">Export PDF</button>
            </>
          )}
        </div>
      </div>

      <div id="mom-document" className={`bg-white mx-auto shadow-xl p-10 text-sm font-sans ${isEditing ? 'border-2 border-blue-400' : ''}`} style={{ maxWidth: '210mm', minHeight: '297mm' }}>
        
        {/* HEADER */}
        <table className="w-full border-collapse border border-slate-300 mb-8">
          <tbody>
            <tr>
              <td rowSpan={4} className="border border-slate-300 w-1/4 p-4 text-center align-middle">
                <img src="/telkom-logo.svg" alt="Telkom" className="w-24 mx-auto" />
              </td>
              <td colSpan={3} className="border border-slate-300 p-2 text-center font-bold text-lg uppercase">MINUTE OF MEETING</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium w-32">Date</td>
              <td colSpan={2} className="border border-slate-300 p-2">{formattedDate}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium">Time</td>
              <td colSpan={2} className="border border-slate-300 p-2">
                {isEditing ? <input value={actContent.time} onChange={e => setEditedContent({...actContent, time: e.target.value})} className="border-b outline-none w-full"/> : actContent.time}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium">Venue</td>
              <td colSpan={2} className="border border-slate-300 p-2">
                {isEditing ? <input value={actContent.location} onChange={e => setEditedContent({...actContent, location: e.target.value})} className="border-b outline-none w-full"/> : actContent.location}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium">Meeting Called by</td>
              <td className="border border-slate-300 p-2">GSPO - SDA</td>
              <td className="border border-slate-300 p-2 font-medium">Note Taker</td>
              <td className="border border-slate-300 p-2">
                {isEditing ? <input value={editedNoteTaker} onChange={e => setEditedNoteTaker(e.target.value)} className="border-b outline-none w-full"/> : editedNoteTaker || '-'}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium">Facilitator</td>
              <td colSpan={3} className="border border-slate-300 p-2">
                {isEditing ? <input value={editedFacilitator} onChange={e => setEditedFacilitator(e.target.value)} className="border-b outline-none w-full"/> : editedFacilitator || '-'}
              </td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium">Attendees</td>
              <td colSpan={3} className="border border-slate-300 p-2">{mom.participants?.join(', ')}</td>
            </tr>
            <tr>
              <td className="border border-slate-300 p-2 font-medium">AGENDA</td>
              <td colSpan={3} className="border border-slate-300 p-2">
                {isEditing ? <input value={editedTopic} onChange={e => setEditedTopic(e.target.value)} className="border-b outline-none w-full"/> : editedTopic || '-'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 1. Dasar Penunjukan */}
        <div className="mb-4">
          <p className="font-bold">1. Dasar Penunjukan:</p>
          <ol className="list-[lower-alpha] pl-8">
            {(actContent.dasar_penunjukan || []).map((dp: string, i: number) => (
              <li key={i}>
                {isEditing ? <textarea value={dp} onChange={e => updateArray('dasar_penunjukan', i, null, e.target.value)} className="w-full border-b outline-none min-h-[30px]"/> : dp}
              </li>
            ))}
          </ol>
        </div>

        {/* 2. Link Tomps */}
        <div className="mb-4">
          <p className="font-bold">2. Link Tomps:</p>
          <p>Parent ID: {isEditing ? <input value={actContent.link_tomps?.parent_id} onChange={e => updateObject('link_tomps', 'parent_id', e.target.value)} className="border-b outline-none"/> : actContent.link_tomps?.parent_id}</p>
          <table className="w-full border-collapse border border-slate-300 mt-2">
            <thead>
              <tr className="bg-gray-100"><th className="border p-2">PO</th><th className="border p-2">URL</th><th className="border p-2">Nama Project</th><th className="border p-2">Nama Customer</th></tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2">{isEditing ? <input value={actContent.link_tomps?.po} onChange={e => updateObject('link_tomps', 'po', e.target.value)} className="w-full outline-none"/> : actContent.link_tomps?.po}</td>
                <td className="border p-2">{isEditing ? <input value={actContent.link_tomps?.url} onChange={e => updateObject('link_tomps', 'url', e.target.value)} className="w-full outline-none"/> : actContent.link_tomps?.url}</td>
                <td className="border p-2">{isEditing ? <input value={actContent.project_name} onChange={e => setEditedContent({...actContent, project_name: e.target.value})} className="w-full outline-none"/> : actContent.project_name}</td>
                <td className="border p-2">{isEditing ? <input value={actContent.customer_name} onChange={e => setEditedContent({...actContent, customer_name: e.target.value})} className="w-full outline-none"/> : actContent.customer_name}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 3. Masa Layanan */}
        <div className="mb-4">
          <p className="font-bold">3. Masa Layanan dan Ready For Service (RFS):</p>
          <ul className="list-[lower-alpha] pl-8">
            <li>Periode Layanan: {isEditing ? <input value={actContent.masa_layanan?.periode} onChange={e => updateObject('masa_layanan', 'periode', e.target.value)} className="border-b outline-none"/> : actContent.masa_layanan?.periode}</li>
            <li>Tanggal RFS: {isEditing ? <input value={actContent.masa_layanan?.tanggal_rfs} onChange={e => updateObject('masa_layanan', 'tanggal_rfs', e.target.value)} className="border-b outline-none"/> : actContent.masa_layanan?.tanggal_rfs}</li>
          </ul>
        </div>

        {/* 4. Scope of Work */}
        <div className="mb-4">
          <p className="font-bold">4. Scope of Work:</p>
          <table className="w-full border-collapse border border-slate-300 mt-2 text-center text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border p-2">NO</th><th rowSpan={2} className="border p-2">ITEM LAYANAN</th><th rowSpan={2} className="border p-2">SPESIFIKASI</th>
                <th colSpan={2} className="border p-2">QTY</th><th colSpan={2} className="border p-2">PERIODE</th>
              </tr>
              <tr className="bg-gray-100">
                <th className="border p-1">VOLUME</th><th className="border p-1">SATUAN</th><th className="border p-1">PERIODE</th><th className="border p-1">SATUAN</th>
              </tr>
            </thead>
            <tbody>
              {(actContent.scope_of_work || []).map((sow: any, i: number) => (
                <tr key={i}>
                  <td className="border p-2">{i+1}</td>
                  <td className="border p-2">{isEditing ? <input value={sow.item_layanan} onChange={e => updateArray('scope_of_work', i, 'item_layanan', e.target.value)} className="w-full text-center outline-none"/> : sow.item_layanan}</td>
                  <td className="border p-2">{isEditing ? <input value={sow.spesifikasi} onChange={e => updateArray('scope_of_work', i, 'spesifikasi', e.target.value)} className="w-full text-center outline-none"/> : sow.spesifikasi}</td>
                  <td className="border p-2">{isEditing ? <input value={sow.qty_volume} onChange={e => updateArray('scope_of_work', i, 'qty_volume', e.target.value)} className="w-full text-center outline-none"/> : sow.qty_volume}</td>
                  <td className="border p-2">{isEditing ? <input value={sow.qty_satuan} onChange={e => updateArray('scope_of_work', i, 'qty_satuan', e.target.value)} className="w-full text-center outline-none"/> : sow.qty_satuan}</td>
                  <td className="border p-2">{isEditing ? <input value={sow.periode_waktu} onChange={e => updateArray('scope_of_work', i, 'periode_waktu', e.target.value)} className="w-full text-center outline-none"/> : sow.periode_waktu}</td>
                  <td className="border p-2">{isEditing ? <input value={sow.periode_satuan} onChange={e => updateArray('scope_of_work', i, 'periode_satuan', e.target.value)} className="w-full text-center outline-none"/> : sow.periode_satuan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 5. Issue */}
        <div className="mb-4">
          <p className="font-bold">5. Issue (*hasil generate dari transcript meeting):</p>
          <ol className="list-[lower-alpha] pl-8">
            {(actContent.issue || []).map((iss: string, i: number) => (
              <li key={i}>{isEditing ? <textarea value={iss} onChange={e => updateArray('issue', i, null, e.target.value)} className="w-full border-b outline-none"/> : iss}</li>
            ))}
          </ol>
        </div>

        {/* 6. Action Plan */}
        <div className="mb-4">
          <p className="font-bold">6. Action Plan (*hasil generate dari transcript meeting):</p>
          <ol className="list-[lower-alpha] pl-8">
            {(actContent.action_plan || []).map((ap: any, i: number) => (
              <li key={i}>{isEditing ? <textarea value={`${ap.pic} akan memproses ${ap.action} -> Due Date: ${ap.due_date}`} onChange={e => updateArray('action_plan', i, 'action', e.target.value)} className="w-full border-b outline-none"/> : `${ap.pic} akan memproses ${ap.action} -> Due Date: ${ap.due_date}`}</li>
            ))}
          </ol>
        </div>

        {/* 8. Kesepakatan */}
        <div className="mb-4">
          <p className="font-bold">8. Kesepakatan (*hasil generate dari transcript meeting):</p>
          <ol className="list-[lower-alpha] pl-8">
            <li>Dokumen Minutes of Meeting ini bukan pengganti dokumen P8 / Surat Penetapan Mitra Kerja/ Work Order/Surat Pesanan;</li>
            {(actContent.kesepakatan || []).map((ks: string, i: number) => (
              <li key={i}>{isEditing ? <textarea value={ks} onChange={e => updateArray('kesepakatan', i, null, e.target.value)} className="w-full border-b outline-none"/> : ks}</li>
            ))}
          </ol>
        </div>
        
        {/* TTD Section */}
        <div className="mt-20">
          <div className="text-center float-right">
            <p>Jakarta, {formattedDate}</p>
            <p>Mengetahui,</p>
            <div className="mt-20 border-b border-black w-48 mx-auto"></div>
            <p>{editedNoteTaker || '....................'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
