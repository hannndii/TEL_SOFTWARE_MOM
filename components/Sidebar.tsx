import Link from "next/link";
import { LayoutDashboard, FileText, Settings } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-telkom-navy text-white min-h-screen flex flex-col shadow-lg shrink-0">
      <div className="p-6 border-b border-white/10">
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <FileText size={20} />
          <span className="font-medium">New MoM</span>
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
      </nav>

      <div className="p-6 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-telkom-red flex items-center justify-center font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-medium">User Profile</p>
            <p className="text-xs text-white/60">Free Tier</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
