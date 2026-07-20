import { FileText, Clock, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <Link 
          href="/new-mom" 
          className="bg-telkom-red hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm"
        >
          + Create New MoM
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-blue-50 text-telkom-navy rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Total MoM</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-red-50 text-telkom-red rounded-lg">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Recent Drafts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">3</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-start gap-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-lg">
            <BarChart3 size={24} />
          </div>
          <div>
            <p className="text-sm text-gray-500 font-medium">Daily Quota Left</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">3 / 3</p>
            <p className="text-xs text-green-600 font-medium mt-1">Free Tier</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mt-8">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Recent Meeting Minutes</h2>
        </div>
        <div className="p-6 text-center py-12 text-gray-500">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <p>No meeting minutes generated yet.</p>
          <Link href="/new-mom" className="text-telkom-red hover:underline mt-2 inline-block font-medium">
            Create your first MoM
          </Link>
        </div>
      </div>
    </div>
  );
}
