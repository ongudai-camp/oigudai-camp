import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import SideSearchPanel from "@/components/common/SideSearchPanel";
import DynamicMap from "@/components/common/DynamicMap";
import CategoryFilter from "@/components/listing/CategoryFilter";
import { Star, MapPin, ArrowRight, List, Map as MapIcon, Search } from "lucide-react";

interface HotelsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; minPrice?: string; maxPrice?: string; type?: string; category?: string }>;
}

export default async function HotelsPage({ params, searchParams }: HotelsPageProps) {
  const { locale } = await params;
  const { q, minPrice, maxPrice, type, category } = await searchParams;
  const t = await getTranslations("listing");
  const tc = await getTranslations("common");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    type: "hotel",
    status: "publish",
    locale,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  if (minPrice) {
    where.price = { gte: parseFloat(minPrice) };
  }

  if (maxPrice) {
    where.price = { ...where.price, lte: parseFloat(maxPrice) };
  }

  if (type) {
    where.rooms = { some: { roomType: { slug: type } } };
  }

  if (category) {
    where.meta = { some: { key: "category", value: category } };
  }

  const hotels = await prisma.post.findMany({
    where,
    orderBy: { price: "asc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  const mapPosts = hotels.map((h) => ({
    id: h.id,
    title: h.title,
    price: h.price,
    address: h.address,
    latitude: h.latitude,
    longitude: h.longitude,
  }));

  return (
    <div className="min-h-screen bg-[#F0F9FF] pt-24 pb-6 md:pb-12 selection:bg-orange-500/30">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col gap-8 md:gap-12">
          {/* Header & Map Integration */}
          <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-sky-950 tracking-tighter leading-none">
                  {t("hotelsTitle")}
                </h1>
                <p className="text-sky-700 font-bold mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                  {t("foundCount", { count: hotels.length })}
                </p>
              </div>
              <div className="flex gap-2 w-full md:w-auto bg-white/50 p-1.5 rounded-[1.25rem] backdrop-blur-sm border border-white/50 shadow-sm">
                <button className="flex-1 md:flex-none bg-sky-950 text-white px-6 py-3 rounded-2xl font-bold shadow-xl shadow-sky-950/20 text-sm md:text-base flex items-center justify-center gap-2 transition-all active:scale-95">
                  <List size={18} /> {t("list")}
                </button>
                <button className="flex-1 md:flex-none bg-transparent px-6 py-3 rounded-2xl font-bold text-sky-950 hover:bg-white/50 transition-all text-sm md:text-base flex items-center justify-center gap-2 active:scale-95">
                  <MapIcon size={18} /> {t("map")}
                </button>
              </div>
            </div>

            <div className="w-full overflow-hidden rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-white/50 ring-1 ring-sky-900/5">
              <DynamicMap posts={mapPosts} />
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
            {/* Sidebar Search */}
            <aside className="w-full lg:w-[320px] shrink-0 order-2 lg:order-1 animate-in fade-in slide-in-from-left-4 duration-1000 delay-300">
              <div className="lg:sticky lg:top-28">
                <SideSearchPanel />
              </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 space-y-8 order-1 lg:order-2">
              <CategoryFilter
                translations={{
                  all: t("all"),
                  categories: t("categories"),
                }}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
                {hotels.length === 0 ? (
                  <div className="col-span-full py-24 md:py-32 text-center bg-white/80 backdrop-blur-md rounded-[2.5rem] border border-sky-50 shadow-xl flex flex-col items-center justify-center space-y-4">
                    <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center text-sky-500">
                      <Search size={40} />
                    </div>
                    <p className="text-sky-950 font-black text-xl tracking-tight">{t("noResults")}</p>
                    <button className="text-orange-500 font-bold hover:underline">{t("resetFilters")}</button>
                  </div>
                ) : (
                  hotels.map((hotel, index) => (
                    <Link
                      key={hotel.id}
                      href={`/${locale}/hotels/${hotel.slug}`}
                      className="group bg-white rounded-[2.5rem] overflow-hidden border border-sky-50 shadow-sm hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="relative h-64 md:h-72 overflow-hidden">
                          {hotel.featuredImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={hotel.featuredImage}
                            alt={hotel.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out"
                          />
                        ) : (
                          <div className="w-full h-full bg-sky-100 flex items-center justify-center text-sky-500">
                            <MapPin size={48} strokeWidth={1} />
                          </div>
                        )}
                        
                        <div className="absolute top-5 right-5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-xs font-black text-sky-950 shadow-lg border border-white flex items-center gap-1.5 transition-transform group-hover:scale-105">
                          <Star size={14} className="text-orange-500 fill-orange-500" /> 
                          {hotel.rating || tc("noRating")}
                        </div>

                        <div className="absolute bottom-5 left-5 bg-sky-950/90 backdrop-blur-md px-5 py-2.5 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest max-w-[85%] truncate border border-white/10 flex items-center gap-2">
                          <MapPin size={12} className="text-orange-400" />
                          {hotel.address}
                        </div>
                      </div>
                      <div className="p-8 md:p-10 space-y-5">
                        <div className="space-y-2">
                          <h2 className="text-2xl md:text-3xl font-black text-sky-950 group-hover:text-orange-500 transition-colors tracking-tighter leading-tight">
                            {hotel.title}
                          </h2>
                          <p className="text-sky-900/50 text-sm md:text-base font-medium line-clamp-2 leading-relaxed">
                            {hotel.content}
                          </p>
                        </div>
                        
                        <div className="pt-6 border-t border-sky-50 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 mb-1 block">{t("startingFrom")}</span>
                            <div className="text-3xl font-black text-sky-950">
                              {hotel.salePrice || hotel.price} ₽
                              <span className="text-sm font-bold text-sky-600 ml-1">{t("perNight")}</span>
                            </div>
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
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
