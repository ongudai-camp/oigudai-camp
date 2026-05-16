import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import CategoryFilter from "@/components/listing/CategoryFilter";
import type { Prisma } from "@prisma/client";
import { Star, MapPin, ArrowRight, Search } from "lucide-react";
import Image from "next/image";

export default async function ToursPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; minPrice?: string; maxPrice?: string; category?: string }>;
}) {
  const { locale } = await params;
  const { q, minPrice, maxPrice, category } = await searchParams;
  const t = await getTranslations({ locale, namespace: "listing" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const priceFilter: Record<string, number> = {};
  if (minPrice) priceFilter.gte = parseFloat(minPrice);
  if (maxPrice) priceFilter.lte = parseFloat(maxPrice);

  const where: Prisma.PostWhereInput = {
    type: "tour",
    status: "publish",
    locale,
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
      ],
    }),
    ...(Object.keys(priceFilter).length && { price: priceFilter }),
    ...(category && { meta: { some: { key: "category", value: category } } }),
  };

  const tours = await prisma.post.findMany({
    where,
    orderBy: { price: "asc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-24 pb-6 md:pb-12 selection:bg-orange-500/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8 md:gap-12">
          {/* Header */}
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
              <h1 className="text-3xl md:text-5xl font-black text-sky-950 tracking-tighter leading-none">
                {t("toursTitle")}
              </h1>
              <p className="text-sky-700 font-bold mt-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                {t("foundCount", { count: tours.length })}
              </p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="bg-white/80 backdrop-blur-md rounded-[2rem] border border-white/50 shadow-xl p-6 md:p-8 space-y-6">
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-bold text-sky-700 mb-2">
                  {t("search")}
                </label>
                <input
                  type="text"
                  name="q"
                  placeholder={t("searchPlaceholder")}
                  defaultValue={q}
                  className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-sky-700 mb-2">
                  {t("priceFrom")}
                </label>
                <input
                  type="number"
                  name="minPrice"
                  placeholder="0"
                  defaultValue={minPrice}
                  className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-sky-700 mb-2">
                  {t("priceTo")}
                </label>
                <input
                  type="number"
                  name="maxPrice"
                  placeholder="50000"
                  defaultValue={maxPrice}
                  className="w-full px-4 py-3 border border-sky-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-white text-gray-900"
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-sky-950 text-white px-4 py-3 rounded-xl font-bold shadow-lg shadow-sky-950/20 hover:bg-sky-900 transition-all active:scale-95"
                >
                  {t("find")}
                </button>
              </div>
            </form>

            <Suspense fallback={
              <div className="flex gap-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 w-24 bg-sky-50 rounded-xl animate-pulse" />
                ))}
              </div>
            }>
              <CategoryFilter
                translations={{
                  all: t("all"),
                  categories: t("categories"),
                }}
              />
            </Suspense>
          </div>

          {/* Tours Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
            {tours.length === 0 ? (
              <div className="col-span-full py-24 md:py-32 text-center bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-sky-50 shadow-xl flex flex-col items-center justify-center space-y-4">
                <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-500">
                  <Search size={40} />
                </div>
                <p className="text-sky-950 font-black text-xl tracking-tight">{t("noResults")}</p>
              </div>
            ) : (
              tours.map((tour, index) => (
                <Link
                  key={tour.id}
                  href={`/${locale}/tours/${tour.slug}`}
                  className="group bg-white rounded-[2.5rem] overflow-hidden border border-sky-50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative h-64 md:h-72 overflow-hidden">
                    {tour.featuredImage ? (
                      <Image
                        src={tour.featuredImage}
                        alt={tour.title}
                        fill
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-500">
                        <MapPin size={48} strokeWidth={1} />
                      </div>
                    )}

                    <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-sky-950 shadow-lg border border-white flex items-center gap-1.5 transition-transform group-hover:scale-105">
                      <Star size={14} className="text-orange-500 fill-orange-500" />
                      {tour.rating || tc("noRating")}
                    </div>

                    {tour.salePrice && (
                      <div className="absolute top-5 left-5 bg-orange-500 text-white px-4 py-2 rounded-2xl text-xs font-black shadow-lg">
                        {tc("discount")}
                      </div>
                    )}
                  </div>
                  <div className="p-8 md:p-10 space-y-5">
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black text-sky-950 group-hover:text-orange-500 transition-colors tracking-tighter leading-tight">
                        {tour.title}
                      </h2>
                      {tour.address && (
                        <p className="text-sky-900/50 text-sm md:text-base font-medium flex items-center gap-1">
                          <MapPin size={14} className="text-sky-700 shrink-0" />
                          {tour.address}
                        </p>
                      )}
                    </div>

                    <div className="pt-6 border-t border-sky-50 flex justify-between items-center">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1 block">{t("priceFrom")}</span>
                        <div className="text-3xl font-black text-sky-950">
                          {tour.salePrice || tour.price} ₽
                          <span className="text-sm font-bold text-sky-600 ml-1">/ {tc("perPerson")}</span>
                        </div>
                        {tour.salePrice && (
                          <span className="text-sm text-sky-600 line-through ml-1">{tour.price} ₽</span>
                        )}
                      </div>
                      <div className="w-14 h-14 bg-sky-50 rounded-3xl flex items-center justify-center text-sky-600 group-hover:bg-orange-500 group-hover:text-white group-hover:rotate-[-45deg] transition-all duration-500 ease-out shadow-inner">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
