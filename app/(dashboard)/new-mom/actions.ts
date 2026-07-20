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
    const agenda = formData.get('agenda') as string
    const meeting_date = formData.get('meeting_date') as string
    const time = formData.get('time') as string
    const type_of_meeting = formData.get('type_of_meeting') as string
    const location = formData.get('location') as string
    const attendees = formData.get('attendees') as string

    // Extract Files
    const contentFile = formData.get('contentFile') as File
    const evidenceFile = formData.get('evidenceFile') as File

    if (!agenda || !meeting_date || !time || !type_of_meeting || !location || !attendees || !contentFile || !evidenceFile) {
      return { success: false, error: 'Missing required fields or files' }
    }

    // 1. Upload Evidence Photo to 'mom_evidences'
    const evidenceExt = evidenceFile.name.split('.').pop()
    const evidenceFileName = `${user.id}/${Date.now()}_evidence.${evidenceExt}`
    
    const { error: evidenceUploadError } = await supabase.storage
      .from('mom_evidences')
      .upload(evidenceFileName, evidenceFile, {
        upsert: false
      })

    if (evidenceUploadError) {
      console.error('Evidence upload error:', evidenceUploadError)
      return { success: false, error: 'Failed to upload evidence photo. Ensure mom_evidences bucket exists and accepts 3MB files.' }
    }

    const { data: publicUrlData } = supabase.storage
      .from('mom_evidences')
      .getPublicUrl(evidenceFileName)

    // 2. Upload Content File to 'mom_contents'
    const contentExt = contentFile.name.split('.').pop()
    const contentFileName = `${user.id}/${Date.now()}_content.${contentExt}`
    
    const { error: contentUploadError } = await supabase.storage
      .from('mom_contents')
      .upload(contentFileName, contentFile, {
        upsert: false
      })

    if (contentUploadError) {
      console.error('Content upload error:', contentUploadError)
      // We don't rollback evidence here to keep it simple, but in production we should.
      return { success: false, error: 'Failed to upload transcript/audio. Ensure mom_contents bucket exists and has correct policies.' }
    }
    
    // We only need the internal path for deletion and processing later, but we can store the path.
    const contentStoragePath = contentFileName;

    // 3. Insert to Database
    const { data: momData, error: dbError } = await supabase
      .from('meeting_mom')
      .insert({
        user_id: user.id,
        topic: agenda, // Map agenda to topic to avoid DB migration
        meeting_date,
        facilitator: user?.user_metadata?.full_name || user?.email || 'To Be Decided', // Set default facilitator
        participants: attendees.split(',').map(s => s.trim()).filter(Boolean), 
        photo_evidence_url: publicUrlData.publicUrl,
        content_json: { 
          location,
          time,
          type_of_meeting, 
          raw_file_path: contentStoragePath 
        }, 
        ai_model_used: 'pending',
        status: 'draft',
      })
      .select()
      .single()

    if (dbError) {
      console.error('DB Insert Error:', dbError)
      return { success: false, error: 'Failed to save MoM draft: ' + dbError.message }
    }

    revalidatePath('/')
    
    return { success: true, id: momData.id }
  } catch (err: any) {
    console.error('Server action error:', err)
    return { success: false, error: err.message || 'Internal Server Error' }
  }
}
