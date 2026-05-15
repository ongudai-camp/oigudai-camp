import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  const t = await getTranslations({ locale, namespace: "dashboard" });

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

  const localeLabels: Record<string, string> = {
    ru: "Русский",
    en: "English",
    kk: "Қазақша",
  };

  return (
    <>
          <div className="space-y-6">
            {/* Welcome Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold mb-2">{t("settingsTitle")}</h1>
              <p className="text-gray-900">{t("settingsDescription")}</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>👤</span>
                  {t("personalInfo")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">{t("profile")}</label>
                    <p className="text-gray-900 font-medium">{user.name || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">{t("email")}</label>
                    <p className="text-gray-900 font-medium">{user.email || "—"}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">{t("phone")}</label>
                    <p className="text-gray-900 font-medium">{user.phone || "—"}</p>
                  </div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>🔐</span>
                  {t("accountInfo")}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">{t("role")}</label>
                    <p className="text-gray-900 font-medium">{user.role}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">{t("memberSince")}</label>
                    <p className="text-gray-900 font-medium">
                      {format(new Date(user.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-900 mb-1">{t("language")}</label>
                    <p className="text-gray-900 font-medium">{localeLabels[locale] || "English"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
}
