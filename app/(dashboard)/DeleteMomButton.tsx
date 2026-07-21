'use client'

import { useState, useRef, useEffect } from "react";
import { MoreVertical, Loader2, AlertTriangle, Trash2 } from "lucide-react";
import { deleteMom } from "./actions";

export default function DeleteMomButton({ momId }: { momId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteMom(momId);
    if (!res.success) {
      alert(res.error || "Failed to delete");
      setIsDeleting(false);
    } else {
      setShowModal(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isDeleting}
        className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-50 focus:outline-none"
        title="Options"
      >
        <MoreVertical size={20} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-1 w-36 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
          <button
            onClick={() => {
              setShowDropdown(false);
              setShowModal(true);
            }}
            className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium transition-colors"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Hapus Dokumen Ini?</h3>
              <p className="text-sm text-gray-500">
                Tindakan ini bersifat permanen dan tidak dapat dibatalkan. File transkrip dan foto yang berkaitan dengan MoM ini juga akan dihapus.
              </p>
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-3 justify-end">
              <button 
                onClick={() => setShowModal(false)}
                disabled={isDeleting}
                className="bg-white border border-slate-300 text-slate-700 px-5 py-2 rounded-md font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                Batal
              </button>
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 text-white px-5 py-2 rounded-md font-medium hover:bg-red-700 transition-colors shadow-sm flex items-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
