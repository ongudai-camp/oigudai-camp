import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const statusFilter = (await searchParams).status;

  const bookings = await prisma.booking.findMany({
    where: statusFilter ? { status: statusFilter } : {},
    orderBy: { createdAt: "desc" },
    include: { post: true, user: true, room: true },
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
              <Link href="/admin/bookings" className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
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
            <h1 className="text-2xl font-bold mb-6">Управление бронированиями</h1>

            {/* Status Filter */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex gap-2">
                <Link
                  href="/admin/bookings"
                  className={`px-4 py-2 rounded ${!statusFilter ? "bg-blue-600 text-white" : "bg-gray-100"}`}
                >
                  Все
                </Link>
                <Link
                  href="/admin/bookings?status=pending"
                  className={`px-4 py-2 rounded ${statusFilter === "pending" ? "bg-yellow-500 text-white" : "bg-gray-100"}`}
                >
                  Ожидающие
                </Link>
                <Link
                  href="/admin/bookings?status=confirmed"
                  className={`px-4 py-2 rounded ${statusFilter === "confirmed" ? "bg-green-500 text-white" : "bg-gray-100"}`}
                >
                  Подтвержденные
                </Link>
                <Link
                  href="/admin/bookings?status=cancelled"
                  className={`px-4 py-2 rounded ${statusFilter === "cancelled" ? "bg-red-500 text-white" : "bg-gray-100"}`}
                >
                  Отмененные
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Объект
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Клиент
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Даты
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Сумма
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Статус
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map((booking: any) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-mono">{booking.bookingId}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium">{booking.post.title}</div>
                        {booking.room && (
                          <div className="text-sm text-gray-500">{booking.room.title}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {booking.user.name || booking.user.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(booking.checkIn), "dd.MM.yyyy")}
                        {booking.checkOut && (
                          <span> - {format(new Date(booking.checkOut), "dd.MM.yyyy")}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {booking.totalPrice} ₽
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
