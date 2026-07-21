import { FileText, Clock, BarChart3, Plus, ChevronRight, FileArchive, ArrowRight } from "lucide-react";
import Link from 'next/link'
import DashboardTableControls from './DashboardTableControls'
import { createClient } from "@/utils/supabase/server";
import DeleteMomButton from "./DeleteMomButton";

export default async function Dashboard(props: { searchParams?: Promise<{ search?: string, status?: string }> }) {
  const supabase = await createClient();
  const searchParams = await props.searchParams;
  const search = searchParams?.search || '';
  const statusFilter = searchParams?.status || 'All';
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

  let momsQuery = supabase
    .from('meeting_mom')
    .select('*')
    .eq('user_id', user.id);

  if (search) {
    momsQuery = momsQuery.ilike('topic', `%${search}%`);
  }
  if (statusFilter && statusFilter !== 'All') {
    momsQuery = momsQuery.eq('status', statusFilter);
  }

  const { data: recentMoms } = await momsQuery
    .order('updated_at', { ascending: false })
    .limit(10);

  const isPremium = userProfile?.tier === 'premium';

  return (
    <div className="w-full">
      {/* 1. STUNNING HEADER */}
      <div className="relative bg-gradient-to-r from-telkom-navy to-[#1e2840] pt-12 pb-24 px-8 -mx-8 -mt-8 rounded-b-3xl shadow-inner overflow-hidden">
        
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-300 mt-2 text-sm font-medium">Manage and generate your corporate meeting minutes efficiently.</p>
          </div>
          <Link 
            href="/new-mom" 
            className="group flex items-center gap-2 bg-telkom-red hover:bg-red-700 text-white px-6 py-2.5 rounded-md font-semibold transition-colors shadow-sm"
          >
            <Plus size={20} className="transition-transform group-hover:rotate-90" />
            Create New MoM
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto -mt-12 relative z-20 space-y-8">
        
        {/* 2. STATS CARDS (Overlapping Header) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-0">
          <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Minutes</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalMom || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-orange-50 text-orange-500 rounded-xl">
              <Clock size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Recent Drafts</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-1">{totalDrafts || 0}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-200 flex items-center gap-5 transition-transform hover:-translate-y-1">
            <div className="p-4 bg-green-50 text-green-500 rounded-xl">
              <BarChart3 size={28} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Daily Quota</p>
              <div className="flex items-baseline gap-2 mt-1">
                {isPremium ? (
                   <p className="text-3xl font-extrabold text-gray-900">Unlimited</p>
                ) : (
                   <p className="text-3xl font-extrabold text-gray-900">{userProfile?.daily_quota_left || 0} <span className="text-lg text-gray-400 font-medium">/ 3</span></p>
                )}
              </div>
              <p className="text-xs text-green-600 font-semibold mt-1">{isPremium ? 'Premium Tier' : 'Free Tier Active'}</p>
            </div>
          </div>
        </div>

        {/* 3. PROFESSIONAL TABLE */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mx-4 md:mx-0 shadow-sm mb-12">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Meeting Minutes
            </h2>
            <DashboardTableControls />
          </div>
          
          {recentMoms && recentMoms.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="px-6 py-4 font-bold">Meeting Topic</th>
                    <th className="px-6 py-4 font-bold w-32 lg:w-40">Date</th>
                    <th className="px-6 py-4 font-bold w-32 text-center">Status</th>
                    <th className="px-6 py-4 font-bold w-48 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {recentMoms.map((mom) => (
                    <tr key={mom.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 group-hover:text-telkom-navy transition-colors">{mom.topic}</span>
                          <span className="text-xs text-gray-500 mt-1 line-clamp-1">{mom.content_json?.location || 'No Location'} • {mom.content_json?.time || 'No Time'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="text-sm text-gray-700 font-medium">
                          {new Date(mom.meeting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold capitalize ${
                          mom.status === 'draft' 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {mom.status === 'draft' && <span className="w-1.5 h-1.5 rounded-full mr-2 bg-amber-500"></span>}
                          {mom.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Link 
                            href={`/mom/${mom.id}`} 
                            className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors bg-blue-50 hover:bg-blue-100 px-4 py-1.5 rounded-md"
                          >
                            {mom.status === 'draft' ? 'Continue' : 'View'}
                            <ChevronRight size={16} className="ml-1" />
                          </Link>
                          <DeleteMomButton momId={mom.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="p-4 border-t border-gray-100 text-center">
                <Link href="#" className="inline-flex items-center text-blue-600 text-sm font-semibold hover:text-blue-800 transition-colors">
                  View all minute of meeting <ArrowRight size={16} className="ml-1" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center py-20 flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 border border-gray-200">
                <FileText size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No meeting minutes yet</h3>
              <p className="text-gray-500 mt-2 text-sm max-w-sm">You haven't generated any MoM documents. Create your first document to see it appear here.</p>
              <Link 
                href="/new-mom" 
                className="mt-6 bg-telkom-navy hover:bg-blue-900 text-white px-6 py-2.5 rounded-md font-medium transition-colors shadow-sm"
              >
                Create Document
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
