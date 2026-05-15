import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format, differenceInDays } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { getTranslations } from "next-intl/server";
import { isAdmin } from "@/lib/adminAccess";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import UserStatsCards from "@/components/dashboard/UserStatsCards";
import {
  Calendar,
  MapPin,
  ChevronRight,
  Hotel,
  Compass,
  Zap,
  MessageCircle,
  TrendingUp,
  Clock,
} from "lucide-react";

interface DashboardPageProps {
  params: Promise<{ locale: string }>;
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-100 text-emerald-800",
  pending: "bg-amber-100 text-amber-800",
  cancelled: "bg-rose-100 text-rose-800",
  completed: "bg-blue-100 text-blue-800",
};

const localeMap = { ru, en: enUS, kk };

function getStatusBadge(status: string) {
  return (
    <span
      className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {status}
    </span>
  );
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: "dashboard" });

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

  const dateLocale = localeMap[locale as keyof typeof localeMap] || enUS;

  const upcomingBookings = user.bookings.filter(
    (b) => b.status === "confirmed" || b.status === "pending"
  );
  const pastBookings = user.bookings.filter(
    (b) => b.status === "completed" || b.status === "cancelled"
  );
  const nextTrip = upcomingBookings[0];

  const quickActions = [
    {
      href: `/${locale}/hotels`,
      icon: Hotel,
      label: t("hotels") || "Отели",
      desc: "Найти жильё",
      hoverBorder: "hover:border-blue-200",
      hoverIcon: "group-hover:text-blue-600",
    },
    {
      href: `/${locale}/tours`,
      icon: Compass,
      label: t("tours") || "Туры",
      desc: "Выбрать тур",
      hoverBorder: "hover:border-emerald-200",
      hoverIcon: "group-hover:text-emerald-600",
    },
    {
      href: `/${locale}/activities`,
      icon: Zap,
      label: t("activities") || "Активности",
      desc: "Найти занятие",
      hoverBorder: "hover:border-orange-200",
      hoverIcon: "group-hover:text-orange-600",
    },
    {
      href: `/${locale}/dashboard/chat`,
      icon: MessageCircle,
      label: t("support"),
      desc: "Связаться",
      hoverBorder: "hover:border-violet-200",
      hoverIcon: "group-hover:text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-sky-900 via-sky-800 to-blue-900 rounded-2xl p-6 md:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-sky-300 to-blue-400 flex items-center justify-center shadow-xl shrink-0 ring-4 ring-white/20">
            <span className="text-2xl md:text-3xl font-bold text-sky-900">
              {user.name?.[0] || "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl md:text-2xl font-bold truncate">
              {t("welcome", { name: user.name || "Guest" })}
            </h1>
            <p className="text-sky-200 text-sm mt-1">
              {user.phone || user.email || ""}
            </p>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold">
                {user.bookings.length}
              </p>
              <p className="text-xs text-sky-200 mt-0.5">
                {t("myBookings")}
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {upcomingBookings.length}
              </p>
              <p className="text-xs text-sky-200 mt-0.5">
                Предстоит
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* User Stats Cards */}
      <UserStatsCards />

      {/* Next Trip Highlight */}
      {nextTrip && (
        <Link
          href={`/${locale}/dashboard/bookings/${nextTrip.id}`}
          className="block bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 overflow-hidden group"
        >
          <div className="flex flex-col md:flex-row">
            <div className="bg-gradient-to-br from-blue-600 to-sky-700 p-5 md:p-6 md:w-56 shrink-0 flex items-center gap-3 md:gap-4">
              <Calendar size={28} className="text-white/90 shrink-0" />
              <div className="text-white">
                <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">
                  Следующая поездка
                </p>
                <p className="text-lg font-bold mt-0.5">
                  {differenceInDays(new Date(nextTrip.checkIn), new Date()) > 0
                    ? `Через ${differenceInDays(new Date(nextTrip.checkIn), new Date())} дн.`
                    : "Сегодня"}
                </p>
              </div>
            </div>
            <div className="flex-1 p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg truncate">
                  {nextTrip.post.title}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {format(new Date(nextTrip.checkIn), "dd MMM", { locale: dateLocale })}
                    {nextTrip.checkOut && (
                      <> — {format(new Date(nextTrip.checkOut), "dd MMM yyyy", { locale: dateLocale })}</>
                    )}
                  </span>
                  {nextTrip.room && (
                    <span className="flex items-center gap-1">
                      <MapPin size={14} /> {nextTrip.room.title}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 md:text-right shrink-0">
                <div>
                  <p className="font-bold text-lg text-gray-900">
                    {nextTrip.totalPrice.toLocaleString()} ₽
                  </p>
                  {getStatusBadge(nextTrip.status)}
                </div>
                <ChevronRight
                  size={20}
                  className="text-gray-300 group-hover:text-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className={`bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 ${action.hoverBorder} transition-all duration-200 group`}
          >
            <action.icon
              size={24}
              className={`text-gray-400 ${action.hoverIcon} transition-colors mb-2`}
            />
            <h3 className="font-semibold text-gray-900 text-sm">{action.label}</h3>
            <p className="text-xs text-gray-500 mt-0.5">{action.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t("myBookings")}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {t("recent")}
            </p>
          </div>
          <Link
            href={`/${locale}/dashboard/bookings`}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
          >
            Все бронирования
            <ChevronRight size={16} />
          </Link>
        </div>

        {user.bookings.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={28} className="text-gray-300" />
            </div>
            <p className="text-gray-900 font-medium mb-1">
              {t("noBookings")}
            </p>
            <p className="text-sm text-gray-500 mb-5">
              Начните путешествие с Онгудай
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/${locale}/hotels`}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors text-sm"
              >
                {t("findHotel")}
              </Link>
              <Link
                href={`/${locale}/tours`}
                className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors text-sm"
              >
                {t("findTour")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {user.bookings.map((booking, idx) => {
              const isUpcoming =
                booking.status === "confirmed" || booking.status === "pending";
              return (
                <Link
                  key={booking.id}
                  href={`/${locale}/dashboard/bookings/${booking.id}`}
                  className={`block border rounded-xl p-4 transition-all duration-200 ${
                    idx === 0 && isUpcoming
                      ? "border-blue-200 bg-blue-50/50 hover:bg-blue-50"
                      : "border-gray-100 hover:bg-gray-50"
                  } hover:shadow-sm`}
                >
                  <div className="flex items-center gap-4">
                    {/* Timeline dot */}
                    <div className="hidden sm:flex flex-col items-center gap-1 shrink-0">
                      <div
                        className={`w-2.5 h-2.5 rounded-full ${
                          isUpcoming
                            ? "bg-blue-500"
                            : booking.status === "completed"
                            ? "bg-emerald-500"
                            : booking.status === "cancelled"
                            ? "bg-gray-300"
                            : "bg-amber-500"
                        }`}
                      />
                      {idx < user.bookings.length - 1 && (
                        <div className="w-px h-8 bg-gray-200" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900 truncate text-sm">
                          {booking.post.title}
                        </h3>
                        {booking.room && (
                          <span className="text-xs text-gray-500 hidden md:inline">
                            {booking.room.title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {format(new Date(booking.checkIn), "dd MMM", { locale: dateLocale })}
                          {booking.checkOut && (
                            <> — {format(new Date(booking.checkOut), "dd MMM", { locale: dateLocale })}</>
                          )}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span>{booking.totalPrice.toLocaleString()} ₽</span>
                      </div>
                    </div>

                    {/* Status & Arrow */}
                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(booking.status)}
                      <ChevronRight
                        size={18}
                        className="text-gray-300 group-hover:text-blue-500 transition-colors"
                      />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
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
                {t("managementSection") || "Администрирование"}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-purple-900">
                {t("adminPanel")}
              </h2>
              <Link
                href={`/${locale}/admin`}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
              >
                {t("adminPanel")} →
              </Link>
            </div>
            <StatsCards />
          </div>

          <DashboardCharts />
          <RecentBookings />
        </>
      )}
    </div>
  );
}
