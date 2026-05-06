import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AdminToursPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const tours = await prisma.post.findMany({
    where: { type: "tour" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление турами</h1>
        <Link
          href="/admin/tours/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Добавить тур
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
                Автор
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Цена
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бронирований
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {tours.map((tour: any) => (
              <tr key={tour.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{tour.title}</div>
                  <div className="text-sm text-gray-500">{tour.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tour.author?.name || "Неизвестно"}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {tour.price} ₽
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tour._count.bookings}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      tour.status === "publish"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tour.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/admin/tours/${tour.id}/edit`}
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

        {tours.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Туры не найдены.{" "}
            <Link href="/admin/tours/new" className="text-blue-600 hover:underline">
              Добавить первый тур
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
