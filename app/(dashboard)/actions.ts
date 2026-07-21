'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteMom(momId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  // First fetch the MoM to get the file paths so we can delete them from storage
  const { data: momData, error: fetchError } = await supabase
    .from('meeting_mom')
    .select('photo_evidence_url, content_json')
    .eq('id', momId)
    .eq('user_id', user.id) // Ensure they own it
    .single()

  if (fetchError || !momData) {
    return { success: false, error: 'Failed to find MoM or unauthorized' }
  }

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('meeting_mom')
    .delete()
    .eq('id', momId)
    .eq('user_id', user.id)

  if (deleteError) {
    return { success: false, error: deleteError.message }
  }

  // Optional: delete files from storage if we want to save space
  try {
    if (momData.photo_evidence_url) {
      // url is something like: https://.../mom_evidences/userid/12345_evidence.jpg
      const urlParts = momData.photo_evidence_url.split('/mom_evidences/')
      if (urlParts.length > 1) {
        const filePath = urlParts[1]
        await supabase.storage.from('mom_evidences').remove([filePath])
      }
    }
    
    if (momData.content_json?.raw_file_path) {
      await supabase.storage.from('mom_contents').remove([momData.content_json.raw_file_path])
    }
  } catch (err) {
    console.error("Failed to delete storage files:", err)
    // Non-blocking error
  }

  revalidatePath('/')
  return { success: true }
}
