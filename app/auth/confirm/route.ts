import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as string | null
  const next = searchParams.get('next') ?? '/'

  if (token_hash && type) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    })
    
    if (!error) {
      // redirect user to specified redirect URL or root of app
      return NextResponse.redirect(new URL(`/${next.slice(1)}`, request.url))
    }
  } else {
    // Legacy support for PKCE flow (if code is provided instead of token_hash)
    const code = searchParams.get('code')
    if (code) {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (!error) {
        return NextResponse.redirect(new URL(`/${next.slice(1)}`, request.url))
      }
    }
  }

  // return the user to an error page with some instructions
  return NextResponse.redirect(new URL('/login?error=' + encodeURIComponent('Link verifikasi tidak valid atau kedaluwarsa.'), request.url))
}
