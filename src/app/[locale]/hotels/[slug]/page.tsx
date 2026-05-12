import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import BookingForm from "@/components/hotels/BookingForm";
import LucideIcon from "@/components/common/LucideIcon";
import { getTranslations } from "next-intl/server";

interface HotelPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

export default async function HotelPage({ params }: HotelPageProps) {
  const { slug, locale } = await params;
  const t = await getTranslations("common");

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

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="lg:w-2/3">
            {/* Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="h-96 bg-gray-300 flex items-center justify-center">
                  {hotel.featuredImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={hotel.featuredImage}
                    alt={hotel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">{t("noImage")}</span>
                )}
              </div>
            </div>

            {/* Hotel Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{hotel.title}</h1>
                  <p className="text-gray-500 flex items-center">
                    <span className="mr-2">📍</span> {hotel.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {hotel.salePrice || hotel.price} ₽
                  </div>
                  {hotel.salePrice && (
                    <div className="text-gray-500 line-through">
                      {hotel.price} ₽
                    </div>
                  )}
                  <div className="text-gray-500 text-sm">{t("perNight")}</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">{t("description")}</h2>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {hotel.content || "Описание отсутствует."}
                </div>
              </div>

              {/* Amenities */}
              {hotel.meta.some( (m: { key: string; value: string | null })  => m.key === "amenities") && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">{t("amenities")}</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {JSON.parse(
                      hotel.meta.find( (m: { key: string; value: string | null })  => m.key === "amenities")?.value || "[]"
                    ).map((amenity: string) => (
                      <div key={amenity} className="flex items-center text-gray-700">
                        <span className="text-green-500 mr-2">✓</span>
                        {amenity}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rooms */}
            {hotel.rooms.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">{t("rooms")}</h2>
                <div className="space-y-4">
                    {hotel.rooms.map((room: { id: number; title: string; description: string | null; price: number; salePrice: number | null; guests: number; beds: number; bathrooms: number; floor: number | null; roomType: { name: string; icon: string | null } | null; facilities: Array<{ id: number; name: string; icon: string | null }> }) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {room.roomType && (
                              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded flex items-center gap-1">
                                {room.roomType.icon && <LucideIcon name={room.roomType.icon} size={12} />}
                                {room.roomType.name}
                              </span>
                            )}
                            {room.floor && (
                              <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-0.5 rounded">
                                {room.floor} этаж
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-lg">{room.title}</h3>
                          <p className="text-gray-500 text-sm mb-2">
                            {room.guests} {t("guests")} · {room.beds} {t("beds")} · {room.bathrooms} {t("bathrooms")}
                          </p>
                          
                          {/* Facilities */}
                          {room.facilities && room.facilities.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {room.facilities.map((f: { id: number; name: string; icon: string | null }) => (
                                <span key={f.id} className="text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100 flex items-center gap-1">
                                  {f.icon && <LucideIcon name={f.icon} size={14} className="text-sky-600" />}
                                  {f.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {room.description && (
                            <p className="text-gray-600 mt-2 text-sm">{room.description}</p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <div className="font-bold text-xl text-blue-700">
                            {room.salePrice || room.price} ₽
                          </div>
                          {room.salePrice && (
                            <div className="text-gray-500 line-through text-sm">
                              {room.price} ₽
                            </div>
                          )}
                          <div className="text-gray-500 text-sm">{t("perNight")}</div>
                          <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm font-medium">
                            Выбрать
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                {t("reviews")} ({hotel.reviews.length})
              </h2>

              {hotel.reviews.length === 0 ? (
                <p className="text-gray-500">{t("noReviews")}</p>
              ) : (
                <div className="space-y-6">
                    {hotel.reviews.map((review: { id: number; rating: number; title: string | null; content: string | null; createdAt: Date; user: { name: string | null } }) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{review.user.name || "Anon"}</h4>
                          <div className="text-yellow-500">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">
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

          {/* Sidebar - Booking Form */}
          <aside className="lg:w-1/3">
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
