"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";
import CalendarSearch, { type SearchFilters } from "@/components/calendar/CalendarSearch";
import CalendarResults from "@/components/calendar/CalendarResults";
import { Sparkles, MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CustomerCalendarPage() {
  const t = useTranslations("calendar");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [filters, setFilters] = useState<SearchFilters>({
    q: "",
    guests: 1,
    type: "",
  });

  const [selectedRange, setSelectedRange] = useState<{ start: string; end: string } | null>(null);

  const handleSearch = (newFilters: SearchFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Hero / Search Section */}
      <div className="bg-gradient-to-b from-sky-950 to-indigo-950 pt-16 pb-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-sky-200 text-xs font-black uppercase tracking-[0.2em] mb-6 animate-in fade-in slide-in-from-bottom-2 duration-1000">
              <Sparkles size={14} className="text-orange-400" />
              {t("planning_title")}
            </div>
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              {t("title")}
            </h1>
            <p className="text-lg text-sky-100/60 max-w-2xl mx-auto font-medium">
              {t("description")}
            </p>
          </div>

          <CalendarSearch onSearch={handleSearch} initialFilters={filters} />
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-16 pb-20">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          {/* Calendar Area */}
          <div className="xl:col-span-8 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-sky-950/5 border border-sky-100/50 p-2 sm:p-4">
              <UnifiedCalendar
                type="customer"
                propertyType={filters.type || undefined}
                guests={filters.guests}
                q={filters.q}
                showPriceToggle
                locale={locale as any}
                selectionMode="range"
                onRangeSelect={(start, end) => setSelectedRange({ start, end })}
              />
            </div>

            {/* Legend / Info */}
            <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100/50">
              <h3 className="font-black text-sky-900 uppercase tracking-widest text-xs mb-4">{t("how_to_use")}</h3>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-sky-800/70 font-bold">
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">1</span>
                  {t("step1")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">2</span>
                  {t("step2")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">3</span>
                  {t("step3")}
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0">4</span>
                  {t("step4")}
                </li>
              </ul>
            </div>
          </div>

          {/* Results Sidebar (Sticky) */}
          <div className="xl:col-span-4">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white rounded-[2rem] shadow-xl border border-sky-100 p-6">
                <h2 className="text-xl font-black text-sky-950 mb-4 flex items-center gap-2">
                  {selectedRange ? t("results_title") : t("popular_title")}
                </h2>
                
                {selectedRange ? (
                   <div className="p-4 bg-sky-50 rounded-2xl mb-6 flex items-center justify-between border border-sky-100">
                     <div>
                       <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">{t("period_label")}</p>
                       <p className="text-sm font-bold text-sky-900">{selectedRange.start} тАФ {selectedRange.end}</p>
                     </div>
                     <button className="text-sky-400 hover:text-red-500 transition-colors" onClick={() => setSelectedRange(null)}>
                       {t("reset")}
                     </button>
                   </div>
                ) : null}

                <div className="space-y-4">
                   <CalendarResults filters={filters} range={selectedRange} />
                </div>
              </div>

              {/* Special Offer */}
              <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-8 text-white relative overflow-hidden group shadow-xl shadow-orange-500/20">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                <h3 className="text-2xl font-black mb-2 relative z-10">{t("discount_title")}</h3>
                <p className="text-orange-100 font-bold mb-6 relative z-10">{t("discount_desc")}</p>
                <button className="w-full py-4 bg-white text-orange-600 font-black rounded-xl uppercase tracking-widest text-xs hover:bg-orange-50 transition-colors relative z-10 shadow-lg">
                  {t("learn_more")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

