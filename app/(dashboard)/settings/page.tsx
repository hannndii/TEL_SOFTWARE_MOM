import { User, Shield, Zap, CreditCard } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const isPremium = userProfile?.tier === 'premium';
  const initial = user.email ? user.email.charAt(0).toUpperCase() : 'U';

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            <a href="#" className="bg-white text-telkom-red font-medium px-4 py-2 rounded-lg border border-gray-100 shadow-sm flex items-center gap-3">
              <User size={18} /> Profile
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg flex items-center gap-3 transition-colors">
              <Shield size={18} /> Security
            </a>
            <a href="#" className="text-gray-600 hover:bg-gray-100 font-medium px-4 py-2 rounded-lg flex items-center gap-3 transition-colors">
              <CreditCard size={18} /> Billing
            </a>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Information</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="w-20 h-20 bg-telkom-navy text-white rounded-full flex items-center justify-center text-3xl font-bold">
                {initial}
              </div>
              <div className="overflow-hidden">
                <h3 className="text-lg font-bold text-gray-900 truncate" title={user.email || ''}>{user.email}</h3>
                <p className="text-gray-500">ID: {user.id.substring(0, 8)}...</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input type="email" defaultValue={user.email || ''} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-telkom-red focus:border-transparent bg-gray-50 text-gray-600" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Created</label>
                <input type="text" defaultValue={new Date(user.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-telkom-red focus:border-transparent bg-gray-50 text-gray-600" readOnly />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Zap className="text-yellow-500" size={24} /> Subscription & Quota
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isPremium ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-700'}`}>
                {isPremium ? 'Premium Tier' : 'Free Tier'}
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex justify-between items-end mb-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Daily Generation Quota</p>
                  {isPremium ? (
                    <p className="text-2xl font-bold text-gray-900 mt-1">Unlimited</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-1">{userProfile?.daily_quota_left || 0} / 3 <span className="text-base font-normal text-gray-500">Left</span></p>
                  )}
                </div>
              </div>
              {!isPremium && (
                <>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${((userProfile?.daily_quota_left || 0) / 3) * 100}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 text-center">Resets every day at 00:00 (WIB)</p>
                </>
              )}
            </div>

            {!isPremium && (
              <div className="p-4 border border-telkom-navy/20 bg-blue-50/50 rounded-lg">
                <h3 className="font-semibold text-telkom-navy">Upgrade to Premium</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">Get unlimited meeting minutes generations and access to Gemini 1.5 Pro / GPT-4o for audio processing.</p>
                <button className="bg-telkom-navy hover:bg-blue-900 text-white font-medium px-4 py-2 rounded-lg transition-colors w-full sm:w-auto">
                  Upgrade Now
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
