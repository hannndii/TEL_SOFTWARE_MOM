import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // DEVICE LIMIT CHECK: Ensure the device is still active in the database
    const deviceId = request.cookies.get('device_id')?.value
    let isValidDevice = false

    if (deviceId) {
      // Create admin client for bypassing RLS to check device
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            getAll() { return [] },
            setAll() {},
          },
          global: {
            fetch: (url, options) => {
              return fetch(url, { ...options, cache: 'no-store' })
            }
          }
        }
      )
      
      const { data: device } = await adminSupabase
        .from('user_devices')
        .select('id')
        .eq('user_id', user.id)
        .eq('device_id', deviceId)
        .single()
        
      if (device) isValidDevice = true
    }

    if (!isValidDevice) {
      // Kick the user out
      await supabase.auth.signOut()
      
      // Redirect to login with error
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('error', 'Sesi Anda telah berakhir karena Anda masuk di terlalu banyak perangkat.')
      
      const redirectResponse = NextResponse.redirect(url)
      
      // Salin headers (terutama Set-Cookie untuk signOut) dari supabaseResponse
      supabaseResponse.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
          redirectResponse.headers.append(key, value)
        }
      })
      
      // Hapus cookie device_id agar mendapat ID baru jika login lagi
      redirectResponse.cookies.delete('device_id')
      
      return redirectResponse
    }
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/signup') &&
    !request.nextUrl.pathname.startsWith('/auth') &&
    !request.nextUrl.pathname.startsWith('/forgot-password') &&
    !request.nextUrl.pathname.startsWith('/reset-password')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
