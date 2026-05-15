"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle } from "lucide-react";

interface UserStats {
  totalBookings: number;
  confirmed: number;
  pending: number;
  totalSpent: number;
}

export default function UserStatsCards() {
  const { data, isLoading, error, refetch } = useQuery<UserStats>({
    queryKey: ["user-stats"],
    queryFn: async () => {
      const res = await fetch("/api/user/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
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
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-5">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Failed to load stats</p>
            <p className="text-xs text-red-500 mt-0.5">{(error as Error).message}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="text-xs font-bold text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const cards = [
    { labelKey: "total", icon: "📋", value: data?.totalBookings ?? 0, color: "text-blue-600" },
    { labelKey: "confirmed", icon: "✅", value: data?.confirmed ?? 0, color: "text-green-600" },
    { labelKey: "pending", icon: "⏳", value: data?.pending ?? 0, color: "text-yellow-600" },
    {
      labelKey: "spent",
      icon: "₽",
      value: (data?.totalSpent ?? 0).toLocaleString(),
      color: "text-purple-600",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.labelKey}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
            <span className={`text-3xl font-bold ${card.color}`}>{card.value}</span>
          </div>
          <h3 className="text-gray-900 text-sm font-medium">
            {card.labelKey === "total" && "Всего бронирований"}
            {card.labelKey === "confirmed" && "Подтверждено"}
            {card.labelKey === "pending" && "Ожидают"}
            {card.labelKey === "spent" && "Потрачено"}
          </h3>
        </div>
      ))}
    </div>
  );
}
