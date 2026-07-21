'use server'

import { createClient } from '@/utils/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function updateProfile(fullName: string, avatarUrl: string | null) {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  // Update public.users table
  const { error } = await supabase
    .from('users')
    .update({ 
      full_name: fullName, 
      ...(avatarUrl !== null && { avatar_url: avatarUrl }) 
    })
    .eq('id', user.id)

  if (error) {
    console.error("Failed to update profile:", error)
    return { error: 'Failed to update profile' }
  }

  revalidatePath('/settings')
  revalidatePath('/')
  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const currentPassword = formData.get('currentPassword') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword) {
    return { error: 'Current password is required' }
  }

  if (!password || password.length < 6) {
    return { error: 'New password must be at least 6 characters long' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password,
    // @ts-ignore: Supabase v2.102.0+ supports current_password but types might be outdated
    current_password: currentPassword
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function deleteAccount() {
  const supabase = await createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { error: 'Not authenticated' }
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    return { error: 'Server configuration error: Missing Admin Key' }
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 1. Delete user from public.users table (might trigger cascading deletes depending on DB setup)
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .delete()
    .eq('id', user.id)

  if (dbError) {
    console.error("Failed to delete user data:", dbError)
    return { error: 'Failed to delete user data' }
  }

  // 2. Delete user from auth.users using Admin API
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

  if (authError) {
    console.error("Failed to delete auth user:", authError)
    return { error: 'Failed to delete authentication account' }
  }

  // 3. Sign out the user
  await supabase.auth.signOut()
  
  // 4. Redirect to login
  redirect('/login')
}
