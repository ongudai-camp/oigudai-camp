"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

interface AdminSidebarClientProps {
  menuItems: { href: string; label: string; icon: string }[];
  title: string;
  backLabel: string;
  showSuperAdmin: boolean;
}

export default function AdminSidebarClient({
  menuItems,
  title,
  backLabel,
  showSuperAdmin,
}: AdminSidebarClientProps) {
  const pathname = usePathname();

  const navItems = useMemo(() =>
    menuItems.map((item) => ({
      ...item,
      isActive: pathname === item.href || pathname.startsWith(item.href + "/"),
    })),
    [menuItems, pathname]
  );

  return (
    <aside className="hidden lg:block w-64 shrink-0">
      <div className="sticky top-24">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <Link
            href="/admin"
            className="text-xl font-bold text-main hover:opacity-80 transition-opacity"
          >
            {title}
          </Link>
        </div>

        <nav className="px-4 pb-6">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                    item.isActive
                      ? "bg-blue-50 text-blue-600 font-semibold"
                      : "text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                  }`}
                >
                  <span className="text-lg" aria-hidden="true">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {showSuperAdmin && (
            <div className="pt-6 mt-6 border-t border-gray-100">
              <Link
                href="/superadmin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-600 hover:bg-purple-50 font-semibold transition-colors duration-200"
              >
                <span className="text-lg" aria-hidden="true">⚡</span>
                <span>SuperAdmin</span>
              </Link>
            </div>
          )}

          <div className="pt-6 mt-6 border-t border-gray-100">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-900 hover:bg-gray-50 transition-all duration-200"
            >
              <span className="text-lg" aria-hidden="true">←</span>
              <span className="font-medium">{backLabel}</span>
            </Link>
          </div>
        </nav>
      </div>
    </aside>
  );
}
