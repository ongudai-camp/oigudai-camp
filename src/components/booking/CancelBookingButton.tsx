"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, X, Loader2 } from "lucide-react";

interface CancelBookingButtonProps {
  bookingId: number;
  locale: string;
}

export default function CancelBookingButton({ bookingId, locale }: CancelBookingButtonProps) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId,
          status: "cancelled",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Error cancelling booking");
      }

      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error cancelling booking");
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-red-600 flex items-center gap-2">
          <AlertTriangle size={16} />
          Отменить бронирование?
        </span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            "Да, отменить"
          )}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="bg-sky-100 hover:bg-sky-200 text-sky-700 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
        >
          Нет
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center gap-2"
    >
      <X size={16} />
      Отменить бронирование
    </button>
  );
}
