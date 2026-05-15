import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/adminAccess";
import DashboardSidebarClient from "@/components/dashboard/DashboardSidebarClient";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userId = parseInt(session.user.id);
  const isAdminUser = isAdmin(session.user.role);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const t = await getTranslations({ locale, namespace: "dashboard" });
  const tc = await getTranslations({ locale, namespace: "common" });

  const sidebarContent = (
    <>
      <div className="text-center mb-6 pb-6 border-b border-gray-100">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-200 overflow-hidden">
          {user.image ? (
            <img src={user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center">
              <span className="text-2xl text-white font-bold">{user.name?.[0] || "U"}</span>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-lg">{user.name || "User"}</h3>
        <p className="text-sm text-gray-500">{user.phone || user.email}</p>
        <span className={`inline-block mt-2 px-3 py-1 text-xs rounded-full font-medium ${
          isAdminUser ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
        }`}>
          {user.role}
        </span>
      </div>

      <nav className="space-y-1">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
          {t("personal") || "Личное"}
        </p>
        <Link
          href={`/${locale}/dashboard`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
        >
          <span className="text-lg">📊</span>
          <span>{t("title")}</span>
        </Link>
        <Link
          href={`/${locale}/dashboard/bookings`}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
        >
          <span className="text-lg">📋</span>
          <span>{t("myBookings")}</span>
        </Link>
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-2">
                {t("management") || "Управление"}
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
                <span>{t("users") || "Пользователи"}</span>
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
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-500 hover:bg-gray-50 font-medium transition-all duration-200"
        >
          <span className="text-lg">←</span>
          <span>{tc("back") || "На сайт"}</span>
        </Link>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-8">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
          <DashboardSidebarClient>
            {sidebarContent}
          </DashboardSidebarClient>
          <main className="flex-1 min-w-0 space-y-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
