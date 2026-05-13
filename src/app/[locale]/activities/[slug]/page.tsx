import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import MapSection from "@/components/common/MapSection";

interface ActivityPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("common");

  const activity = await prisma.post.findUnique({
    where: { 
      slug_locale: { slug, locale },
      type: "activity" 
    },
    include: {
      author: true,
      meta: true,
      reviews: {
        where: { status: "approved" },
        include: { user: true },
      },
    },
  });

  if (!activity) notFound();

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="lg:w-2/3">
            {/* Image */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden mb-6">
              <div className="h-56 sm:h-72 lg:h-96 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                  {activity.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activity.featuredImage}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-6xl">🏔️</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 mb-6">
              <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
              {activity.address && (
                <p className="text-[#1A2B48] flex items-center mb-4">
                  <span className="mr-2">📍</span> {activity.address}
                </p>
              )}
              <p className="text-[#1A2B48] mb-6 whitespace-pre-wrap">
                {activity.content || t("noDescription")}
              </p>

              {/* Details from Meta */}
              {activity.meta.length > 0 && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold text-[#5000FF] mb-4">{t("tourDetails")}</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {activity.meta.filter((m) => m.value !== null).map((m) => (
                      <div key={m.id} className="flex items-center">
                        <span className="text-[#1A2B48]">{m.key}:</span>
                        <span className="ml-2 font-medium">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activity.latitude && activity.longitude && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold text-[#5000FF] mb-4">{t("location")}</h2>
                  <MapSection
                    latitude={activity.latitude}
                    longitude={activity.longitude}
                    title={activity.title}
                    address={activity.address}
                  />
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8 space-y-6">
              {/* Price Card */}
              <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{t("price")}</span>
                    <div className="text-3xl font-black text-orange-500">
                      {(activity.salePrice || activity.price).toLocaleString()} ₽
                    </div>
                  </div>
                  <p className="text-xs font-bold text-orange-400">{t("perPerson")}</p>

                  <Link
                    href={"/" + locale + "/booking?type=activity&id=" + activity.id}
                    className="block w-full bg-orange-500 hover:bg-orange-600 text-white text-center py-4 rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                  >
                    {t("book")}
                  </Link>
                </div>
              </div>

              {/* Meta Details */}
              {activity.meta.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-6">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-300 block mb-4">{t("details")}</span>
                  <div className="space-y-3">
                    {activity.meta.filter(function(m) { return m.value !== null; }).map(function(m) {
                      return (
                        <div key={m.id} className="flex items-center justify-between text-sm">
                          <span className="text-sky-700 font-medium">{m.key}:</span>
                          <span className="font-bold text-sky-950">{m.value}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ActivityPageProps) {
  const { slug, locale } = await params;

  const activity = await prisma.post.findUnique({
    where: { slug_locale: { slug, locale } },
  });

  return {
    title: activity?.title || "Activity",
    description: activity?.excerpt || activity?.content?.substring(0, 160),
  };
}
