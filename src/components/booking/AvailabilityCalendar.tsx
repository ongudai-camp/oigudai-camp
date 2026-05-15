"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface AvailabilityCalendarProps {
  postId: number;
  roomId?: number | null;
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

export default function AvailabilityCalendar({ postId, roomId, selectedDate, onSelectDate }: AvailabilityCalendarProps) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));

  const { data: availabilities, isLoading } = useQuery({
    queryKey: ["availability-calendar", postId, roomId, currentDate.getFullYear(), currentDate.getMonth() + 1],
    queryFn: async () => {
      const params = new URLSearchParams({
        postId: String(postId),
        year: String(currentDate.getFullYear()),
        month: String(currentDate.getMonth() + 1),
      });
      if (roomId) params.set("roomId", String(roomId));
      const res = await fetch(`/api/admin/availability?${params}`);
      if (!res.ok) return [];
      return res.json() as Promise<Array<{ date: string; status: string }>>;
    },
    enabled: true,
  });

  const prevMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const days = useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const availabilityMap = useMemo(() => {
    const map = new Map<string, string>();
    if (availabilities) {
      for (const a of availabilities) {
        map.set(a.date.split("T")[0], a.status);
      }
    }
    return map;
  }, [availabilities]);

  const firstDayOfWeek = getDay(startOfMonth(currentDate));

  return (
    <div className="bg-white rounded-2xl border border-sky-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <button
          onClick={prevMonth}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronLeft size={16} className="text-gray-500" />
        </button>
        <div className="font-bold text-sm text-sky-950">
          {format(currentDate, "LLLL yyyy", { locale: ru })}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <ChevronRight size={16} className="text-gray-500" />
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 size={20} className="animate-spin text-gray-400" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"].map((d) => (
              <div key={d} className="text-center text-[10px] font-bold text-sky-600 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`e-${i}`} />
            ))}
            {days.map((day) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const avail = availabilityMap.get(dateStr);
              const isPast = isBefore(day, today);
              const isSelected = selectedDate === dateStr;
              const isAvailable = !avail || avail === "available";

              return (
                <button
                  key={dateStr}
                  onClick={() => !isPast && isAvailable && onSelectDate?.(dateStr)}
                  disabled={isPast || !isAvailable}
                  className={`aspect-square rounded-lg text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-sky-500 text-white ring-2 ring-sky-300 ring-offset-1"
                      : isPast
                      ? "text-gray-300 cursor-not-allowed"
                      : isAvailable
                      ? "bg-sky-50 text-sky-700 hover:bg-sky-100"
                      : "bg-red-50 text-red-400 cursor-not-allowed"
                  }`}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
