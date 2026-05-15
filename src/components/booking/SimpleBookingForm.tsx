"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { CalendarDays, Users, Minus, Plus, ChevronRight, LogIn, Clock, UsersRound, AlertCircle } from "lucide-react";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";
import GuestDetailsForm from "./GuestDetailsForm";
import AddonSelector from "./AddonSelector";
import PromoCodeInput from "./PromoCodeInput";
import PriceBreakdown from "./PriceBreakdown";

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
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    specialRequests: "",
  });
  const [selectedAddons, setSelectedAddons] = useState<number[]>([]);
  const [addonPrices, setAddonPrices] = useState<number[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const baseTotal = formData.guests * price;
  const addonsTotal = addonPrices.reduce((sum, p) => sum + p, 0);
  const grandTotal = baseTotal + addonsTotal - promoDiscount;

  const handleDateSelect = (dateStr: string) => {
    setFormData({ ...formData, date: dateStr });
    setError("");
  };

  const handleAddonToggle = (id: number, addonPrice: number) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
    setAddonPrices((prev) =>
      prev.includes(addonPrice)
        ? prev.filter((p) => p !== addonPrice)
        : [...prev, addonPrice]
    );
  };

  const handlePromoApply = (_code: string, discount: number) => {
    setPromoCode(_code);
    setPromoDiscount(discount);
  };

  const handlePromoRemove = () => {
    setPromoCode(null);
    setPromoDiscount(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push(`/${locale}/auth/signin?callbackUrl=` + encodeURIComponent(window.location.href));
      return;
    }

    if (grandTotal <= 0 && !formData.date) return;

    setLoading(true);
    setError("");

    try {
      const checkRes = await fetch(`/api/availability/check?postId=${postId}&checkIn=${formData.date}`);
      const checkData = await checkRes.json();
      if (!checkData.available) {
        throw new Error(checkData.conflict || "Selected date is not available");
      }
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : String(err));
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          checkIn: formData.date,
          guests: formData.guests,
          totalPrice: baseTotal,
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          specialRequests: formData.specialRequests,
          promoCode,
          discountAmount: promoDiscount,
          addonIds: selectedAddons,
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
      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 px-6 py-5">
        <h3 className="text-white text-lg font-black tracking-tight flex items-center gap-3">
          <CalendarDays size={20} className="text-emerald-500" />
          {t("title")}
        </h3>
      </div>

      <div className="mx-6 mt-5 bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 block">
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
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
            / {tc("perPerson")}
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm font-medium flex items-center gap-3">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Calendar */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
            <CalendarDays size={12} /> {t("date")}
          </label>
          <UnifiedCalendar
            type="customer"
            postId={postId}
            propertyType={type}
            onDateSelect={handleDateSelect}
            selectedDate={formData.date}
            locale="ru"
            compact
          />
          <input
            type="date"
            required
            min={today}
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="hidden"
          />
        </div>

        {/* Guests */}
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2">
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

        {/* Add-ons */}
        <AddonSelector
          postId={postId}
          selectedIds={selectedAddons}
          onToggle={handleAddonToggle}
        />

        {/* Guest Details */}
        <GuestDetailsForm
          guestName={formData.guestName}
          guestEmail={formData.guestEmail}
          guestPhone={formData.guestPhone}
          specialRequests={formData.specialRequests}
          onChange={(field, value) => setFormData({ ...formData, [field]: value })}
        />

        {/* Promo Code */}
        <PromoCodeInput
          total={baseTotal}
          onApply={handlePromoApply}
          onRemove={handlePromoRemove}
          appliedCode={promoCode}
          discount={promoDiscount}
        />

        {/* Price Summary */}
        <PriceBreakdown
          label={type === "tour" ? "Tour" : "Activity"}
          unitPrice={price}
          quantity={formData.guests}
          quantityLabel={tc("guests")}
          total={baseTotal}
          serviceFee={0}
          discount={promoDiscount}
          grandTotal={grandTotal}
        />

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
            disabled={loading || grandTotal <= 0 || !formData.date}
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
