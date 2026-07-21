import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import MomDetailClient from './MomDetailClient'

export default async function MomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Await the params before accessing its properties (Next.js 15+ best practice)
  const resolvedParams = await params
  const momId = resolvedParams.id

  const { data: momData, error } = await supabase
    .from('meeting_mom')
    .select('*')
    .eq('id', momId)
    .eq('user_id', user.id)
    .single()

  if (error || !momData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold text-gray-900">MoM not found</h1>
        <p className="text-gray-500 mt-2">The meeting minutes you are looking for does not exist or you don't have access.</p>
      </div>
    )
  }

  return <MomDetailClient mom={momData} />
}
