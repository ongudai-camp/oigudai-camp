"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Calendar, Users, ChevronDown } from "lucide-react";

type Category = "hotels" | "tours" | "activities";

export default function HeroSearchBar() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("hero");
  const [category, setCategory] = useState<Category>("hotels");
  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [guestOpen, setGuestOpen] = useState(false);
  const guestRef = useRef<HTMLDivElement>(null);

  const categories: { key: Category; label: string }[] = [
    { key: "hotels", label: t("search_hotels") },
    { key: "tours", label: t("search_tours") },
    { key: "activities", label: t("search_activities") },
  ];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (guestRef.current && !guestRef.current.contains(e.target as Node)) {
        setGuestOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination.trim()) params.set("q", destination.trim());
    if (guests > 1) params.set("guests", String(guests));
    const qs = params.toString();
    router.push(`/${locale}/${category}${qs ? `?${qs}` : ""}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const today = new Date().toISOString().split("T")[0];

  const guestLabel = guests === 1 ? "1 guest" : `${guests} guests`;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-2xl p-2 sm:p-3">
      {/* Category tabs */}
      <div className="flex gap-1 mb-3 px-1">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
              category === cat.key
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Destination */}
        <div className="flex-1 relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Куда поедем?"
            className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-gray-900 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Check-in */}
        <div className="relative min-w-[140px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar size={18} />
          </div>
          <input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            min={today}
            className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all [color-scheme:light]"
          />
        </div>

        {/* Check-out */}
        <div className="relative min-w-[140px]">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Calendar size={18} />
          </div>
          <input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            min={checkIn || today}
            className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all [color-scheme:light]"
          />
        </div>

        {/* Guests */}
        <div className="relative min-w-[120px]" ref={guestRef}>
          <button
            onClick={() => setGuestOpen(!guestOpen)}
            className="w-full h-14 pl-12 pr-4 bg-gray-50 rounded-xl text-gray-900 font-medium flex items-center gap-2 hover:bg-gray-100 transition-all cursor-pointer"
          >
            <Users size={18} className="text-gray-400 shrink-0" />
            <span className="flex-1 text-left truncate">{guestLabel}</span>
            <ChevronDown size={16} className={`text-gray-400 transition-transform ${guestOpen ? "rotate-180" : ""}`} />
          </button>
          {guestOpen && (
            <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl border border-gray-100 p-4 z-20 min-w-[200px]">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Гости</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(Math.max(1, guests - 1))}
                    disabled={guests <= 1}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-semibold text-gray-900">{guests}</span>
                  <button
                    onClick={() => setGuests(Math.min(20, guests + 1))}
                    disabled={guests >= 20}
                    className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/30 active:scale-95 flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <Search size={20} />
          <span className="hidden sm:inline">Найти</span>
        </button>
      </div>
    </div>
  );
}
