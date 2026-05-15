"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface PayButtonProps {
  bookingId: number;
}

export default function PayButton({ bookingId }: PayButtonProps) {
  const t = useTranslations("forms.booking");
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("error"));
      }

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        alert("Оплата в режиме разработки. В продакшене вы будете перенаправлены на страницу оплаты.");
        window.location.reload();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePay}
      disabled={loading}
      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <CreditCard size={16} />
      )}
      {loading ? t("paymentPending") : t("payNow")}
    </button>
  );
}
