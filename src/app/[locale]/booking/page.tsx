import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import BookingForm from "@/components/hotels/BookingForm";

interface BookingPageProps {
  searchParams: Promise<{ type?: string; id?: string }>;
}

export default async function BookingPage({
  searchParams,
}: BookingPageProps) {
  const { type, id } = await searchParams;

  if (!id || !type) notFound();

  const postId = parseInt(id);
  if (isNaN(postId)) notFound();

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { rooms: true },
  });

  if (!post) notFound();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link
          href={`/${type === "hotel" ? "hotels" : type === "tour" ? "tours" : "activities"}/${post.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          ← Вернуться назад
        </Link>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-2">
            Бронирование: {post.title}
          </h1>
          <p className="text-gray-500 mb-6">{post.address}</p>

          {type === "hotel" ? (
            <BookingForm hotelId={post.id} rooms={post.rooms} />
          ) : (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-gray-600">Тип:</span>
                    <span className="ml-2 font-medium">
                      {type === "tour" ? "Тур" : "Активность"}
                    </span>
                  </div>
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {post.salePrice || post.price} ₽
                    </span>
                    <span className="text-gray-500 text-sm"> / чел</span>
                  </div>
                </div>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Количество человек
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="20"
                      defaultValue="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Забронировать
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
