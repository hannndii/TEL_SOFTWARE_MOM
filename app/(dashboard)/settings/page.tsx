import { createClient } from "@/utils/supabase/server";
import SettingsClient from "./SettingsClient";
import { Suspense } from "react";

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-telkom-red"></div></div>}>
      <SettingsClient userProfile={userProfile} userEmail={user.email || ''} />
    </Suspense>
  );
}
