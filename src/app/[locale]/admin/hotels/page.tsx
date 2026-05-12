import { requireAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function AdminHotelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  const hotels = await prisma.post.findMany({
    where: { type: "hotel" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true, rooms: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Управление отелями</h1>
        <Link
          href={`/${locale}/admin/hotels/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          + Добавить отель
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
                Номеров
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Бронирований
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Статус
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Дата
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Действия
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {// eslint-disable-next-line @typescript-eslint/no-explicit-any
            hotels.map((hotel: any) => (
              <tr key={hotel.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{hotel.title}</div>
                  <div className="text-sm text-gray-500">{hotel.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {hotel.author?.name || "Неизвестно"}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {hotel.price} ₽
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {hotel._count.rooms}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {hotel._count.bookings}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      hotel.status === "publish"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {hotel.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {format(new Date(hotel.createdAt), "dd MMM yyyy", { locale: ru })}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/${locale}/admin/hotels/${hotel.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer transition-colors duration-200"
                  >
                    Редактировать
                  </Link>
                  <DeleteButton id={hotel.id} type="hotels" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {hotels.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Отели не найдены.{" "}
            <Link href={`/${locale}/admin/hotels/new`} className="text-blue-600 hover:underline">
              Добавить первый отель
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
