"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { CalendarResponse } from "./types";

interface AdminOverviewCalendarProps {
  locale?: string;
}

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-300",
  limited: "bg-amber-300",
  full: "bg-red-300",
  past: "bg-gray-100",
};

const DAY_NAMES: Record<string, string[]> = {
  ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"],
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  kk: ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сб"],
};

const MONTH_NAMES: Record<string, string[]> = {
  ru: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  kk: ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"],
};

export default function AdminOverviewCalendar({ locale = "en" }: AdminOverviewCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const { data: properties } = useQuery({
    queryKey: ["admin-all-properties-overview"],
    queryFn: async () => {
      const res = await fetch("/api/admin/hotels");
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      return (Array.isArray(data) ? data : data.hotels || data.posts || []) as Array<{
        id: number; title: string; type: string;
      }>;
    },
  });

  const { data: calendar, isLoading } = useQuery<CalendarResponse>({
    queryKey: ["calendar", year, month, undefined, undefined],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?year=${year}&month=${month}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayOfWeek = new Date(year, month - 1, 1).getDay();
  const dayNames = DAY_NAMES[locale] || DAY_NAMES.en;
  const monthNames = MONTH_NAMES[locale] || MONTH_NAMES.en;

  const prevMonth = () => {
    if (month === 1) { setYear((y) => y - 1); setMonth(12); }
    else setMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear((y) => y + 1); setMonth(1); }
    else setMonth((m) => m + 1);
  };

  const propertyList = properties || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <ChevronLeft size={18} className="text-gray-600" />
        </button>
        <h3 className="font-bold text-gray-900 text-base">{monthNames[month - 1]} {year}</h3>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <ChevronRight size={18} className="text-gray-600" />
        </button>
      </div>

      {propertyList.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No properties found</p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              <th className="text-left text-gray-500 font-bold uppercase tracking-wider py-1 pr-3 sticky left-0 bg-white min-w-[140px]">Property</th>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <th key={`empty-${i}`} className="w-7" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dateObj = new Date(year, month - 1, day);
                const isToday = dateObj.toDateString() === today.toDateString();
                return (
                  <th key={day} className={`w-7 text-center font-bold py-1 ${isToday ? "text-blue-600" : "text-gray-500"}`}>
                    {day}
                  </th>
                );
              })}
            </tr>
            <tr>
              <th />
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <th key={`empty-name-${i}`} className="w-7" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dow = new Date(year, month - 1, day).getDay();
                return (
                  <th key={`name-${day}`} className="w-7 text-center text-[9px] text-gray-400 font-normal pb-1">
                    {dayNames[dow]}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {propertyList.map((prop) => (
              <tr key={prop.id} className="border-t border-gray-50">
                <td className="py-1.5 pr-3 sticky left-0 bg-white font-medium text-gray-700 text-xs truncate max-w-[140px]">
                  {prop.title}
                </td>
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <td key={`empty-${i}`} className="w-7 h-5" />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dateInfo = calendar?.dates?.[dateStr];
                  const propForDate = dateInfo?.properties
                    ? Object.values(dateInfo.properties).flat().find((p) => p.id === prop.id)
                    : null;
                  const status = propForDate?.status || (dateInfo ? "available" : "past");
                  const isPast = new Date(dateStr) < new Date(today.toISOString().split("T")[0]);

                  return (
                    <td
                      key={day}
                      className={`w-7 h-5 rounded-sm ${isPast ? "bg-gray-50" : STATUS_COLORS[status] || "bg-gray-100"}`}
                      title={`${prop.title} — ${dateStr}: ${status}`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
