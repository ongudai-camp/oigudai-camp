"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";
import CalendarLegend from "./CalendarLegend";
import DateDetailPopover from "./DateDetailPopover";
import type { CalendarResponse } from "./types";

interface UnifiedCalendarProps {
  type?: "admin" | "customer";
  postId?: number;
  propertyType?: string;
  guests?: number;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  onDateSelect?: (dateStr: string) => void;
  selectedDate?: string;
  selectedDates?: Set<string>;
  onToggleDate?: (dateStr: string) => void;
  showPriceToggle?: boolean;
  locale?: string;
  selectionMode?: "single" | "range";
  rangeStart?: string;
  rangeEnd?: string;
  onRangeSelect?: (start: string, end: string) => void;
  compact?: boolean;
}

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

const STATUS_COLORS: Record<string, string> = {
  available: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  limited: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  full: "bg-red-100 text-red-800 hover:bg-red-200",
  past: "bg-gray-100 text-gray-400",
};

export default function UnifiedCalendar({
  type = "admin",
  postId,
  propertyType,
  onDateSelect,
  selectedDate,
  selectedDates: externalSelectedDates,
  onToggleDate,
  showPriceToggle = true,
  locale = "ru",
  selectionMode = "single",
  rangeStart: externalRangeStart,
  rangeEnd: externalRangeEnd,
  onRangeSelect,
  compact = false,
  guests,
  q,
  minPrice,
  maxPrice,
}: UnifiedCalendarProps) {
  const today = useMemo(() => new Date(), []);
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [detailDate, setDetailDate] = useState<string | null>(null);
  const [showPrices, setShowPrices] = useState(false);
  const [internalSelectedDates, setInternalSelectedDates] = useState<Set<string>>(new Set());
  const [internalRangeStart, setInternalRangeStart] = useState<string | null>(null);
  const [internalRangeEnd, setInternalRangeEnd] = useState<string | null>(null);

  const isAdmin = type === "admin";
  const isRange = selectionMode === "range";
  const selectedDates: Set<string> = isAdmin
    ? (externalSelectedDates || internalSelectedDates)
    : (selectedDate ? new Set([selectedDate]) : new Set());

  const rangeStart = externalRangeStart !== undefined ? externalRangeStart : internalRangeStart;
  const rangeEnd = externalRangeEnd !== undefined ? externalRangeEnd : internalRangeEnd;

  const params = new URLSearchParams({
    year: String(currentYear),
    month: String(currentMonth),
  });
  if (postId) params.set("postId", String(postId));
  if (propertyType) params.set("type", propertyType);
  if (guests && guests > 1) params.set("guests", String(guests));
  if (q) params.set("q", q);
  if (minPrice) params.set("minPrice", String(minPrice));
  if (maxPrice) params.set("maxPrice", String(maxPrice));

  const { data, isLoading, error } = useQuery<CalendarResponse>({
    queryKey: ["calendar", currentYear, currentMonth, postId, propertyType, guests, q, minPrice, maxPrice],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?${params}`);
      if (!res.ok) throw new Error("Failed to fetch calendar data");
      return res.json();
    },
  });

  const prevMonth = useCallback(() => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  }, [currentMonth]);

  const nextMonth = useCallback(() => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  }, [currentMonth]);

  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth - 1, 1).getDay();

  const calendarDays = useMemo(() => {
    const days: Array<{ day: number; dateStr: string }> = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ day: d, dateStr });
    }
    return days;
  }, [daysInMonth, currentYear, currentMonth]);

  const dayNames = DAY_NAMES[locale] || DAY_NAMES.en;
  const monthNames = MONTH_NAMES[locale] || MONTH_NAMES.en;

  const isInRange = (dateStr: string) => {
    if (!rangeStart || !rangeEnd) return false;
    return dateStr >= rangeStart && dateStr <= rangeEnd;
  };

  const isRangeEdge = (dateStr: string) => {
    return dateStr === rangeStart || dateStr === rangeEnd;
  };

  const handleDateClick = (dateStr: string, dateStatus: string) => {
    if (dateStatus === "past") return;

    if (isRange) {
      if (!internalRangeStart || (internalRangeStart && internalRangeEnd)) {
        const newStart = dateStr;
        setInternalRangeStart(newStart);
        setInternalRangeEnd(null);
        if (onRangeSelect) onRangeSelect(newStart, newStart);
      } else {
        if (dateStr <= internalRangeStart) {
          setInternalRangeStart(dateStr);
          setInternalRangeEnd(internalRangeStart);
          if (onRangeSelect) onRangeSelect(dateStr, internalRangeStart);
        } else {
          setInternalRangeEnd(dateStr);
          if (onRangeSelect) onRangeSelect(internalRangeStart, dateStr);
        }
      }
      return;
    }

    if (isAdmin && onToggleDate) {
      onToggleDate(dateStr);
      const next = new Set(selectedDates);
      if (next.has(dateStr)) next.delete(dateStr);
      else next.add(dateStr);
      if (!externalSelectedDates) setInternalSelectedDates(next);
    } else if (onDateSelect) {
      onDateSelect(dateStr);
    }
  };

  const handleCellDoubleClick = (dateStr: string, dateStatus: string) => {
    if (dateStatus === "past" || compact) return;
    setDetailDate(dateStr);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-500">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <AlertCircle size={28} className="text-red-400" />
            <p className="text-sm text-red-600 font-medium">Failed to load calendar</p>
            <p className="text-xs text-gray-400">{(error as Error).message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${compact ? "p-3" : "p-4 sm:p-6"}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Previous month"
        >
          <ChevronLeft size={20} className="text-gray-600" />
        </button>

        <h2 className={`font-bold text-gray-900 ${compact ? "text-base" : "text-lg"}`}>
          {monthNames[currentMonth - 1]} {currentYear}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Next month"
        >
          <ChevronRight size={20} className="text-gray-600" />
        </button>
      </div>

      {data?.summary && !compact && (
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            {data.summary.availableDates} free
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            {data.summary.limitedDates} limited
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            {data.summary.fullDates} booked
          </span>
        </div>
      )}

      {isRange && (
        <div className="flex items-center gap-2 mb-3 text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          {rangeStart && !rangeEnd ? "Select check-out date" : rangeStart && rangeEnd ? `Selected: ${rangeStart} → ${rangeEnd}` : "Select check-in date"}
        </div>
      )}

      <div className="grid grid-cols-7 gap-1 mb-1">
        {dayNames.map((d) => (
          <div key={d} className={`text-center font-bold text-gray-500 uppercase tracking-wider py-2 ${compact ? "text-[10px]" : "text-[11px]"}`}>
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: firstDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} />
        ))}

        {calendarDays.map(({ day, dateStr }) => {
          const dateInfo = data?.dates[dateStr];
          const status = dateInfo?.status || "available";
          const isPast = status === "past";
          const isCurrentDay = dateStr === today.toISOString().split("T")[0];

          const inRange = isRange && isInRange(dateStr);
          const isEdge = isRange && isRangeEdge(dateStr);

          let cellClass = STATUS_COLORS[status] || "bg-gray-50 text-gray-700";

          if (isRange && inRange && !isEdge) {
            cellClass = "bg-blue-100 text-blue-800";
          }

          if (isRange && isEdge) {
            cellClass = "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-400 ring-offset-2";
          }

          if (!isRange && selectedDates.has(dateStr)) {
            cellClass = "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-400 ring-offset-2";
          }

          if (isPast) {
            cellClass = "bg-gray-50 text-gray-300 cursor-not-allowed";
          }

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(dateStr, status)}
              onDoubleClick={() => handleCellDoubleClick(dateStr, status)}
              disabled={isPast && !isAdmin}
              className={clsx(
                "relative flex flex-col items-center justify-center transition-all duration-300 rounded-[1rem]",
                compact ? "h-14" : "h-20 sm:h-24",
                isPast && !isAdmin ? "opacity-30 cursor-not-allowed" : "cursor-pointer hover:shadow-lg hover:-translate-y-0.5",
                cellClass
              )}
              title={dateInfo ? `${dateStr}: ${dateInfo.totalAvailable} available, ${dateInfo.totalBooked} booked` : dateStr}
            >
              <span className={clsx(
                "text-sm font-black",
                isCurrentDay && !isEdge && "bg-blue-100 text-blue-600 w-7 h-7 rounded-full flex items-center justify-center",
                isEdge && "text-white"
              )}>
                {day}
              </span>
              
              {/* Price or Info */}
              {!isPast && dateInfo && (
                <div className="mt-1 flex flex-col items-center gap-0.5">
                  {dateInfo.minPrice !== null ? (
                    <span className={clsx(
                      "text-[10px] font-black tracking-tight",
                      isEdge ? "text-blue-100" : "text-blue-600"
                    )}>
                      ₽{dateInfo.minPrice.toLocaleString()}
                    </span>
                  ) : !isAdmin && (
                    <span className="text-[8px] uppercase tracking-tighter opacity-40 font-bold">N/A</span>
                  )}
                  
                  {/* Status Dots */}
                  <div className="flex gap-0.5 mt-1">
                     <span className={clsx(
                       "w-1 h-1 rounded-full",
                       status === 'available' ? "bg-emerald-400" : status === 'limited' ? "bg-amber-400" : "bg-red-400"
                     )} />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {!compact && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <CalendarLegend />
          {showPriceToggle && (
            <button
              onClick={() => setShowPrices(!showPrices)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-colors cursor-pointer ${
                showPrices
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {showPrices ? "Show availability" : "Show prices"}
            </button>
          )}
        </div>
      )}

      {detailDate && data?.dates[detailDate] && (
        <DateDetailPopover
          dateStr={detailDate}
          properties={data.dates[detailDate].properties}
          totalAvailable={data.dates[detailDate].totalAvailable}
          totalBooked={data.dates[detailDate].totalBooked}
          minPrice={data.dates[detailDate].minPrice}
          onClose={() => setDetailDate(null)}
        />
      )}
    </div>
  );
}
