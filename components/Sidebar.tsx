'use client';

import { useState } from 'react';
import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";
import { usePathname } from "next/navigation";

interface SidebarProps {
  userEmail?: string;
  userTier?: string;
}

export default function Sidebar({ userEmail = "Guest", userTier = "free" }: SidebarProps) {
  const pathname = usePathname();
  const initial = userEmail.charAt(0).toUpperCase();
  const displayTier = userTier === 'premium' ? 'Premium Tier' : 'Free Tier';

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

  return (
    <aside className="w-64 bg-telkom-navy text-white h-full flex flex-col shadow-lg shrink-0 overflow-y-auto">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">
          TEL<span className="text-telkom-red">MOM</span>
        </h1>
        <p className="text-xs text-white/60 mt-1">AI-Powered Meeting Minutes</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <Link href="/" className={getLinkClasses('/')}>
          <LayoutDashboard size={20} className={getIconClasses('/')} />
          <span className={getTextClasses('/')}>Dashboard</span>
        </Link>
        <Link href="/new-mom" className={getLinkClasses('/new-mom')}>
          <FileText size={20} className={getIconClasses('/new-mom')} />
          <span className={getTextClasses('/new-mom')}>Generate AI MoM</span>
        </Link>
        
        {/* Settings Dropdown */}
        <div>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg hover:bg-white/10 transition-colors group text-gray-300 hover:text-white"
          >
            <div className="flex items-center gap-3">
              <Settings size={20} className={isActive('/settings') ? 'text-telkom-red' : 'text-gray-400 group-hover:text-white transition-colors'} />
              <span className={isActive('/settings') ? 'font-bold text-white' : 'font-medium'}>Settings</span>
            </div>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isSettingsOpen ? 'rotate-180' : ''}`} 
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSettingsOpen ? 'max-h-40 mt-1 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="flex flex-col pl-11 pr-4 space-y-1 py-1">
              <Link 
                href="/settings?tab=profile" 
                className={`text-sm py-2 px-3 rounded-md transition-colors ${pathname === '/settings' && (!typeof window !== 'undefined' || !window.location.search || window.location.search === '?tab=profile') ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Profile
              </Link>
              <Link 
                href="/settings?tab=security" 
                className={`text-sm py-2 px-3 rounded-md transition-colors ${typeof window !== 'undefined' && window.location.search === '?tab=security' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Security
              </Link>
              <Link 
                href="/settings?tab=billing" 
                className={`text-sm py-2 px-3 rounded-md transition-colors ${typeof window !== 'undefined' && window.location.search === '?tab=billing' ? 'bg-white/10 text-white font-semibold' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              >
                Billing
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-full bg-telkom-red flex items-center justify-center font-bold">
            {initial}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate" title={userEmail}>{userEmail}</p>
            <p className="text-xs text-white/60">{displayTier}</p>
          </div>
        </div>
        
        <form action={logout}>
          <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 text-red-300 hover:text-red-200 transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Log out</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
