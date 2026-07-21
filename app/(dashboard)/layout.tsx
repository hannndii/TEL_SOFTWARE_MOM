import Sidebar from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user profile from public.users table
  const { data: userProfile } = await supabase
    .from('users')
    .select('tier, daily_quota_left, full_name, avatar_url')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50/50">
      <Sidebar 
        userEmail={user.email} 
        userTier={userProfile?.tier || 'free'} 
        userName={userProfile?.full_name}
        userAvatar={userProfile?.avatar_url}
      />
      <main className="flex-1 h-full min-w-0 overflow-y-auto p-8 relative">
        {children}
      </main>
    </div>
  );
}
