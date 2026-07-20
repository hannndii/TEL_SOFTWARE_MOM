import Sidebar from "@/components/Sidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

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
    .select('tier, daily_quota_left')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex flex-1 min-h-screen">
      <Sidebar userEmail={user.email} userTier={userProfile?.tier || 'free'} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
