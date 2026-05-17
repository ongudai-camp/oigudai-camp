"use client";

import { useState, useRef, useEffect } from "react";
import { Search, Users, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import clsx from "clsx";

interface CalendarSearchProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: Partial<SearchFilters>;
}

export interface SearchFilters {
  q: string;
  guests: number;
  type: string;
  minPrice?: number;
  maxPrice?: number;
}

export default function CalendarSearch({ onSearch, initialFilters }: CalendarSearchProps) {
  const tc = useTranslations("common");
  const tl = useTranslations("listing");
  const td = useTranslations("dashboard");
  
  const [q, setQ] = useState(initialFilters?.q || "");
  const [guests, setGuests] = useState(initialFilters?.guests || 1);
  const [type, setType] = useState(initialFilters?.type || "");
  const [guestOpen, setGuestOpen] = useState(false);
  
  const guestRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setGuestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleApply = () => {
    onSearch({ q, guests, type });
  };

  const TYPE_OPTIONS = [
    { value: "", label: tl("all") },
    { value: "hotel", label: td("hotels") },
    { value: "tour", label: td("tours") },
    { value: "activity", label: td("activities") },
  ];

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-sky-100 p-2 sm:p-3 mb-8">
      <div className="flex flex-col lg:flex-row gap-2">
        {/* Destination/Property Name */}
        <div className="flex-1 relative group">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-sky-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
            placeholder={tl("searchPlaceholder") || "Куда поедем?"}
            className="w-full h-16 pl-14 pr-6 bg-sky-50/50 border border-transparent rounded-[1.25rem] text-gray-900 font-bold placeholder:text-sky-900/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-white transition-all text-lg"
          />
        </div>

        {/* Type Selector */}
        <div className="relative min-w-[200px]">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full h-16 pl-6 pr-10 bg-sky-50/50 border border-transparent rounded-[1.25rem] text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white appearance-none cursor-pointer transition-all"
          >
            {TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-sky-400 pointer-events-none" />
        </div>

        {/* Guests */}
        <div className="relative min-w-[180px]" ref={guestRef}>
          <button
            onClick={() => setGuestOpen(!guestOpen)}
            className="w-full h-16 px-6 bg-sky-50/50 border border-transparent rounded-[1.25rem] text-gray-900 font-bold flex items-center justify-between hover:bg-sky-100/50 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <Users size={20} className="text-sky-400" />
              <span>{guests} {tc("guests")}</span>
            </div>
            <ChevronDown size={18} className={clsx("text-sky-400 transition-transform", guestOpen && "rotate-180")} />
          </button>
          
          {guestOpen && (
            <div className="absolute top-full mt-3 right-0 left-0 lg:left-auto lg:w-64 bg-white rounded-2xl shadow-2xl border border-sky-50 p-5 z-30 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{tc("guests")}</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="w-10 h-10 rounded-xl border-2 border-sky-50 flex items-center justify-center text-gray-600 hover:bg-sky-50 disabled:opacity-30 transition-colors"
                  >
                    -
                  </button>
                  <span className="font-black text-lg text-gray-900 w-4 text-center">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    disabled={guests >= 20}
                    className="w-10 h-10 rounded-xl border-2 border-sky-50 flex items-center justify-center text-gray-600 hover:bg-sky-50 disabled:opacity-30 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleApply}
          className="h-16 px-10 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.25rem] transition-all hover:shadow-xl hover:shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-3 cursor-pointer shrink-0 uppercase tracking-widest text-sm"
        >
          <span>{tl("find")}</span>
        </button>
      </div>
    </div>
  );
}
