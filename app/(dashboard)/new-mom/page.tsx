import { createClient } from '@/utils/supabase/server'
import NewMomForm from './NewMomForm'

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create New MoM</h1>
        <p className="text-gray-500 mt-2">Follow the steps below to generate your AI-powered meeting minutes.</p>
      </div>
      
      <NewMomForm userTier={userTier} />
    </div>
  )
}
