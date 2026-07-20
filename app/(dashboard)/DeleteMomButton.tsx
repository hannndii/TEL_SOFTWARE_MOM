'use client'

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMom } from "./actions";

export default function DeleteMomButton({ momId }: { momId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this meeting minute? This action cannot be undone.")) {
      setIsDeleting(true);
      const res = await deleteMom(momId);
      if (!res.success) {
        alert(res.error || "Failed to delete");
        setIsDeleting(false);
      }
    }
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Delete MoM"
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
    </button>
  );
}
