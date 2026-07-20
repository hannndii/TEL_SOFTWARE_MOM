'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMomDraft(formData: FormData) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'User not authenticated' }
    }

    // Extract Metadata
    const topic = formData.get('topic') as string
    const meeting_date = formData.get('meeting_date') as string
    const location = formData.get('location') as string
    const attendees = formData.get('attendees') as string

    // Extract Files
    const contentFile = formData.get('contentFile') as File
    const evidenceFile = formData.get('evidenceFile') as File

    if (!topic || !meeting_date || !location || !attendees || !contentFile || !evidenceFile) {
      return { success: false, error: 'Missing required fields or files' }
    }

    // 1. Upload Evidence Photo to 'mom_evidences'
    const evidenceExt = evidenceFile.name.split('.').pop()
    const evidenceFileName = `${user.id}/${Date.now()}_evidence.${evidenceExt}`
    
    const { error: evidenceUploadError, data: evidenceData } = await supabase.storage
      .from('mom_evidences')
      .upload(evidenceFileName, evidenceFile, {
        upsert: false
      })

    if (evidenceUploadError) {
      console.error('Evidence upload error:', evidenceUploadError)
      return { success: false, error: 'Failed to upload evidence photo. Ensure mom_evidences bucket exists and accepts 3MB files.' }
    }

    // Since we don't have a content bucket yet, we'll store the content file text/audio later in Sprint 4.
    // For Sprint 3, we just save the evidence URL and metadata to DB as a draft.
    // (In Sprint 4 we will parse this file or upload it).
    
    // Get public URL for evidence
    const { data: publicUrlData } = supabase.storage
      .from('mom_evidences')
      .getPublicUrl(evidenceFileName)

    // 2. Insert to Database
    const { data: momData, error: dbError } = await supabase
      .from('meeting_mom')
      .insert({
        user_id: user.id,
        topic,
        meeting_date,
        location,
        attendees,
        evidence_url: publicUrlData.publicUrl,
        status: 'draft',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB Insert Error:', dbError)
      return { success: false, error: 'Failed to save MoM draft' }
    }

    revalidatePath('/')
    
    return { success: true, id: momData.id }
  } catch (err: any) {
    console.error('Server action error:', err)
    return { success: false, error: err.message || 'Internal Server Error' }
  }
}
