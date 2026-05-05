import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import BookingForm from "@/components/hotels/BookingForm";

interface HotelPageProps {
  params: { slug: string };
}

export default async function HotelPage({ params }: HotelPageProps) {
  const hotelId = parseInt(params.slug);

  if (isNaN(hotelId)) notFound();

  const hotel = await prisma.post.findUnique({
    where: { id: hotelId, type: "hotel" },
    include: {
      author: true,
      rooms: true,
      meta: true,
      reviews: {
        where: { status: "approved" },
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!hotel) notFound();

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
                  <img
                    src={hotel.featuredImage}
                    alt={hotel.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Нет изображения</span>
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
                  <div className="text-gray-500 text-sm">за ночь</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Описание</h2>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {hotel.content || "Описание отсутствует."}
                </div>
              </div>

              {/* Amenities */}
              {hotel.meta.some((m: any) => m.key === "amenities") && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Удобства</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {JSON.parse(
                      hotel.meta.find((m: any) => m.key === "amenities")?.value || "[]"
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
                <h2 className="text-xl font-semibold mb-4">Номера</h2>
                <div className="space-y-4">
                    {hotel.rooms.map((room: any) => (
                    <div
                      key={room.id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{room.title}</h3>
                          <p className="text-gray-500 text-sm">
                            {room.guests} гостей · {room.beds} кроватей · {room.bathrooms} ванных
                          </p>
                          {room.description && (
                            <p className="text-gray-600 mt-2">{room.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {room.salePrice || room.price} ₽
                          </div>
                          {room.salePrice && (
                            <div className="text-gray-500 line-through text-sm">
                              {room.price} ₽
                            </div>
                          )}
                          <div className="text-gray-500 text-sm">за ночь</div>
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
                Отзывы ({hotel.reviews.length})
              </h2>

              {hotel.reviews.length === 0 ? (
                <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
              ) : (
                <div className="space-y-6">
                    {hotel.reviews.map((review: any) => (
                    <div key={review.id} className="border-b pb-6 last:border-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{review.user.name || "Аноним"}</h4>
                          <div className="text-yellow-500">
                            {"★".repeat(review.rating)}
                            {"☆".repeat(5 - review.rating)}
                          </div>
                        </div>
                        <span className="text-gray-500 text-sm">
                          {format(new Date(review.createdAt), "dd MMM yyyy", { locale: ru })}
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
  const hotelId = parseInt(params.slug);
  if (isNaN(hotelId)) return {};

  const hotel = await prisma.post.findUnique({
    where: { id: hotelId },
  });

  return {
    title: hotel?.title || "Отель",
    description: hotel?.excerpt || hotel?.content?.substring(0, 160),
  };
}
