'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { cookies } from 'next/headers'
import crypto from 'crypto'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // 1. Verifikasi Email via Admin Client (Supabase hides this by default for security)
  const { data: userExists, error: emailError } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', data.email)
    .single()

  if (!userExists || emailError) {
    redirect('/login?error=' + encodeURIComponent('Alamat email belum terdaftar.'))
  }

  // 2. Sign In
  const { data: authData, error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  // 3. Logic Pembatasan 2 Device
  if (authData?.user) {
    const cookieStore = await cookies()
    let deviceId = cookieStore.get('device_id')?.value

    if (!deviceId) {
      deviceId = crypto.randomUUID()
      cookieStore.set('device_id', deviceId, { 
        path: '/',
        maxAge: 60 * 60 * 24 * 365 * 10 // 10 years
      })
    }

    // Upsert device ke tabel user_devices
    await supabaseAdmin
      .from('user_devices')
      .upsert({ 
        user_id: authData.user.id, 
        device_id: deviceId, 
        last_active: new Date().toISOString() 
      }, { onConflict: 'user_id, device_id' })

    // Hitung jumlah device aktif untuk user ini
    const { data: activeDevices } = await supabaseAdmin
      .from('user_devices')
      .select('id, device_id')
      .eq('user_id', authData.user.id)
      .order('last_active', { ascending: true })

    // Jika lebih dari 2 device, hapus yang paling lama (paling awal di array karena ascending)
    if (activeDevices && activeDevices.length > 2) {
      const devicesToDelete = activeDevices.slice(0, activeDevices.length - 2)
      for (const device of devicesToDelete) {
        await supabaseAdmin
          .from('user_devices')
          .delete()
          .eq('id', device.id)
      }
    }
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

  // Cek jika email sudah terdaftar (Supabase mengembalikan user tanpa identities jika prevent_email_enumeration aktif)
  if (authData?.user && authData.user.identities && authData.user.identities.length === 0) {
    redirect('/signup?error=' + encodeURIComponent('Alamat email ini sudah terdaftar. Silakan masuk (login) atau gunakan fitur Lupa Sandi.'))
  }

  // Jika berhasil sign up tapi butuh konfirmasi email
  if (authData?.user && authData?.session === null) {
    redirect(`/login?message=${encodeURIComponent('Berhasil mendaftar! Silakan cek kotak masuk email Anda (atau folder spam) untuk memverifikasi akun Anda sebelum masuk.')}&email=${encodeURIComponent(data.email)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function logout() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const cookieStore = await cookies()
    const deviceId = cookieStore.get('device_id')?.value
    if (deviceId) {
      await supabaseAdmin
        .from('user_devices')
        .delete()
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
    }
  }

  await supabase.auth.signOut()
  redirect('/login')
}

export async function resendVerification(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  if (!email) {
    redirect('/login?error=' + encodeURIComponent('Email is required to resend verification.'))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = `${siteUrl}/auth/confirm`

  const { error } = await supabase.auth.resend({
    type: 'signup',
    email,
    options: {
      emailRedirectTo: redirectUrl,
    }
  })

  if (error) {
    redirect('/login?error=' + encodeURIComponent(error.message))
  }

  redirect(`/login?message=${encodeURIComponent('Email verifikasi ulang telah dikirim. Silakan cek kotak masuk Anda.')}&email=${encodeURIComponent(email)}`)
}

export async function sendPasswordReset(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  
  if (!email) {
    redirect('/forgot-password?error=' + encodeURIComponent('Email is required.'))
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const redirectUrl = `${siteUrl}/auth/confirm?next=/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  })

  if (error) {
    redirect('/forgot-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/forgot-password?message=' + encodeURIComponent('Tautan pemulihan kata sandi telah dikirim ke email Anda.'))
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  
  if (!password || password.length < 6) {
    redirect('/reset-password?error=' + encodeURIComponent('Kata sandi baru harus minimal 6 karakter.'))
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message))
  }

  redirect('/login?message=' + encodeURIComponent('Kata sandi berhasil diperbarui! Silakan masuk dengan sandi baru Anda.'))
}
