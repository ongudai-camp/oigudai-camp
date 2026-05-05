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
