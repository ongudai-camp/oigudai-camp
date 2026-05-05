import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminActivitiesPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const activities = await prisma.post.findMany({
    where: { type: "activity" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление активностями</h1>
        <Link
          href="/admin/activities/new"
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Добавить активность
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Название
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Локация
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бронирований
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity: any) => (
              <tr key={activity.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity.address}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {activity.price} ₽
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {activity._count.bookings}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/activities/${activity.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer transition-colors duration-200"
                  >
                    Редактировать
                  </Link>
                  <button className="text-red-600 hover:text-red-900 cursor-pointer transition-colors duration-200">
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Активности не найдены.{" "}
            <Link href="/admin/activities/new" className="text-blue-600 hover:underline">
              Добавить первую активность
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

  const activities = await prisma.post.findMany({
    where: { type: "activity" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Админ панель</h2>
            <nav className="space-y-2">
              <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-50">
                Дашборд
              </Link>
              <Link href="/admin/hotels" className="block px-4 py-2 rounded hover:bg-gray-50">
                Отели
              </Link>
              <Link href="/admin/tours" className="block px-4 py-2 rounded hover:bg-gray-50">
                Туры
              </Link>
              <Link href="/admin/activities" className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
                Активности
              </Link>
              <Link href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-50">
                Бронирования
              </Link>
              <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-50">
                Пользователи
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Управление активностями</h1>
              <Link
                href="/admin/activities/new"
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Добавить активность
              </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Название
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Локация
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Бронирований
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {activities.map((activity: any) => (
                    <tr key={activity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{activity.title}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.address}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {activity.price} ₽
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity._count.bookings}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/admin/activities/${activity.id}/edit`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Редактировать
                        </Link>
                        <button className="text-red-600 hover:text-red-900">
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {activities.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Активности не найдены.{" "}
                  <Link href="/admin/activities/new" className="text-blue-600">
                    Добавить первую активность
                  </Link>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
