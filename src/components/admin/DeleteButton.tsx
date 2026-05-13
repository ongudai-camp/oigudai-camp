"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DeleteButtonProps {
  id: number;
  type: "hotels" | "tours" | "activities";
  label?: string;
}

export default function DeleteButton({ id, type, label = "Удалить" }: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/${type}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Ошибка удаления");
      router.refresh();
    } catch {
      alert("Ошибка при удалении");
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  };

  if (confirming) {
    return (
      <span className="inline-flex gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-700 text-sm font-medium px-2 py-1 bg-red-50 rounded hover:bg-red-100 cursor-pointer transition-colors duration-200 disabled:opacity-50"
        >
          {deleting ? "…" : "Да, удалить"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[#1A2B48] text-sm px-2 py-1 hover:text-gray-700 cursor-pointer transition-colors duration-200"
        >
          Отмена
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="text-red-600 hover:text-red-900 cursor-pointer transition-colors duration-200"
    >
      {label}
    </button>
  );
}
