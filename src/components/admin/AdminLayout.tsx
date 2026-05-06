import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const menuItems = [
    { href: "/admin", label: "Дашборд", icon: "📊" },
    { href: "/admin/hotels", label: "Отели", icon: "🏨" },
    { href: "/admin/tours", label: "Туры", icon: "🗺️" },
    { href: "/admin/activities", label: "Активности", icon: "🎯" },
    { href: "/admin/bookings", label: "Бронирования", icon: "📋" },
    { href: "/admin/showcase", label: "Шоукейс", icon: "🎬" },
    { href: "/admin/users", label: "Пользователи", icon: "👥" },
    { href: "/admin/packages", label: "Пакеты", icon: "📦" },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg border-r border-gray-100 min-h-screen sticky top-0">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "var(--main-color)" }}>
            Админ панель
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
          <div className="pt-6 mt-6 border-t border-gray-100">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer transition-all duration-200"
            >
              <span className="text-lg">←</span>
              <span className="font-medium">В кабинет</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}
