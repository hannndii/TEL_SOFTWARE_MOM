import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  const email = 'test' + Date.now() + '@example.com'
  console.log('Signing up:', email)
  const { data, error } = await supabase.auth.signUp({
    email,
    password: 'Password123!',
  })
  console.log('Error:', error)
  console.log('Data:', JSON.stringify(data, null, 2))
}
test()
