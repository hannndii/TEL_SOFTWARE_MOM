'use client';

import { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { usePathname, useSearchParams } from "next/navigation";

interface SidebarProps {
  userEmail?: string;
  userTier?: string;
  userName?: string;
  userAvatar?: string;
}

export default function Sidebar({ userEmail = "Guest", userTier = "free", userName, userAvatar }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'profile';
  
  const initial = userName ? userName.charAt(0).toUpperCase() : userEmail.charAt(0).toUpperCase();
  const displayName = userName || userEmail.split('@')[0];
  const displayTier = 'Internal User';

  // Helper function to check if link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname?.startsWith(path);
  };

  const getLinkClasses = (path: string) => {
    const active = isActive(path);
    if (active) {
      return "flex items-center gap-3 px-4 py-3 rounded-lg bg-telkom-red text-white hover:bg-red-600 transition-all group shadow-md";
    }
    return "flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors group text-gray-300 hover:text-white";
  };

  const getIconClasses = (path: string) => {
    const active = isActive(path);
    if (active) {
      return "text-white group-hover:scale-110 transition-transform";
    }
    return "text-gray-400 group-hover:text-white transition-colors";
  };

  const getTextClasses = (path: string) => {
    const active = isActive(path);
    return active ? "font-bold tracking-wide" : "font-medium";
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(isActive('/settings'));
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  return (
    <aside className="w-64 bg-slate-900 text-white h-full flex flex-col shadow-xl border-r border-slate-800 shrink-0 overflow-y-auto relative">
      <div className="p-6 border-b border-slate-800 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">
          <span className="italic">my</span><span className="text-telkom-red">TELMOM</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">AI-Powered Meeting Minutes</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <Link href="/" className={getLinkClasses('/')}>
          <LayoutDashboard size={20} className={getIconClasses('/')} />
          <span className={getTextClasses('/')}>Dashboard</span>
        </Link>
        <Link href="/new-mom" className={getLinkClasses('/new-mom')}>
          <FileText size={20} className={getIconClasses('/new-mom')} />
          <span className={getTextClasses('/new-mom')}>Create MoM</span>
        </Link>
        <Link href="/feedback" className={getLinkClasses('/feedback')}>
          <svg className={`w-5 h-5 ${getIconClasses('/feedback')}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className={getTextClasses('/feedback')}>Give Feedback</span>
        </Link>
        
        {/* Settings Dropdown */}
        <div>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/5 transition-colors group text-slate-300 hover:text-white"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className={isActive('/settings') ? 'text-telkom-red' : 'text-slate-400 group-hover:text-white transition-colors'} />
              <span className={isActive('/settings') ? 'font-bold text-white' : 'font-medium'}>Settings</span>
            </div>
            <svg 
              className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSettingsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col ml-12 pl-2 space-y-3 py-3 border-l-2 border-slate-800">
              <Link 
                href="/settings?tab=profile" 
                className={`text-sm transition-all flex items-center ${pathname === '/settings' && currentTab === 'profile' ? 'text-white font-semibold -ml-[2px] border-l-2 border-telkom-red pl-3' : 'text-slate-400 hover:text-white pl-3'}`}
              >
                Profile
              </Link>
              <Link 
                href="/settings?tab=security" 
                className={`text-sm transition-all flex items-center ${pathname === '/settings' && currentTab === 'security' ? 'text-white font-semibold -ml-[2px] border-l-2 border-telkom-red pl-3' : 'text-slate-400 hover:text-white pl-3'}`}
              >
                Security
              </Link>

            </div>
          </div>
        </div>
      </nav>

      {/* User Footer Profile & Dropdown */}
      <div className="relative p-4 border-t border-slate-800 shrink-0">
        
        {/* Dropdown Menu */}
        {isProfileDropdownOpen && (
          <div className="absolute bottom-full left-4 right-4 mb-2 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 animate-in fade-in slide-in-from-bottom-2">
            <form action={logout}>
              <button type="submit" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-700 text-red-400 hover:text-red-300 transition-colors">
                <LogOut size={18} />
                <span className="text-sm font-medium">Log out securely</span>
              </button>
            </form>
          </div>
        )}

        <button 
          onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
          className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-slate-800 transition-colors text-left group"
        >
          <div className="relative w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold shadow-inner shrink-0 text-sm overflow-hidden border border-slate-700 group-hover:border-slate-500 transition-colors">
            {userAvatar ? (
              <Image src={userAvatar} alt="Avatar" fill className="object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-sm font-semibold truncate text-white" title={displayName}>{displayName}</p>
            <p className="text-xs text-slate-400">{displayTier}</p>
          </div>
          <svg className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
