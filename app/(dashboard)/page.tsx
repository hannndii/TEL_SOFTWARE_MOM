import { FileText, Clock, Plus, Bell, ArrowRight, ArrowUp, Crown } from "lucide-react";
import Link from "next/link";
import DashboardTableControls from "./DashboardTableControls";
import { createClient } from "@/utils/supabase/server";
import DeleteMomButton from "./DeleteMomButton";

export default async function Dashboard(props: { searchParams?: Promise<{ search?: string }> }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: userProfile } = await supabase
    .from('users')
    .select('tier, daily_quota_left')
    .eq('id', user.id)
    .single();

  const { count: totalMom } = await supabase
    .from('meeting_mom')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const { count: totalDrafts } = await supabase
    .from('meeting_mom')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .eq('status', 'draft');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: thisMonthMomCount } = await supabase
    .from('meeting_mom')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());

  let momsQuery = supabase
    .from('meeting_mom')
    .select('*')
    .eq('user_id', user.id);

  if (search) {
    momsQuery = momsQuery.ilike('topic', `%${search}%`);
  }

  const { data: recentMoms } = await momsQuery
    .order('updated_at', { ascending: false })
    .limit(10);

  const isPremium = userProfile?.tier === 'premium';

  return (
    <div className="w-full bg-gray-50 min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and generate your meeting minutes.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors" title="Notifications">
            <Bell size={20} />
          </button>
          <Link 
            href="/new-mom" 
            className="bg-[#e4000f] hover:bg-red-700 text-white px-5 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Plus size={18} />
            Create New MoM
          </Link>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Table) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 flex justify-between items-center border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Recent Meeting Minutes</h2>
              <DashboardTableControls />
            </div>
            
            {recentMoms && recentMoms.length > 0 ? (
              <div className="flex flex-col">
                {recentMoms.map((mom) => (
                  <div key={mom.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-gray-50 hover:bg-slate-50 transition-colors gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                        <FileText size={24} />
                      </div>
                      <Link href={`/mom/${mom.id}`} className="flex flex-col hover:opacity-80 transition-opacity">
                        <span className="text-sm font-bold text-gray-900">{mom.topic}</span>
                        <span className="text-xs text-gray-500 mt-1">{mom.content_json?.location || 'Online'} • {mom.content_json?.time || 'No Time'}</span>
                      </Link>
                    </div>
                    
                    <div className="flex items-center gap-6 sm:gap-10 pl-16 sm:pl-0">
                      <div className="text-xs font-medium text-gray-500 w-24 text-left sm:text-right">
                        {new Date(mom.meeting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="w-24 flex justify-start sm:justify-end">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold capitalize ${
                          mom.status === 'draft' ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                        }`}>
                          {mom.status === 'draft' && <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500"></span>}
                          {mom.status}
                        </span>
                      </div>
                      <DeleteMomButton momId={mom.id} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center flex flex-col items-center">
                <FileText size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900">No meeting minutes yet</h3>
                <p className="text-gray-500 mt-2 text-sm max-w-sm">You haven't generated any MoM documents.</p>
              </div>
            )}
            
            {recentMoms && recentMoms.length > 0 && (
              <div className="p-4 text-center border-t border-gray-100">
                <Link href="#" className="inline-flex items-center text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
                  View all meetings <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Overview Cards) */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Overview</h2>
          
          <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100 flex gap-5 items-center shadow-sm">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
              <FileText size={26} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Total MoM</p>
              <p className="text-2xl font-bold text-gray-900">{totalMom}</p>
              <p className="text-xs text-green-600 font-medium flex items-center mt-1">
                <ArrowUp size={12} className="mr-1" /> {thisMonthMomCount || 0} this month
              </p>
            </div>
          </div>

          <div className="bg-orange-50/30 rounded-xl p-5 border border-orange-50 flex gap-5 items-center shadow-sm">
            <div className="w-14 h-14 bg-orange-50 text-orange-500 rounded-xl flex items-center justify-center shrink-0">
              <Clock size={26} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Drafts</p>
              <p className="text-2xl font-bold text-gray-900">{totalDrafts}</p>
              <p className="text-xs text-orange-500 font-medium flex items-center mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 mr-1.5"></span> Need attention
              </p>
            </div>
          </div>

          <div className="bg-green-50/30 rounded-xl p-5 border border-green-50 flex gap-5 items-center shadow-sm">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
              <Crown size={26} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-semibold mb-1">Plan</p>
              <p className="text-2xl font-bold text-gray-900">{isPremium ? 'Premium' : 'Free'}</p>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {isPremium ? 'Unlimited MoM' : `${userProfile?.daily_quota_left || 0} quota left`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
