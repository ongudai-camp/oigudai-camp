import Link from "next/link";
import { requireAdmin, isSuperAdmin } from "@/lib/adminAccess";
import { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import AdminSidebarClient from "./AdminSidebarClient";

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
    { href: "/admin/chat", label: t("admin.menu.chat"), icon: "💬" },
    { href: "/admin/users", label: t("admin.menu.users"), icon: "👥" },
    { href: "/admin/packages", label: t("admin.menu.packages"), icon: "📦" },
    { href: "/admin/settings/meta", label: t("admin.menu.settings"), icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <AdminSidebarClient
        menuItems={menuItems}
        title={t("admin.dashboard.title")}
        backLabel={t("admin.menu.backToDashboard")}
        showSuperAdmin={isSuper}
      />

      <main className="flex-1 p-4 md:p-8 pt-24 lg:pt-8">
        {children}
      </main>
    </div>
  );
}
