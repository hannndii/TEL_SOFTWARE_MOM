'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitFeedback(formData: FormData) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'You must be logged in to submit feedback.' }
  }

  const name = formData.get('name') as string
  const department = formData.get('department') as string
  const frequency = formData.get('frequency') as string
  const ui_login = parseInt(formData.get('ui_login') as string)
  const ui_dashboard = parseInt(formData.get('ui_dashboard') as string)
  const ui_navigation = parseInt(formData.get('ui_navigation') as string)
  const ux_upload = parseInt(formData.get('ux_upload') as string)
  const ux_generate = parseInt(formData.get('ux_generate') as string)
  const ux_accuracy = parseInt(formData.get('ux_accuracy') as string)
  const ux_quota_clarity = formData.get('ux_quota_clarity') as string
  const feedback_favorite = formData.get('feedback_favorite') as string
  const feedback_bugs = formData.get('feedback_bugs') as string
  const feedback_improvements = formData.get('feedback_improvements') as string
  const recommend_score = parseInt(formData.get('recommend_score') as string)

  const { error } = await supabase
    .from('usability_feedbacks')
    .insert({
      user_id: user.id,
      name,
      department,
      frequency,
      ui_login,
      ui_dashboard,
      ui_navigation,
      ux_upload,
      ux_generate,
      ux_accuracy,
      ux_quota_clarity,
      feedback_favorite,
      feedback_bugs,
      feedback_improvements,
      recommend_score
    })

  if (error) {
    console.error('Error inserting feedback:', error)
    return { error: 'Failed to submit feedback. Please try again.' }
  }

  revalidatePath('/feedback')
  return { success: true }
}
