import { createClient } from '@/utils/supabase/server'
import NewMomForm from './NewMomForm'

export const dynamic = 'force-dynamic';

export default async function NewMomPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let userTier = 'free'

  if (user) {
    const { data: userProfile } = await supabase
      .from('users')
      .select('tier')
      .eq('id', user.id)
      .single()
      
    if (userProfile) {
      userTier = userProfile.tier
    }
  }

  return (
    <div className="w-full">
      {/* PREMIUM HEADER */}
      <div className="relative bg-gradient-to-r from-telkom-navy to-[#1e2840] pt-12 pb-24 px-8 -mx-8 -mt-8 rounded-b-3xl shadow-inner overflow-hidden mb-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-10 w-40 h-40 bg-telkom-red opacity-10 rounded-full blur-2xl translate-y-1/2"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold text-white tracking-tight">Generate Smart MoM</h1>
          <p className="text-gray-300 mt-2 text-sm font-medium">Upload your meeting recordings or transcripts and let AI do the heavy lifting.</p>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto -mt-16 relative z-20">
      
      <NewMomForm userTier={userTier} />
      </div>
    </div>
  )
}
