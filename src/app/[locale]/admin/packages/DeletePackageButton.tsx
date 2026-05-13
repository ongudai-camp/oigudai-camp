"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeletePackageButton({ id }: { id: number }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: "DELETE" });
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
      <span className="inline-flex gap-1 flex-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex-1 text-center bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-medium transition-colors cursor-pointer disabled:opacity-50"
        >
          {deleting ? "…" : "Да, удалить"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 text-center bg-gray-50 text-[#1A2B48] py-2 rounded-lg hover:bg-gray-100 font-medium transition-colors cursor-pointer"
        >
          Отмена
        </button>
      </span>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex-1 text-center bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 font-medium transition-colors cursor-pointer"
    >
      Удалить
    </button>
  );
}
