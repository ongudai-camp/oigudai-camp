import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Get stats
  const [totalHotels, totalBookings, totalUsers, recentBookings] = await Promise.all([
    prisma.post.count({ where: { type: "hotel" } }),
    prisma.booking.count(),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { post: true, user: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Админ панель</h2>
            <nav className="space-y-2">
              <Link href="/admin" className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
                Дашборд
              </Link>
              <Link href="/admin/hotels" className="block px-4 py-2 rounded hover:bg-gray-50">
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
              <div className="pt-4 border-t">
                <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-50">
                  ← В кабинет
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <h1 className="text-2xl font-bold mb-6">Обзор системы</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm">Всего отелей</h3>
                <p className="text-3xl font-bold text-blue-600">{totalHotels}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm">Всего бронирований</h3>
                <p className="text-3xl font-bold text-green-600">{totalBookings}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-gray-500 text-sm">Пользователей</h3>
                <p className="text-3xl font-bold text-purple-600">{totalUsers}</p>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Последние бронирования</h2>

              {recentBookings.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Нет бронирований</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">ID</th>
                        <th className="text-left py-2">Объект</th>
                        <th className="text-left py-2">Пользователь</th>
                        <th className="text-left py-2">Дата</th>
                        <th className="text-left py-2">Сумма</th>
                        <th className="text-left py-2">Статус</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentBookings.map((booking: any) => (
                        <tr key={booking.id} className="border-b hover:bg-gray-50">
                          <td className="py-3">{booking.bookingId}</td>
                          <td className="py-3">{booking.post.title}</td>
                          <td className="py-3">{booking.user.name || booking.user.email}</td>
                          <td className="py-3">
                            {format(new Date(booking.checkIn), "dd MMM yyyy", { locale: ru })}
                          </td>
                          <td className="py-3 font-semibold">{booking.totalPrice} ₽</td>
                          <td className="py-3">
                            <span
                              className={`px-2 py-1 text-xs rounded ${
                                booking.status === "confirmed"
                                  ? "bg-green-100 text-green-800"
                                  : booking.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
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
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
