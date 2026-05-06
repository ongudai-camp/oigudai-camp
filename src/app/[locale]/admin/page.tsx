import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Get stats
  const [totalHotels, totalTours, totalActivities, totalBookings, totalUsers, recentBookings] = await Promise.all([
    prisma.post.count({ where: { type: "hotel" } }),
    prisma.post.count({ where: { type: "tour" } }),
    prisma.post.count({ where: { type: "activity" } }),
    prisma.booking.count(),
    prisma.user.count(),
    prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { post: true, user: true },
    }),
  ]);

  const stats = [
    { label: "Отели", value: totalHotels, color: "blue", icon: "🏨" },
    { label: "Туры", value: totalTours, color: "green", icon: "🗺️" },
    { label: "Активности", value: totalActivities, color: "purple", icon: "🎯" },
    { label: "Бронирования", value: totalBookings, color: "yellow", icon: "📋" },
    { label: "Пользователи", value: totalUsers, color: "pink", icon: "👥" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Обзор системы</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <span className={`text-3xl font-bold text-${stat.color}-600`}>{stat.value}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium">{stat.label}</h3>
          </div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
        <h2 className="text-xl font-semibold mb-4">Последние бронирования</h2>

        {recentBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Нет бронирований</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Объект</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Пользователь</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Сумма</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">Статус</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking: any) => (
                  <tr key={booking.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                    <td className="py-4 px-4">{booking.bookingId}</td>
                    <td className="py-4 px-4 font-medium text-gray-900">{booking.post.title}</td>
                    <td className="py-4 px-4 text-gray-600">{booking.user.name || booking.user.email}</td>
                    <td className="py-4 px-4 text-gray-600">
                      {format(new Date(booking.checkIn), "dd MMM yyyy", { locale: ru })}
                    </td>
                    <td className="py-4 px-4 font-semibold text-gray-900">{booking.totalPrice} ₽</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-full ${
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
    </div>
  );
}
