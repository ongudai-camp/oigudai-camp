import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = parseInt((session.user as any).id);

  // Get user with bookings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: {
        include: { post: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 bg-white rounded-lg shadow p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-blue-600 font-bold">
                  {user.name?.[0] || "U"}
                </span>
              </div>
              <h3 className="font-semibold">{user.name || "Пользователь"}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {user.role}
              </span>
            </div>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="block px-4 py-2 rounded bg-blue-50 text-blue-600"
              >
                Мои бронирования
              </Link>
              <Link
                href="/dashboard/profile"
                className="block px-4 py-2 rounded hover:bg-gray-50"
              >
                Профиль
              </Link>
              <Link
                href="/dashboard/wishlist"
                className="block px-4 py-2 rounded hover:bg-gray-50"
              >
                Избранное
              </Link>
              {user.role === "admin" && (
                <Link
                  href="/admin"
                  className="block px-4 py-2 rounded hover:bg-gray-50 text-red-600"
                >
                  Админ панель
                </Link>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h1 className="text-2xl font-bold mb-4">Добро пожаловать, {user.name}!</h1>
              <p className="text-gray-600">
                Здесь вы можете управлять своими бронированиями и просматривать историю поездок.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Последние бронирования</h2>

              {user.bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>У вас пока нет бронирований</p>
                  <Link href="/hotels" className="text-blue-600 hover:underline mt-2 inline-block">
                    Найти отель
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {user.bookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-semibold">{booking.post.title}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(booking.checkIn).toLocaleDateString("ru-RU")} -
                          {booking.checkOut
                            ? new Date(booking.checkOut).toLocaleDateString("ru-RU")
                            : "не указано"}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded ${
                            booking.status === "confirmed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{booking.totalPrice} ₽</p>
                        <p className="text-sm text-gray-500">{booking.bookingId}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
