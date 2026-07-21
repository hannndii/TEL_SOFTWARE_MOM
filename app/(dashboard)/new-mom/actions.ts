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
    let type_of_meeting = []
    try {
      type_of_meeting = JSON.parse(formData.get('type_of_meeting') as string)
    } catch(e) {
      type_of_meeting = [formData.get('type_of_meeting') as string]
    }
    const location = formData.get('location') as string
    const attendees = formData.get('attendees') as string
    const facilitator = formData.get('facilitator') as string

    // Extract Files (multiple)
    const contentFiles = formData.getAll('contentFiles') as File[]

    if (!agenda || !meeting_date || !time || !type_of_meeting || !location || !attendees || !facilitator || !contentFiles || contentFiles.length === 0) {
      return { success: false, error: 'Missing required fields or files' }
    }

    const rawFilePaths: string[] = []

    // Upload Content Files to 'mom_contents'
    for (let i = 0; i < contentFiles.length; i++) {
      const file = contentFiles[i]
      const ext = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}_${i}_content.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from('mom_contents')
        .upload(fileName, file, { upsert: false })

      if (uploadError) {
        console.error('Content upload error:', uploadError)
        return { success: false, error: 'Failed to upload transcript files.' }
      }
      
      rawFilePaths.push(fileName)
    }

    // Insert to Database
    const { data: momData, error: dbError } = await supabase
      .from('meeting_mom')
      .insert({
        user_id: user.id,
        topic: agenda, 
        meeting_date,
        facilitator: facilitator, 
        participants: attendees.split(',').map(s => s.trim()).filter(Boolean), 
        content_json: { 
          location,
          time,
          type_of_meeting, 
          raw_file_paths: rawFilePaths 
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
