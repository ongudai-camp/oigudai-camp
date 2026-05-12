"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useTranslations } from "next-intl";

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
  user: { name: string | null; email: string | null };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  unpaid: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
};

export default function AdminBookingsPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const STATUS_LABELS: Record<string, string> = {
    all: t('admin.bookings.filters.all'),
    pending: t('admin.bookings.filters.pending'),
    confirmed: t('admin.bookings.filters.confirmed'),
    completed: t('admin.bookings.filters.completed'),
    cancelled: t('admin.bookings.filters.cancelled'),
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-bookings", { status, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ status, page: String(page), limit: "10" });
      const res = await fetch(`/api/admin/bookings?${params}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      return res.json() as Promise<{ bookings: Booking[]; pagination: Pagination }>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: { id: number; status?: string; paymentStatus?: string }) => {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
      setUpdatingId(null);
    },
  });

  const handleStatusChange = (id: number, newStatus: string) => {
    setUpdatingId(id);
    updateMutation.mutate({ id, status: newStatus });
  };

  const handlePaymentChange = (id: number, paymentStatus: string) => {
    setUpdatingId(id);
    updateMutation.mutate({ id, paymentStatus });
  };

  const bookings = data?.bookings ?? [];
  const pagination = data?.pagination;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('admin.bookings.title')}</h1>

      {/* Filters */}
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

      {/* Loading */}
      {isLoading && (
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {t('admin.bookings.error')} {(error as Error).message}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && (
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
           {bookings.length === 0 ? (
             <div className="text-center py-8 text-gray-500">
               {t('admin.bookings.empty')}
             </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.id')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.object')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.guest')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.checkInOut')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.amount')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.status')}</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.payment')}</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('admin.bookings.table.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-6 py-4 text-sm font-mono text-gray-900">{booking.bookingId}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{booking.post.title}</div>
                        {booking.room && (
                          <div className="text-sm text-gray-500">{booking.room.title}</div>
                        )}
                      </td>
                       <td className="px-6 py-4">
                         <div className="text-sm font-medium text-gray-900">
                           {booking.user.name || t('admin.bookings.guestUnknown')}
                         </div>
                         <div className="text-sm text-gray-500">{booking.user.email}</div>
                       </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {format(new Date(booking.checkIn), "dd MMM", { locale: ru })}
                        {booking.checkOut
                          ? ` — ${format(new Date(booking.checkOut), "dd MMM yyyy", { locale: ru })}`
                          : ""}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {booking.totalPrice} ₽
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${STATUS_STYLES[booking.status] || "bg-gray-100 text-gray-800"}`}>
                          {STATUS_LABELS[booking.status] || booking.status}
                        </span>
                      </td>
                       <td className="px-6 py-4">
                         <span className={`px-3 py-1 text-xs rounded-full ${PAYMENT_STYLES[booking.paymentStatus] || "bg-gray-100 text-gray-800"}`}>
                           {t(`admin.bookings.paymentStatus.${booking.paymentStatus}`)}
                         </span>
                       </td>
                      <td className="px-6 py-4 text-right">
                        {updatingId === booking.id ? (
                          <span className="text-sm text-gray-400">...</span>
                        ) : (
                          <div className="flex gap-1 justify-end">
                            <select
                              value={booking.status}
                              onChange={(e) => handleStatusChange(booking.id, e.target.value)}
                              className="text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer"
                            >
                              {STATUSES.filter((s) => s !== "all").map((s) => (
                                <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                              ))}
                            </select>
                             <select
                               value={booking.paymentStatus}
                               onChange={(e) => handlePaymentChange(booking.id, e.target.value)}
                               className="text-xs border border-gray-200 rounded px-2 py-1 cursor-pointer"
                             >
                               {["paid", "unpaid", "refunded"].map((p) => (
                                 <option key={p} value={p}>{t(`admin.bookings.paymentStatus.${p}`)}</option>
                               ))}
                             </select>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                page === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
