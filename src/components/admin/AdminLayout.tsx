import Link from "next/link";
import { requireAdmin, isSuperAdmin } from "@/lib/adminAccess";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await requireAdmin();
  const isSuper = isSuperAdmin(session.user.role);

  const t = await getTranslations();

  const menuItems = [
    { href: "/admin", label: t("admin.menu.dashboard"), icon: "📊" },
    { href: "/admin/hotels", label: t("admin.menu.hotels"), icon: "🏨" },
    { href: "/admin/tours", label: t("admin.menu.tours"), icon: "🗺️" },
    { href: "/admin/activities", label: t("admin.menu.activities"), icon: "🎯" },
    { href: "/admin/bookings", label: t("admin.menu.bookings"), icon: "📋" },
    { href: "/admin/showcase", label: t("admin.menu.showcase"), icon: "🎬" },
    { href: "/admin/users", label: t("admin.menu.users"), icon: "👥" },
    { href: "/admin/packages", label: t("admin.menu.packages"), icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <aside className="w-64 bg-white shadow-lg border-r border-gray-100 min-h-screen sticky top-0">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "var(--main-color)" }}>
            {t("admin.dashboard.title")}
          </Link>
        </div>
        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-all duration-200"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {isSuper && (
            <div className="pt-6 mt-6 border-t border-gray-100">
              <Link
                href="/superadmin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-600 hover:bg-purple-50 font-semibold cursor-pointer transition-all duration-200"
              >
                <span className="text-lg">⚡</span>
                <span>SuperAdmin</span>
              </Link>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-gray-100">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer transition-all duration-200"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">{t("admin.menu.backToDashboard")}</span>
            </Link>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
