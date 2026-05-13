import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import { isAdmin } from "@/lib/adminAccess";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import DashboardSidebarClient from "@/components/dashboard/DashboardSidebarClient";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userId = parseInt(session.user.id);
  const isAdminUser = isAdmin(session.user.role);

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

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

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
          {/* Unified Sidebar */}
          <DashboardSidebarClient>
          <aside className="bg-white rounded-xl shadow-lg p-6 h-full">
            <div className="text-center mb-6 pb-6 border-b border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-sky-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200">
                <span className="text-2xl text-white font-bold">
                  {user.name?.[0] || "U"}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{user.name || "User"}</h3>
              <p className="text-sm text-[#1A2B48]">{user.phone || user.email}</p>
              <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${
                isAdminUser ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
              }`}>
                {user.role}
              </span>
            </div>

            <nav className="space-y-1">
              <p className="text-xs font-semibold text-[#1A2B48] uppercase tracking-wider px-4 mb-2">
                Личное
              </p>
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition-all duration-200"
              >
                <span className="text-lg">📊</span>
                <span>{t("title")}</span>
              </Link>
              {!isAdminUser && (
                <Link
                  href={`/${locale}/dashboard/bookings`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                >
                  <span className="text-lg">📋</span>
                  <span>{t("myBookings")}</span>
                </Link>
              )}
              <Link
                href={`/${locale}/dashboard/wishlist`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                <span className="text-lg">❤️</span>
                <span>{t("wishlist")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                <span className="text-lg">👤</span>
                <span>{t("profile")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/chat`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                <span className="text-lg">💬</span>
                <span>{t("support")}</span>
              </Link>

              {isAdminUser && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-[#1A2B48] uppercase tracking-wider px-4 mb-2">
                      Управление
                    </p>
                    <Link
                      href={`/${locale}/admin`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg bg-purple-50 text-purple-700 font-medium transition-all duration-200"
                    >
                      <span className="text-lg">📊</span>
                      <span>{t("adminPanel")}</span>
                    </Link>
                    <Link
                      href={`/${locale}/admin/users`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                    >
                      <span className="text-lg">👥</span>
                      <span>Пользователи</span>
                    </Link>
                    <Link
                      href={`/${locale}/admin/settings/meta`}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
                    >
                      <span className="text-lg">⚙️</span>
                      <span>{t("settings")}</span>
                    </Link>
                  </div>
                </>
              )}
            </nav>

            <div className="pt-4 mt-4 border-t border-gray-100">
              <Link
                href={`/${locale}`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#1A2B48] hover:bg-gray-50 font-medium transition-all duration-200"
              >
                <span className="text-lg">←</span>
                <span>{tc("back") || "На сайт"}</span>
              </Link>
            </div>
          </aside>
          </DashboardSidebarClient>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-br from-blue-600 to-sky-700 rounded-2xl shadow-lg p-8 text-white">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">
                {t("welcome", { name: user.name || "Guest" })}
              </h1>
              <p className="text-blue-100">
                {t("description")}
              </p>
            </div>

            {/* Personal Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">📋</span>
                  <span className="text-3xl font-bold text-blue-600">{stats.totalBookings}</span>
                </div>
                <h3 className="text-[#1A2B48] text-sm font-medium">{t("stats.total")}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">✅</span>
                  <span className="text-3xl font-bold text-green-600">{stats.confirmed}</span>
                </div>
                <h3 className="text-[#1A2B48] text-sm font-medium">{t("stats.confirmed")}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">⏳</span>
                  <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
                </div>
                <h3 className="text-[#1A2B48] text-sm font-medium">{t("stats.pending")}</h3>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">₽</span>
                  <span className="text-3xl font-bold text-purple-600">{stats.totalSpent.toLocaleString()}</span>
                </div>
                <h3 className="text-[#1A2B48] text-sm font-medium">{t("stats.spent")}</h3>
              </div>
            </div>

            {/* Admin Section */}
            {isAdminUser && (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t-2 border-purple-200 border-dashed" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-[#f8fafc] px-4 text-xs font-semibold text-purple-700 uppercase tracking-widest">
                      Администрирование
                    </span>
                  </div>
                </div>

                {/* Admin System Stats */}
                <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-purple-900">Система управления</h2>
                    <Link
                      href={`/${locale}/admin`}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      {t("adminPanel")} →
                    </Link>
                  </div>
                  <StatsCards />
                </div>

                {/* Admin Charts */}
                <DashboardCharts />

                {/* Admin Recent Bookings */}
                <RecentBookings />
              </>
            )}

            {/* Quick Actions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href={`/${locale}/hotels`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-blue-200 transition-all group"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🏨</span>
                <h3 className="font-semibold text-gray-900 text-sm">Отели</h3>
                <p className="text-xs text-[#1A2B48] mt-1">Найти жильё</p>
              </Link>
              <Link
                href={`/${locale}/tours`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-emerald-200 transition-all group"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🗺️</span>
                <h3 className="font-semibold text-gray-900 text-sm">Туры</h3>
                <p className="text-xs text-[#1A2B48] mt-1">Выбрать тур</p>
              </Link>
              <Link
                href={`/${locale}/activities`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-orange-200 transition-all group"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">🎯</span>
                <h3 className="font-semibold text-gray-900 text-sm">Активности</h3>
                <p className="text-xs text-[#1A2B48] mt-1">Найти занятие</p>
              </Link>
              <Link
                href={`/${locale}/dashboard/chat`}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-green-200 transition-all group"
              >
                <span className="text-3xl block mb-3 group-hover:scale-110 transition-transform">💬</span>
                <h3 className="font-semibold text-gray-900 text-sm">{t("support")}</h3>
                <p className="text-xs text-[#1A2B48] mt-1">Связаться</p>
              </Link>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">{t("recent")}</h2>
                <Link
                  href={`/${locale}/dashboard/bookings`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  {t("myBookings")} →
                </Link>
              </div>

              {user.bookings.length === 0 ? (
                <div className="text-center py-8 text-[#1A2B48]">
                  <p>{t("noBookings")}</p>
                  <div className="flex gap-3 justify-center mt-4">
                    <Link
                      href={`/${locale}/hotels`}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      {t("findHotel")}
                    </Link>
                    <Link
                      href={`/${locale}/tours`}
                      className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
                    >
                      {t("findTour")}
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {user.bookings.map((booking: any) => (
                    <div
                      key={booking.id}
                      className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 hover:border-gray-200 cursor-pointer transition-all duration-200"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.post.title}</h3>
                          {booking.room && (
                            <p className="text-sm text-[#1A2B48]">{booking.room.title}</p>
                          )}
                          <p className="text-sm text-[#1A2B48]">
                            {format(new Date(booking.checkIn), "dd MMM yyyy", { locale: dateLocale })}
                            {booking.checkOut && (
                              <> — {format(new Date(booking.checkOut), "dd MMM yyyy", { locale: dateLocale })}</>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-gray-900">{booking.totalPrice.toLocaleString()} ₽</p>
                          {getStatusBadge(booking.status)}
                          <p className="text-xs text-[#1A2B48] mt-1">{booking.bookingId}</p>
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
