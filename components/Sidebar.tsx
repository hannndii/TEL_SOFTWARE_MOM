import Link from "next/link";
import { LayoutDashboard, FileText, Settings, LogOut } from "lucide-react";
import { logout } from "@/app/login/actions";

interface SidebarProps {
  userEmail?: string;
  userTier?: string;
}

export default function Sidebar({ userEmail = "Guest", userTier = "free" }: SidebarProps) {
  const initial = userEmail.charAt(0).toUpperCase();
  const displayTier = userTier === 'premium' ? 'Premium Tier' : 'Free Tier';

  return (
    <aside className="w-64 bg-telkom-navy text-white h-full flex flex-col shadow-lg shrink-0 overflow-y-auto">
      <div className="p-6 border-b border-white/10 shrink-0">
        <h1 className="text-2xl font-bold tracking-tight">
          TEL<span className="text-telkom-red">MOM</span>
        </h1>
        <p className="text-xs text-white/60 mt-1">AI-Powered Meeting Minutes</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <LayoutDashboard size={20} />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link
          href="/new-mom"
          className="flex items-center gap-3 px-4 py-3 rounded-lg bg-telkom-red/10 text-white hover:bg-telkom-red/20 border border-telkom-red/20 hover:border-telkom-red/50 transition-all group"
        >
          <FileText size={20} className="text-red-400 group-hover:text-red-300 transition-colors" />
          <span className="font-semibold">Generate AI MoM</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
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
