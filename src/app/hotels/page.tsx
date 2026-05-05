import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function HotelsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { q, minPrice, maxPrice } = await searchParams;

  const where: any = {
    type: "hotel",
    status: "publish",
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

  const hotels = await prisma.post.findMany({
    where,
    orderBy: { price: "asc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Отели Онгудая</h1>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск
              </label>
              <input
                type="text"
                name="q"
                placeholder="Название или адрес..."
                defaultValue={q}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена от (₽)
              </label>
              <input
                type="number"
                name="minPrice"
                placeholder="0"
                defaultValue={minPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена до (₽)
              </label>
              <input
                type="number"
                name="maxPrice"
                placeholder="10000"
                defaultValue={maxPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Найти
              </button>
            </div>
          </form>
        </div>

        {/* Hotels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hotels.map((hotel: any) => (
            <div key={hotel.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-300 relative">
                {hotel.featuredImage && (
                  <img
                    src={hotel.featuredImage}
                    alt={hotel.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {hotel.salePrice && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    Скидка
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{hotel.title}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm">{hotel.rating || "Нет оценок"}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-4">{hotel.address}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {hotel.salePrice || hotel.price} ₽
                    </span>
                    {hotel.salePrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {hotel.price} ₽
                      </span>
                    )}
                    <span className="text-gray-500 text-sm"> / ночь</span>
                  </div>
                  <Link
                    href={`/hotels/${hotel.id}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hotels.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Отели не найдены. Попробуйте изменить параметры поиска.</p>
          </div>
        )}
      </div>
    </div>
  );
}
