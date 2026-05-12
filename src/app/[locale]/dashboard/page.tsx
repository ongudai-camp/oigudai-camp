import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { getTranslations } from "next-intl/server";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("dashboard");

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userId = parseInt(session.user.id);

  // Get user with bookings
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bookings: {
        include: { post: true, room: true },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  // Date fns locale
  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

  // Stats
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const stats = {
    totalBookings: user.bookings.length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    confirmed: user.bookings.filter((b: any) => b.status === "confirmed").length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pending: user.bookings.filter((b: any) => b.status === "pending").length,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    totalSpent: user.bookings.reduce((sum: number, b: any) => sum + b.totalPrice, 0),
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      confirmed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-3 py-1 text-xs rounded-full ${styles[status] || "bg-gray-100 text-gray-800"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 bg-white rounded-xl shadow-lg p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-blue-600 font-bold">
                  {user.name?.[0] || "U"}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{user.name || "User"}</h3>
              <p className="text-sm text-gray-500">{user.phone || user.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {user.role}
              </span>
            </div>

            <nav className="space-y-2">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 cursor-pointer transition-all duration-200"
              >
                <span>📋</span>
                <span className="font-medium">{t("myBookings")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <span>⚙️</span>
                <span className="font-medium">{t("settings")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <span>👤</span>
                <span className="font-medium">{t("profile")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/wishlist`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <span>❤️</span>
                <span className="font-medium">{t("wishlist")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/chat`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <span>💬</span>
                <span className="font-medium">{t("support")}</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href={`/${locale}/admin`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-200"
                >
                  <span>⚙️</span>
                  <span className="font-medium">{t("adminPanel")}</span>
                </Link>
              )}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 mb-6">
              <h1 className="text-2xl font-bold mb-2">
                {t("welcome", { name: user.name || "Guest" })}
              </h1>
              <p className="text-gray-600">
                {t("description")}
              </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📋</span>
                  <span className="text-3xl font-bold text-blue-600">{stats.totalBookings}</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">{t("stats.total")}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-3xl font-bold text-green-600">{stats.confirmed}</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">{t("stats.confirmed")}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⏳</span>
                  <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">{t("stats.pending")}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">₽</span>
                  <span className="text-3xl font-bold text-purple-600">{stats.totalSpent}</span>
                </div>
                <h3 className="text-gray-500 text-sm font-medium">{t("stats.spent")}</h3>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6">
              <h2 className="text-xl font-semibold mb-4">{t("recent")}</h2>

              {user.bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>{t("noBookings")}</p>
                  <Link href={`/${locale}/hotels`} className="text-blue-600 hover:underline mt-2 inline-block">
                    {t("findHotel")}
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {user.bookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.post.title}</h3>
                          {booking.room && (
                            <p className="text-sm text-gray-600">{booking.room.title}</p>
                          )}
                          <p className="text-sm text-gray-500">
                            {format(new Date(booking.checkIn), "dd MMM yyyy", { locale: dateLocale })}
                            {booking.checkOut && (
                              <> — {format(new Date(booking.checkOut), "dd MMM yyyy", { locale: dateLocale })}</>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{booking.totalPrice} ₽</p>
                          {getStatusBadge(booking.status)}
                          <p className="text-xs text-gray-500 mt-1">{booking.bookingId}</p>
                        </div>
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
