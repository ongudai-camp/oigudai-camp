import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { isAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import ChatInterface from "@/components/chat/ChatInterface";
import DashboardSidebarClient from "@/components/dashboard/DashboardSidebarClient";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect(`/${locale}/auth/signin`);
  }

  const userId = parseInt(session.user.id);
  const t = await getTranslations("dashboard");
  const tc = await getTranslations("common");
  const isAdminUser = isAdmin(session.user.role);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

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
            </div>

            <nav className="space-y-1">
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
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-all duration-200"
              >
                <span className="text-lg">👤</span>
                <span>{t("profile")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/chat`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 font-medium transition-all duration-200"
              >
                <span className="text-lg">💬</span>
                <span>{t("support")}</span>
              </Link>
            </nav>

            {isAdminUser && (
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
            )}

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

          {/* Main Chat Area */}
          <main className="flex-1">
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden h-[calc(100vh-12rem)]">
              <ChatInterface userId={userId} isAdmin={false} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
