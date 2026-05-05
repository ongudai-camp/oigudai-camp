import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

interface TourPageProps {
  params: { slug: string };
}

export default async function TourPage({ params }: TourPageProps) {
  const tourId = parseInt(params.slug);

  if (isNaN(tourId)) notFound();

  const tour = await prisma.post.findUnique({
    where: { id: tourId, type: "tour" },
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <main className="lg:w-2/3">
            {/* Gallery */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="h-96 bg-gray-300 flex items-center justify-center">
                {tour.featuredImage ? (
                  <img
                    src={tour.featuredImage}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-500">Нет изображения</span>
                )}
              </div>
            </div>

            {/* Tour Info */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
                  <p className="text-gray-500 flex items-center">
                    <span className="mr-2">📍</span> {tour.address}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    {tour.salePrice || tour.price} ₽
                  </div>
                  {tour.salePrice && (
                    <div className="text-gray-500 line-through">
                      {tour.price} ₽
                    </div>
                  )}
                  <div className="text-gray-500 text-sm">за человека</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4">Описание тура</h2>
                <div className="text-gray-700 whitespace-pre-wrap">
                  {tour.content || "Описание отсутствует."}
                </div>
              </div>

              {/* Tour Details from Meta */}
              {tour.meta.some((m: any) => m.key === "duration") && (
                <div className="border-t pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Детали тура</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {tour.meta.find((m: any) => m.key === "duration") && (
                      <div className="flex items-center">
                        <span className="mr-2">⏱</span>
                        <span>{tour.meta.find((m: any) => m.key === "duration")?.value}</span>
                      </div>
                    )}
                    {tour.meta.find((m: any) => m.key === "groupSize") && (
                      <div className="flex items-center">
                        <span className="mr-2">👥</span>
                        <span>Группа: {tour.meta.find((m: any) => m.key === "groupSize")?.value} чел.</span>
                      </div>
                    )}
                    {tour.meta.find((m: any) => m.key === "difficulty") && (
                      <div className="flex items-center">
                        <span className="mr-2">🏔</span>
                        <span>Сложность: {tour.meta.find((m: any) => m.key === "difficulty")?.value}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Отзывы ({tour.reviews.length})
              </h2>

              {tour.reviews.length === 0 ? (
                <p className="text-gray-500">Пока нет отзывов. Будьте первым!</p>
              ) : (
                <div className="space-y-6">
                  {tour.reviews.map((review: any) => (
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

          {/* Sidebar - Booking Info */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Забронировать тур</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600">Цена:</span>
                    <span className="ml-2 font-bold text-lg">{tour.salePrice || tour.price} ₽</span>
                    {tour.salePrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">{tour.price} ₽</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm">Цена указана за человека</p>
                  <Link
                    href={`/booking?type=tour&id=${tour.id}`}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg hover:bg-blue-700"
                  >
                    Забронировать
                  </Link>
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
  const tourId = parseInt(params.slug);
  if (isNaN(tourId)) return {};

  const tour = await prisma.post.findUnique({
    where: { id: tourId },
  });

  return {
    title: tour?.title || "Тур",
    description: tour?.excerpt || tour?.content?.substring(0, 160),
  };
}
