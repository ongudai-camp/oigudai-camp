import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface ActivityPageProps {
  params: { slug: string };
}

export default async function ActivityPage({ params }: ActivityPageProps) {
  const activityId = parseInt(params.slug);

  if (isNaN(activityId)) notFound();

  const activity = await prisma.post.findUnique({
    where: { id: activityId, type: "activity" },
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <main className="lg:w-2/3">
            {/* Image */}
            <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
              <div className="h-96 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center">
                {activity.featuredImage ? (
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
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-3xl font-bold mb-4">{activity.title}</h1>
              <p className="text-gray-600 mb-6 whitespace-pre-wrap">
                {activity.content || "Описание отсутствует."}
              </p>

              {/* Details from Meta */}
              {activity.meta.length > 0 && (
                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Детали</h2>
                  <div className="grid grid-cols-2 gap-4">
                    {activity.meta.map((m: any) => (
                      <div key={m.id} className="flex items-center">
                        <span className="text-gray-600">{m.key}:</span>
                        <span className="ml-2 font-medium">{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Sidebar */}
          <aside className="lg:w-1/3">
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Забронировать</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-600">Цена:</span>
                    <span className="ml-2 font-bold text-lg text-green-600">
                      {activity.salePrice || activity.price} ₽
                    </span>
                  </div>
                  <Link
                    href={`/booking?type=activity&id=${activity.id}`}
                    className="block w-full bg-green-600 text-white text-center py-3 rounded-lg hover:bg-green-700"
                  >
                    Записаться
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

export async function generateMetadata({ params }: ActivityPageProps) {
  const activityId = parseInt(params.slug);
  if (isNaN(activityId)) return {};

  const activity = await prisma.post.findUnique({
    where: { id: activityId },
  });

  return {
    title: activity?.title || "Активность",
    description: activity?.excerpt || activity?.content?.substring(0, 160),
  };
}
