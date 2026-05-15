import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseGalleryImages } from "@/lib/gallery";
import BookingForm from "@/components/hotels/BookingForm";
import ImageGallery from "@/components/gallery/ImageGallery";
import AmenitiesGrid from "@/components/common/AmenitiesGrid";
import LucideIcon from "@/components/common/LucideIcon";
import { getTranslations } from "next-intl/server";
import MapSection from "@/components/common/MapSection";
import ReviewSection from "@/components/reviews/ReviewSection";
import type { Review } from "@/components/reviews/ReviewsList";

interface HotelPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations({ locale, namespace: "common" });

  const hotel = await prisma.post.findUnique({
    where: { 
      slug_locale: { slug, locale },
      type: "hotel" 
    },
    include: {
      author: true,
      rooms: {
        include: {
          roomType: true,
          facilities: true,
        }
      },
      meta: true,
      reviews: {
        where: { status: "approved" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!hotel) notFound();

  const galleryImages = parseGalleryImages(hotel.gallery, hotel.featuredImage);

  let amenities: string[] = [];
  try {
    const amenitiesMeta = hotel.meta.find((m: { key: string; value: string | null }) => m.key === "amenities")?.value;
    if (amenitiesMeta) {
      amenities = JSON.parse(amenitiesMeta);
    }
  } catch {
    amenities = [];
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="lg:w-2/3 min-w-0">
            {/* Gallery */}
            <div className="mb-6">
              <ImageGallery images={galleryImages} title={hotel.title} />
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 mb-6">
              {/* Title & Price Row */}
              <div className="flex justify-between items-start mb-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{hotel.title}</h1>
                    {hotel.rating && (
                      <span className="flex items-center gap-1 bg-yellow-50 text-yellow-800 px-2.5 py-1 rounded-lg text-sm font-bold shrink-0">
                        ⭐ {hotel.rating}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 flex items-center gap-1.5">
                    <span>📍</span> {hotel.address}
                  </p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="text-sm text-gray-500 mb-0.5">{t("perNight")}</div>
                  <div className="text-3xl font-bold text-blue-600">
                    {(hotel.salePrice || hotel.price).toLocaleString()} ₽
                  </div>
                  {hotel.salePrice && (
                    <div className="text-gray-400 line-through text-sm">
                      {hotel.price.toLocaleString()} ₽
                    </div>
                  )}
                </div>
              </div>

              {/* Highlights */}
              <div className="flex flex-wrap gap-3 mb-6">
                {hotel.rooms.length > 0 && (
                  <span className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    🛏️ {hotel.rooms.length} {t("roomTypes") || "типа номеров"}
                  </span>
                )}
                {hotel.minNights > 1 && (
                  <span className="bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    📅 от {hotel.minNights} {t("nights") || "ночей"}
                  </span>
                )}
                {hotel.reviewCount > 0 && (
                  <span className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5">
                    💬 {hotel.reviewCount} {t("reviews") || "отзывов"}
                  </span>
                )}
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">{t("description")}</h2>
                <div className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                  {hotel.content || t("noDescription")}
                </div>
              </div>

              {/* Amenities */}
              {amenities.length > 0 && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">{t("amenities")}</h2>
                  <AmenitiesGrid amenities={amenities} />
                </div>
              )}
            </div>

            {/* Rooms */}
            {hotel.rooms.length > 0 && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">{t("rooms")}</h2>
                  <span className="text-sm text-gray-500">{hotel.rooms.length} {t("roomTypes") || "вариантов"}</span>
                </div>
                <div className="space-y-4">
                  {hotel.rooms.map((room: { id: number; title: string; description: string | null; price: number; salePrice: number | null; guests: number; beds: number; bathrooms: number; floor: number | null; roomType: { name: string; icon: string | null } | null; facilities: Array<{ id: number; name: string; icon: string | null }> }) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            {room.roomType && (
                              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-md flex items-center gap-1">
                                {room.roomType.icon && <LucideIcon name={room.roomType.icon} size={12} />}
                                {room.roomType.name}
                              </span>
                            )}
                            {room.floor && (
                              <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2 py-1 rounded-md">
                                {room.floor} {t("floor")}
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg text-gray-900">{room.title}</h3>
                          <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                            <span>👤 {room.guests} {t("guests")}</span>
                            <span>🛏️ {room.beds}</span>
                            <span>🚿 {room.bathrooms}</span>
                          </div>
                          
                          {/* Facilities */}
                          {room.facilities && room.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {room.facilities.map((f: { id: number; name: string; icon: string | null }) => (
                                <span key={f.id} className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-100 flex items-center gap-1">
                                  {f.icon && <LucideIcon name={f.icon} size={12} className="text-gray-400" />}
                                  {f.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {room.description && (
                            <p className="text-gray-500 mt-3 text-sm">{room.description}</p>
                          )}
                        </div>
                        <div className="text-right shrink-0 md:pl-6 md:border-l md:border-gray-100 md:min-w-[160px]">
                          <div className="text-sm text-gray-500">{t("perNight")}</div>
                          <div className="font-bold text-2xl text-gray-900 mt-0.5">
                            {(room.salePrice || room.price).toLocaleString()} ₽
                          </div>
                          {room.salePrice && (
                            <div className="text-gray-400 line-through text-sm">
                              {room.price.toLocaleString()} ₽
                            </div>
                          )}
                          <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98] cursor-pointer">
                            {t("select")}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hotel.latitude && hotel.longitude && (
              <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8 mb-6">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">{t("location")}</h2>
                <MapSection
                  latitude={hotel.latitude}
                  longitude={hotel.longitude}
                  title={hotel.title}
                  address={hotel.address}
                />
              </div>
            )}

            <ReviewSection postId={hotel.id} reviews={hotel.reviews as unknown as Review[]} />
          </main>

          {/* Sidebar - Booking Form */}
          <aside className="lg:w-1/3 min-w-0">
            <div className="sticky top-8">
              <BookingForm hotelId={hotel.id} rooms={hotel.rooms} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: HotelPageProps) {
  const { slug, locale } = await params;

  const hotel = await prisma.post.findUnique({
    where: { slug_locale: { slug, locale } },
  });

  return {
    title: hotel?.title || "Hotel",
    description: hotel?.excerpt || hotel?.content?.substring(0, 160),
  };
}
