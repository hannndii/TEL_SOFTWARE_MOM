'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // Define the redirect URL for the email template link
  // Use VERCEL_URL if deployed, otherwise fallback to localhost
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = `${siteUrl}/auth/confirm`

  const { error, data: authData } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: redirectUrl,
    }
  })

  if (error) {
    redirect('/signup?error=' + encodeURIComponent(error.message))
  }

  // Jika berhasil sign up tapi butuh konfirmasi email
  if (authData?.user && authData?.session === null) {
    redirect('/login?error=' + encodeURIComponent('Berhasil mendaftar. Silakan cek kotak masuk email Anda (atau folder spam) untuk link verifikasi akun.'))
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
