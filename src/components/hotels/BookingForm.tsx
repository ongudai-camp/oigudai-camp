"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CalendarDays, Users, Minus, Plus, ChevronRight, LogIn } from "lucide-react";

interface Room {
  id: number;
  title: string;
  price: number;
  salePrice: number | null;
}

interface BookingFormProps {
  hotelId: number;
  rooms: Room[];
}

export default function BookingForm({ hotelId, rooms }: BookingFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const t = useTranslations("forms.booking");
  const tc = useTranslations("common");
  const locale = useLocale();

  const [formData, setFormData] = useState({
    checkIn: "",
    checkOut: "",
    guests: 1,
    roomId: rooms.length > 0 ? rooms[0].id : 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedRoom = rooms.find((r) => r.id === formData.roomId);
  const pricePerNight = selectedRoom ? selectedRoom.salePrice || selectedRoom.price : 0;

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    return Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const total = nights * pricePerNight;

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
          postId: hotelId,
          roomId: formData.roomId || null,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
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
      <div className="bg-gradient-to-r from-sky-950 to-sky-900 px-6 py-5">
        <h3 className="text-white text-lg font-black tracking-tight flex items-center gap-3">
          <CalendarDays size={20} className="text-sky-400" />
          {t("title")}
        </h3>
      </div>

      {error && (
        <div className="mx-6 mt-5 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3">
          <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Room Selection */}
        {rooms.length > 0 && (
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-sky-300">
              {t("room")}
            </label>
            <div className="space-y-2">
              {rooms.map((room) => {
                const isSelected = formData.roomId === room.id;
                const roomPrice = room.salePrice || room.price;
                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, roomId: room.id })}
                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-sky-500 bg-sky-50 shadow-md shadow-sky-500/10"
                        : "border-sky-100 bg-white hover:border-sky-200 hover:bg-sky-50/50"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-bold text-sm ${isSelected ? "text-sky-950" : "text-sky-700"}`}>
                        {room.title}
                      </span>
                      <span className={`font-black text-sm ${isSelected ? "text-orange-500" : "text-sky-500"}`}>
                        {roomPrice.toLocaleString()} ₽
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-sky-300 flex items-center gap-2">
              <CalendarDays size={12} /> {t("checkIn")}
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={today}
                value={formData.checkIn}
                onChange={(e) => {
                  setFormData({ ...formData, checkIn: e.target.value });
                  if (formData.checkOut && e.target.value > formData.checkOut) {
                    setFormData((prev) => ({ ...prev, checkIn: e.target.value, checkOut: "" }));
                  }
                }}
                className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-sky-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all [color-scheme:light]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-sky-300 flex items-center gap-2">
              <CalendarDays size={12} /> {t("checkOut")}
            </label>
            <div className="relative">
              <input
                type="date"
                required
                min={formData.checkIn || today}
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                className="w-full bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-4 text-sm font-bold text-sky-950 outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all [color-scheme:light]"
              />
            </div>
          </div>
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-sky-300 flex items-center gap-2">
            <Users size={12} /> {t("guests")}
          </label>
          <div className="flex items-center justify-between bg-sky-50/50 border border-sky-100 rounded-2xl px-5 py-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
              disabled={formData.guests <= 1}
              className="w-10 h-10 rounded-xl bg-white border border-sky-100 flex items-center justify-center text-sky-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="font-black text-xl text-sky-950 tabular-nums">{formData.guests}</span>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, guests: Math.min(10, formData.guests + 1) })}
              disabled={formData.guests >= 10}
              className="w-10 h-10 rounded-xl bg-white border border-sky-100 flex items-center justify-center text-sky-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Price Summary */}
        <div className="bg-sky-50/50 rounded-2xl p-5 space-y-3 border border-sky-100/50">
          <div className="flex justify-between text-sm">
            <span className="text-sky-600 font-medium">
              {pricePerNight.toLocaleString()} ₽ × {nights} {t("nights") || "ночей"}
            </span>
            <span className="font-bold text-sky-950">{(pricePerNight * nights).toLocaleString()} ₽</span>
          </div>
          <div className="border-t border-sky-200/50 pt-3 flex justify-between items-center">
            <span className="font-black text-sky-950">{t("total")}</span>
            <span className="font-black text-2xl text-orange-500">
              {total.toLocaleString()} ₽
            </span>
          </div>
        </div>

        {/* Submit */}
        {!session ? (
          <button
            type="button"
            onClick={() => router.push(`/${locale}/auth/signin?callbackUrl=` + encodeURIComponent(window.location.href))}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <LogIn size={18} />
            {t("loginToBook") || "Войдите для бронирования"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={loading || total === 0}
            className="w-full bg-sky-950 hover:bg-sky-900 text-white py-5 rounded-[1.25rem] font-black text-sm uppercase tracking-[0.15em] shadow-xl shadow-sky-950/20 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
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
