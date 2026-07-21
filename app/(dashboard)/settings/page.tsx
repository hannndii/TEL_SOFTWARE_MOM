import { createClient } from "@/utils/supabase/server";
import SettingsClient from "./SettingsClient";

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

  return <SettingsClient userProfile={userProfile} userEmail={user.email || ''} />;
}
