import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import MapSection from "@/components/common/MapSection";

interface TourPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function TourPage({ params }: TourPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("common");

  const tour = await prisma.post.findUnique({
    where: { 
      slug_locale: { slug, locale },
      type: "tour" 
    },
    include: {
      author: true,
      meta: true,
      reviews: {
        where: { status: "approved" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!tour) notFound();

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

  const getMeta = (key: string) => tour.meta.find((m: { key: string; value: string | null }) => m.key === key)?.value;
  const groupSize = getMeta("groupSize");

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="lg:w-2/3">
            {/* Gallery */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden mb-6">
              <div className="h-56 sm:h-72 lg:h-96 bg-gray-300 flex items-center justify-center">
                  {tour.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tour.featuredImage}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-[#1A2B48]">{t("noImage")}</span>
                )}
              </div>
            </div>

            {/* Tour Info */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
                  <p className="text-[#1A2B48] flex items-center">
                    <span className="mr-2">📍</span> {tour.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {tour.salePrice || tour.price} ₽
                  </div>
                  {tour.salePrice && (
                    <div className="text-[#1A2B48] line-through">
                      {tour.price} ₽
                    </div>
                  )}
                  <div className="text-[#1A2B48] text-sm">{t("perPerson")}</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold text-[#5000FF] mb-4">{t("description")}</h2>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {tour.content || t("noDescription")}
                </div>
              </div>

              {/* Tour Details from Meta */}
              {(getMeta("duration") || getMeta("groupSize") || getMeta("difficulty")) && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-[#5000FF] mb-4">{t("tourDetails")}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {getMeta("duration") && (
                      <div className="flex items-center">
                        <span className="mr-2">⏱</span>
                        <span>{t("duration")}: {getMeta("duration")}</span>
                      </div>
                    )}
                    {getMeta("groupSize") && (
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        <span>{t("groupSize")}: {getMeta("groupSize")} {t("persons")}</span>
                      </div>
                    )}
                    {getMeta("difficulty") && (
                      <div className="flex items-center">
                        <span className="mr-2">🏔</span>
                        <span>{t("difficulty")}: {getMeta("difficulty")}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {tour.latitude && tour.longitude && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 mt-6">
                <h2 className="text-xl font-semibold text-[#5000FF] mb-4">{t("location")}</h2>
                <MapSection
                  latitude={tour.latitude}
                  longitude={tour.longitude}
                  title={tour.title}
                  address={tour.address}
                />
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8">
              <h2 className="text-xl font-semibold text-[#5000FF] mb-4">
                {t("reviews")} ({tour.reviews.length})
              </h2>

              {tour.reviews.length === 0 ? (
                <p className="text-[#1A2B48]">{t("noReviews")}</p>
              ) : (
                <div className="space-y-6">
                  {tour.reviews.map((review: { id: number; rating: number; title: string | null; content: string | null; createdAt: Date; user: { name: string | null } }) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{review.user.name || "Anon"}</h4>
                          <div className="text-yellow-500">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <span className="text-[#1A2B48] text-sm">
                          {format(new Date(review.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                        </span>
                      </div>
                      {review.title && (
                        <h5 className="font-medium mb-2">{review.title}</h5>
                      )}
                      <p className="text-gray-700">{review.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>

          {/* Sidebar - Booking Info */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">{t("price")}</span>
                    <div className="text-right">
                      <div className="text-3xl font-black text-emerald-600">
                        {(tour.salePrice || tour.price).toLocaleString()} ₽
                      </div>
                      {tour.salePrice && (
                        <div className="text-sm text-sky-300 line-through">{tour.price.toLocaleString()} ₽</div>
                      )}
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-400">{t("perPerson")}</p>

                  <Link
                    href={"/" + locale + "/booking?type=tour&id=" + tour.id}
                    className="block w-full bg-emerald-600 hover:bg-emerald-700 text-white text-center py-4 rounded-xl font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
                  >
                    {t("book")}
                  </Link>

                  <div className="border-t border-emerald-100 pt-4 space-y-2">
                    {getMeta("duration") && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">⏱</span>
                        <span className="text-sky-700">{getMeta("duration")}</span>
                      </div>
                    )}
                    {groupSize && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">👥</span>
                        <span className="text-sky-700">{t("upTo", { count: groupSize })}</span>
                      </div>
                    )}
                    {getMeta("difficulty") && (
                      <div className="flex items-center gap-3 text-sm">
                        <span className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-500">🏔</span>
                        <span className="text-sky-700">{getMeta("difficulty")}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: TourPageProps) {
  const { slug, locale } = await params;

  const tour = await prisma.post.findUnique({
    where: { slug_locale: { slug, locale } },
  });

  return {
    title: tour?.title || "Tour",
    description: tour?.excerpt || tour?.content?.substring(0, 160),
  };
}
