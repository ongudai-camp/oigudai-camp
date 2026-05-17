"use client";

import { useQuery } from "@tanstack/react-query";
import { Star, MapPin, ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface Property {
  id: number;
  title: string;
  type: string;
  slug: string;
  featuredImage: string | null;
  price: number;
  rating: number;
  reviewCount: number;
}

interface CalendarResultsProps {
  filters: {
    q: string;
    guests: number;
    type: string;
  };
  range: { start: string; end: string } | null;
}

export default function CalendarResults({ filters, range }: CalendarResultsProps) {
  const locale = useLocale();
  const t = useTranslations("calendar");
  const tc = useTranslations("common");
  const tl = useTranslations("listing");

  const params = new URLSearchParams({
    query: filters.q,
    type: filters.type,
    guests: String(filters.guests),
  });
  if (range) {
    params.set("checkIn", range.start);
    params.set("checkOut", range.end);
  }

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["calendar-results", filters, range],
    queryFn: async () => {
      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch results");
      const data = await res.json();
      return data.results || [];
    },
    enabled: true,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-500 font-bold">{t("loading_results")}</p>
      </div>
    );
  }

  if (!properties || properties.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 font-bold">{t("no_results")}</p>
        <p className="text-sm text-gray-400 mt-2">{t("no_results_hint")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {properties.map((prop) => (
        <Link 
          key={prop.id} 
          href={`/${locale}/${prop.type === 'hotel' ? 'hotels' : prop.type === 'tour' ? 'tours' : 'activities'}/${prop.slug}`}
          className="block bg-white rounded-3xl border border-sky-100 overflow-hidden hover:shadow-2xl hover:shadow-sky-900/5 transition-all group"
        >
          <div className="flex flex-col sm:flex-row h-full">
            <div className="relative w-full sm:w-48 h-48 sm:h-auto shrink-0 overflow-hidden">
              <Image
                src={prop.featuredImage || "/hero-bg.jpg"}
                alt={prop.title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest text-sky-950 shadow-sm">
                {prop.type === 'hotel' ? tc('room') : prop.type === 'tour' ? tc('forms.booking.typeTour') : tc('forms.booking.typeActivity')}
              </div>
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex items-center gap-1 text-orange-500">
                    <Star size={14} className="fill-current" />
                    <span className="text-sm font-black">{prop.rating || 5.0}</span>
                  </div>
                  <span className="text-gray-300 text-xs font-bold">тАв</span>
                  <span className="text-gray-400 text-xs font-bold">{prop.reviewCount || 0} {tc("reviews")}</span>
                </div>
                
                <h3 className="text-xl font-black text-sky-950 mb-2 group-hover:text-blue-600 transition-colors">{prop.title}</h3>
                <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium">
                  <MapPin size={14} className="text-sky-400" />
                  Онгудайский район
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between border-t border-sky-50 pt-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{tl("startingFrom")}</p>
                  <p className="text-2xl font-black text-sky-950">
                    {prop.price.toLocaleString()} тВ╜
                    <span className="text-xs text-gray-400 font-bold ml-1">/ {tc("perPerson")}</span>
                  </p>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
