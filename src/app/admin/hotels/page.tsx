import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AdminHotelsPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const hotels = await prisma.post.findMany({
    where: { type: "hotel" },
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
              <Link href="/admin/hotels" className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
                Отели
              </Link>
              <Link href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-50">
                Бронирования
              </Link>
              <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-50">
                Пользователи
              </Link>
              <Link href="/admin/packages" className="block px-4 py-2 rounded hover:bg-gray-50">
                Пакеты
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Управление отелями</h1>
              <Link
                href="/admin/hotels/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Добавить отель
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
                      Автор
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Цена
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Бронирований
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Статус
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Дата
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {hotels.map((hotel: any) => (
                    <tr key={hotel.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{hotel.title}</div>
                        <div className="text-sm text-gray-500">{hotel.address}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {hotel.author?.name || "Неизвестно"}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        {hotel.price} ₽
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {hotel._count.bookings}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            hotel.status === "publish"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {hotel.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(hotel.createdAt), "dd MMM yyyy", { locale: ru })}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <Link
                          href={`/admin/hotels/${hotel.id}/edit`}
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

              {hotels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Отели не найдены.{" "}
                  <Link href="/admin/hotels/new" className="text-blue-600">
                    Добавить первый отель
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
