import { requireAdmin, isSuperAdmin } from "@/lib/adminAccess";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import AdminSidebarClient from "./AdminSidebarClient";

export default async function AdminLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await requireAdmin();
  const isSuper = isSuperAdmin(session.user.role);

  const t = await getTranslations({ locale, namespace: 'admin' });

  const menuItems = [
    { href: "/admin", label: t("menu.dashboard"), icon: "📊" },
    { href: "/admin/calendar", label: "Календарь", icon: "📅" },
    { href: "/admin/hotels", label: t("menu.hotels"), icon: "🏨" },
    { href: "/admin/tours", label: t("menu.tours"), icon: "🗺️" },
    { href: "/admin/activities", label: t("menu.activities"), icon: "🎯" },
    { href: "/admin/bookings", label: t("menu.bookings"), icon: "📋" },
    { href: "/admin/addons", label: "Услуги", icon: "➕" },
    { href: "/admin/promocodes", label: "Промокоды", icon: "🏷️" },
    { href: "/admin/reviews", label: "Отзывы", icon: "⭐" },
    { href: "/admin/categories", label: "Категории", icon: "📁" },
    { href: "/admin/pages", label: t("menu.pages"), icon: "📄" },
    { href: "/admin/media", label: t("menu.media"), icon: "🖼️" },
    { href: "/admin/showcase", label: t("menu.showcase"), icon: "🎬" },
    { href: "/admin/chat", label: t("menu.chat"), icon: "💬" },
    { href: "/admin/users", label: t("menu.users"), icon: "👥" },
    { href: "/admin/packages", label: t("menu.packages"), icon: "📦" },
    { href: "/admin/settings/general", label: "Общие", icon: "⚙️" },
    { href: "/admin/settings/meta", label: "Мета", icon: "🏷️" },
    { href: "/admin/settings/chat", label: "AI Чат", icon: "🤖" },
    { href: "/admin/audit-log", label: t("menu.auditLog"), icon: "📝" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col lg:flex-row">
      <AdminSidebarClient
        menuItems={menuItems}
        title={t("dashboard.title")}
        backLabel={t("menu.backToDashboard")}
        showSuperAdmin={isSuper}
      />

      <main className="flex-1 p-4 md:p-8 pt-36 lg:pt-8 min-w-0 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
