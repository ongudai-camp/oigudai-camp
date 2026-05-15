"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";

interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  revenue: number;
}

export default function BookingStatsCards() {
  const t = useTranslations('admin');

  const { data, isLoading, error, refetch } = useQuery<BookingStats>({
    queryKey: ["admin-booking-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      return json.bookingStats as BookingStats;
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded mb-3" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5 mb-2">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-600">{(error as Error).message}</p>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer ml-auto"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: t('dashboard.bookingStats.total'),
      value: data?.total ?? 0,
      color: "text-blue-600",
      icon: "📋",
    },
    {
      label: t('dashboard.bookingStats.confirmed'),
      value: data?.confirmed ?? 0,
      color: "text-green-600",
      icon: "✅",
    },
    {
      label: t('dashboard.bookingStats.pending'),
      value: data?.pending ?? 0,
      color: "text-yellow-600",
      icon: "⏳",
    },
    {
      label: t('dashboard.bookingStats.revenue'),
      value: data?.revenue ?? 0,
      color: "text-purple-600",
      icon: "₽",
      format: (v: number) => `${v.toLocaleString()} ₽`,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{stat.icon}</span>
            <span className={`text-3xl font-bold ${stat.color}`}>
              {stat.format ? stat.format(stat.value) : stat.value.toLocaleString()}
            </span>
          </div>
          <h3 className="text-gray-900 text-sm font-medium">{stat.label}</h3>
        </div>
      ))}
    </div>
  );
}
