"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CalendarDays, Users, Minus, Plus, ChevronRight, LogIn, Clock, UsersRound } from "lucide-react";

interface SimpleBookingFormProps {
  postId: number;
  type: string;
  price: number;
  title?: string;
  duration?: string;
  groupSize?: string;
}

export default function SimpleBookingForm({ postId, type, price, title, duration, groupSize }: SimpleBookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("forms.booking");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [formData, setFormData] = useState({
    date: "",
    guests: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const total = formData.guests * price;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push(`/${locale}/auth/signin?callbackUrl=` + encodeURIComponent(window.location.href));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          checkIn: formData.date,
          guests: formData.guests,
          totalPrice: total,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || t("error"));
      }

      const booking = await res.json();
      router.push(`/${locale}/dashboard/bookings/${booking.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white rounded-[2rem] shadow-xl border border-sky-100/50 overflow-hidden backdrop-blur-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-5">
        <h3 className="text-white text-lg font-black tracking-tight flex items-center gap-3">
          <CalendarDays size={20} className="text-emerald-300" />
          {t("title")}
        </h3>
      </div>

      {/* Info Bar */}
      <div className="mx-6 mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block">
            {type === "tour" ? t("typeTour") : t("typeActivity")}
          </span>
          {title && <span className="font-bold text-sm text-emerald-950">{title}</span>}
          <div className="flex items-center gap-4 text-xs text-emerald-600">
            {duration && (
              <span className="flex items-center gap-1.5">
                <Clock size={12} /> {duration}
              </span>
            )}
            {groupSize && (
              <span className="flex items-center gap-1.5">
                <UsersRound size={12} /> до {groupSize} чел.
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="font-black text-2xl text-emerald-600">
            {price.toLocaleString()} ₽
          </div>
          <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
            / {tc("perPerson")}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Date */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <CalendarDays size={12} /> {t("date")}
          </label>
          <div className="relative">
            <input
              type="date"
              required
              min={today}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-4 text-sm font-bold text-emerald-950 outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all [color-scheme:light]"
            />
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Users size={12} /> {t("guests")}
          </label>
          <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 rounded-2xl px-5 py-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
              disabled={formData.guests <= 1}
              className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="font-black text-xl text-emerald-950 tabular-nums">{formData.guests}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, guests: Math.min(20, formData.guests + 1) })}
              disabled={formData.guests >= 20}
              className="w-10 h-10 rounded-xl bg-white border border-emerald-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-100/50">
          <div className="flex justify-between items-center">
            <span className="text-emerald-600 font-medium">
              {price.toLocaleString()} ₽ × {formData.guests} {tc("guests")}
            </span>
          </div>
          <div className="border-t border-emerald-200/50 pt-3 mt-3 flex justify-between items-center">
            <span className="font-black text-emerald-950">{t("total")}</span>
            <span className="font-black text-2xl text-emerald-500">
              {total.toLocaleString()} ₽
            </span>
          </div>
        </div>

        {/* Submit */}
        {!session ? (
          <button
            type="button"
            onClick={() => router.push(`/${locale}/auth/signin?callbackUrl=` + encodeURIComponent(window.location.href))}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <LogIn size={18} />
            {t("loginToBook") || "Войдите для бронирования"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || total === 0}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {tc("loading")}
              </span>
            ) : (
              <>
                {t("submit") || "Забронировать"} <ChevronRight size={18} />
              </>
            )}
          </button>
        )}
      </form>
    </div>
  );
}
