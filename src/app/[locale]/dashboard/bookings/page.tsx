"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru, enUS, kk, type Locale } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { CalendarDays, MapPin, Users, ChevronRight, SearchX } from "lucide-react";

interface Booking {
  id: number;
  bookingId: string;
  checkIn: string;
  checkOut: string | null;
  guests: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  post: { title: string };
  room: { title: string } | null;
}

const STATUSES = ["all", "pending", "confirmed", "completed", "cancelled"] as const;

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  cancelled: "bg-red-100 text-red-800",
  completed: "bg-blue-100 text-blue-800",
};

const PAYMENT_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800",
  unpaid: "bg-yellow-100 text-yellow-800",
  refunded: "bg-gray-100 text-gray-800",
};

const dateLocales: Record<string, Locale> = { ru, en: enUS, kk };

export default function UserBookingsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  const STATUS_LABELS: Record<string, string> = {
    all: t("dashboard.filters.all"),
    pending: t("dashboard.filters.pending"),
    confirmed: t("dashboard.filters.confirmed"),
    completed: t("dashboard.filters.completed"),
    cancelled: t("dashboard.filters.cancelled"),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["user-bookings", { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status !== "all") params.set("status", status);
      params.set("page", String(page));
      params.set("limit", "10");
      const res = await fetch(`/api/bookings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json() as Promise<Booking[]>;
    },
  });

  const bookings = data ?? [];

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t("dashboard.myBookings")}</h1>
            <p className="text-sm text-gray-500 mt-1">{t("dashboard.bookingsDescription")}</p>
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            &larr; {t("dashboard.backToDashboard")}
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex gap-2 flex-wrap">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => { setStatus(s); setPage(1); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                  status === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {isLoading && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {t("common.error")}: {(error as Error).message}
          </div>
        )}

        {!isLoading && !error && bookings.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <SearchX size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">{t("dashboard.noBookings")}</p>
            <Link
              href={`/${locale}/hotels`}
              className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              {t("dashboard.findHotel")}
            </Link>
          </div>
        )}

        {!isLoading && !error && bookings.length > 0 && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Link
                key={booking.id}
                href={`/${locale}/dashboard/bookings/${booking.id}`}
                className="block bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 group"
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{booking.post.title}</h3>
                      {booking.room && (
                        <span className="text-sm text-gray-500 hidden md:inline">· {booking.room.title}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <CalendarDays size={14} />
                        {format(new Date(booking.checkIn), "dd MMM yyyy", { locale: dateLocales[locale] || enUS })}
                        {booking.checkOut && (
                          <> — {format(new Date(booking.checkOut), "dd MMM yyyy", { locale: dateLocales[locale] || enUS })}</>
                        )}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} /> {booking.guests} {t("common.guests")}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-mono mt-1">{booking.bookingId}</p>
                  </div>

                  <div className="flex items-center gap-4 md:text-right">
                    <div>
                      <p className="font-bold text-lg text-gray-900">{booking.totalPrice.toLocaleString()} ₽</p>
                      <div className="flex gap-1.5 mt-1">
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-800"}`}>
                          {t(`dashboard.filters.${booking.status}`)}
                        </span>
                        <span className={`px-2.5 py-0.5 text-xs rounded-full font-medium ${PAYMENT_STYLES[booking.paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                          {t(`dashboard.paymentStatus.${booking.paymentStatus}`)}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
