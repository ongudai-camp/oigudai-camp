import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ActivitiesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const where: any = {
    type: "activity",
    status: "publish",
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  const activities = await prisma.post.findMany({
    where,
    orderBy: { price: "asc" },
    include: { author: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Активности на Алтае</h1>

        {/* Search */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск активности
              </label>
              <input
                type="text"
                name="q"
                placeholder="Рафтинг, конные прогулки, треккинг..."
                defaultValue={q}
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

        {/* Activities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activities.map((activity: any) => (
            <div key={activity.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gradient-to-br from-green-400 to-blue-500 relative flex items-center justify-center">
                {activity.featuredImage ? (
                  <img
                    src={activity.featuredImage}
                    alt={activity.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl">🏔️</span>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{activity.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{activity.address}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-green-600">
                      {activity.salePrice || activity.price} ₽
                    </span>
                    <span className="text-gray-500 text-sm"> / чел</span>
                  </div>
                  <Link
                    href={`/activities/${activity.id}`}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Подробнее
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Активности не найдены.</p>
          </div>
        )}
      </div>
    </div>
  );
}
