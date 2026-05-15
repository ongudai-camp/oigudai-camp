"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Search, SlidersHorizontal, Star, MapPin, Loader2, X } from "lucide-react";

interface SearchResult {
  id: number;
  title: string;
  slug: string;
  type: string;
  excerpt: string | null;
  featuredImage: string | null;
  price: number;
  minRoomPrice: number | null;
  currency: string;
  rating: number;
  reviewCount: number;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  rooms: { id: number; title: string; price: number; salePrice: number | null; guests: number }[];
  available: boolean;
}

export default function AdvancedSearch() {
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [type, setType] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTriggered, setSearchTriggered] = useState(false);

  const params = new URLSearchParams();
  if (query) params.set("query", query);
  if (type) params.set("type", type);
  if (priceMax) params.set("priceMax", priceMax);

  const { data, isLoading } = useQuery({
    queryKey: ["search", query, type, priceMax],
    queryFn: async () => {
      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<{ results: SearchResult[]; pagination: { total: number; page: number; limit: number; totalPages: number } }>;
    },
    enabled: searchTriggered || query.length > 0,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTriggered(true);
  };

  const typeColors: Record<string, string> = {
    hotel: "bg-blue-100 text-blue-700",
    tour: "bg-emerald-100 text-emerald-700",
    activity: "bg-orange-100 text-orange-700",
  };

  return (
    <div>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search hotels, tours, activities..."
              className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-medium outline-none focus:border-gray-300 focus:ring-4 focus:ring-gray-50 transition-all"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-sky-950 hover:bg-sky-900 text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
              showFilters ? "bg-sky-50 border-sky-200 text-sky-700" : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Type</label>
                <div className="flex gap-1.5">
                  {["", "hotel", "tour", "activity"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setType(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        type === t ? "bg-sky-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {t === "" ? "All" : t.charAt(0).toUpperCase() + t.slice(1) + "s"}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Max price (₽)</label>
                <input
                  type="number"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="Any"
                  className="w-28 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Results */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-gray-400" />
        </div>
      )}

      {data && data.results.length === 0 && (
        <div className="text-center py-20">
          <Search size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">No results found</h3>
          <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.pagination.total} result{data.pagination.total !== 1 ? "s" : ""} found</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {data.results.map((result) => (
              <Link
                key={result.id}
                href={`/${locale}/${result.type === "hotel" ? "hotels" : result.type === "tour" ? "tours" : "activities"}/${result.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                  {result.featuredImage ? (
                    <Image src={result.featuredImage} alt={result.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm font-bold">No image</div>
                  )}
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${typeColors[result.type] || "bg-gray-100 text-gray-700"}`}>
                    {result.type}
                  </span>
                  {result.available && (
                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white">Available</span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-sky-700 transition-colors truncate">{result.title}</h3>
                  {result.excerpt && <p className="text-xs text-gray-400 mt-1 line-clamp-2">{result.excerpt}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    {result.rating > 0 && (
                      <span className="flex items-center gap-1 text-xs font-bold text-amber-600">
                        <Star size={12} className="fill-amber-400 text-amber-400" /> {result.rating.toFixed(1)} ({result.reviewCount})
                      </span>
                    )}
                    {result.address && (
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <MapPin size={12} /> {result.address}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="font-black text-lg text-gray-900">
                      {result.type === "hotel" && result.minRoomPrice
                        ? `From ${result.minRoomPrice.toLocaleString()}`
                        : result.price.toLocaleString()
                      } {result.currency}
                    </span>
                    <span className="text-xs font-bold text-sky-700 group-hover:underline">Book now</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
