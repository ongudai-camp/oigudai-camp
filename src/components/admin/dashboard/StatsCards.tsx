"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Loader2, AlertCircle } from "lucide-react";

interface Stats {
  hotels: number;
  tours: number;
  activities: number;
  bookings: number;
  users: number;
}

interface StatItem {
  label: string;
  value?: number;
  color: string;
  icon: string;
  href: string;
}

const colorMap: Record<string, string> = {
  "text-sky-600": "text-sky-600",
  "text-blue-600": "text-blue-600",
  "text-indigo-600": "text-indigo-600",
  "text-orange-600": "text-orange-600",
  "text-rose-600": "text-rose-600",
};

const borderColorMap: Record<string, string> = {
  "text-sky-600": "border-sky-100 hover:border-sky-300",
  "text-blue-600": "border-blue-100 hover:border-blue-300",
  "text-indigo-600": "border-indigo-100 hover:border-indigo-300",
  "text-orange-600": "border-orange-100 hover:border-orange-300",
  "text-rose-600": "border-rose-100 hover:border-rose-300",
};

function AnimatedCounter({ value, className }: { value: number; className: string }) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(performance.now());
  const fromRef = useRef(value);

  useEffect(() => {
    fromRef.current = display;
    startRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const progress = Math.min(elapsed / 600, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(fromRef.current + (value - fromRef.current) * eased);
      setDisplay(current);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <span className={className}>{display.toLocaleString()}</span>;
}

export default function StatsCards() {
  const { data, isLoading, error, refetch } = useQuery<Stats>({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded mb-4" />
            <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
            <div className="h-4 w-20 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-red-100 p-6 mb-8">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="text-red-400 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-700">Error loading stats</p>
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

  const stats: StatItem[] = [
    { label: "Отели", value: data?.hotels, color: "text-sky-600", icon: "🏨", href: "/admin/hotels" },
    { label: "Туры", value: data?.tours, color: "text-blue-600", icon: "🗺️", href: "/admin/tours" },
    { label: "Активности", value: data?.activities, color: "text-indigo-600", icon: "🎯", href: "/admin/activities" },
    { label: "Бронирования", value: data?.bookings, color: "text-orange-600", icon: "📋", href: "/admin/bookings" },
    { label: "Пользователи", value: data?.users, color: "text-rose-600", icon: "👥", href: "/admin/users" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
      {stats.map((stat) => (
        <Link
          key={stat.label}
          href={stat.href}
          className={`bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow duration-300 group ${borderColorMap[stat.color] || "border-sky-100"}`}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300" aria-hidden="true">{stat.icon}</span>
            <AnimatedCounter
              value={stat.value ?? 0}
              className={`text-2xl md:text-3xl font-bold ${colorMap[stat.color] || stat.color}`}
            />
          </div>
          <h3 className="text-gray-900 text-sm font-medium">{stat.label}</h3>
        </Link>
      ))}
    </div>
  );
}
