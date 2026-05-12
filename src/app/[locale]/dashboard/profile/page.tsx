import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";

export default async function ProfilePage({
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

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    redirect(`/${locale}/auth/signin`);
  }

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 bg-white rounded-xl shadow-lg p-6 sticky top-24 self-start">
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <span>📋</span>
                <span className="font-medium">{t("myBookings")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <span>⚙️</span>
                <span className="font-medium">{t("settings")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 transition-all duration-200"
              >
                <span>👤</span>
                <span className="font-medium">{t("profile")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/chat`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <span>💬</span>
                <span className="font-medium">{t("support")}</span>
              </Link>
              {user.role === "admin" && (
                <Link
                  href={`/${locale}/admin`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <span>⚙️</span>
                  <span className="font-medium">{t("adminPanel")}</span>
                </Link>
              )}
            </nav>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold mb-2">{t("profile")}</h1>
              <p className="text-gray-600">{t("settingsDescription")}</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span>👤</span>
                {t("personalInfo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">{t("profile")}</label>
                  <p className="text-lg font-medium text-gray-900">{user.name || "—"}</p>
                  <div className="h-2 w-12 bg-blue-100 rounded-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">{t("email")}</label>
                  <p className="text-lg font-medium text-gray-900">{user.email || "—"}</p>
                  <div className="h-2 w-12 bg-blue-100 rounded-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">{t("phone")}</label>
                  <p className="text-lg font-medium text-gray-900">{user.phone || "—"}</p>
                  <div className="h-2 w-12 bg-blue-100 rounded-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">{t("role")}</label>
                  <p className="text-lg font-medium text-gray-900 capitalize">{user.role}</p>
                  <div className="h-2 w-12 bg-blue-100 rounded-full" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm text-gray-500">{t("memberSince")}</label>
                  <p className="text-lg font-medium text-gray-900">
                    {format(new Date(user.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                  </p>
                  <div className="h-2 w-12 bg-blue-100 rounded-full" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
