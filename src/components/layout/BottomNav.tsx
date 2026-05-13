"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { Home, Compass, Calendar, MessageCircle, User, LayoutDashboard, X } from "lucide-react";

const userTabs = [
  { key: "home", href: "/", icon: Home, auth: false },
  { key: "explore", href: "/tours", icon: Compass, auth: false },
  { key: "bookings", href: "/dashboard/bookings", icon: Calendar, auth: true },
  { key: "chat", href: "/dashboard/chat", icon: MessageCircle, auth: true },
  { key: "profile", href: "/dashboard", icon: User, auth: "dynamic" },
] as const;

const adminTabs = [
  { key: "home", href: "/", icon: Home, auth: false },
  { key: "explore", href: "/tours", icon: Compass, auth: false },
  { key: "admin", href: "", icon: LayoutDashboard, auth: true },
  { key: "profile", href: "/admin", icon: User, auth: "dynamic" },
] as const;

type TabItem = {
  key: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  auth: boolean | "dynamic";
};

const adminSheetItems: { href: string; labelKey: string; icon: string }[] = [
  { href: "/admin", labelKey: "menu.dashboard", icon: "📊" },
  { href: "/admin/hotels", labelKey: "menu.hotels", icon: "🏨" },
  { href: "/admin/tours", labelKey: "menu.tours", icon: "🗺️" },
  { href: "/admin/activities", labelKey: "menu.activities", icon: "🎯" },
  { href: "/admin/bookings", labelKey: "menu.bookings", icon: "📋" },
  { href: "/admin/showcase", labelKey: "menu.showcase", icon: "🎬" },
  { href: "/admin/chat", labelKey: "menu.chat", icon: "💬" },
  { href: "/admin/users", labelKey: "menu.users", icon: "👥" },
  { href: "/admin/packages", labelKey: "menu.packages", icon: "📦" },
  { href: "/admin/settings/meta", labelKey: "menu.settings", icon: "⚙️" },
];

export default function BottomNav() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");
  const ta = useTranslations("admin");
  const [userId, setUserId] = useState<number | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);

  const closeAdminMenu = () => setAdminMenuOpen(false);

  const checkSession = () => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user?.id) {
          setUserId(parseInt(data.user.id));
          setRole(data.user.role ?? null);
        } else {
          setUserId(null);
          setRole(null);
        }
        setLoaded(true);
      })
      .catch(() => {
        setUserId(null);
        setRole(null);
        setLoaded(true);
      });
  };

  useEffect(() => {
    checkSession();
    window.addEventListener("focus", checkSession);
    const interval = setInterval(checkSession, 5000);
    return () => {
      window.removeEventListener("focus", checkSession);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    checkSession();
  }, [pathname]);

  useEffect(() => {
    closeAdminMenu();
  }, [pathname]);

  const isAdminUser = role === "admin" || role === "superadmin";
  const tabs = loaded ? (isAdminUser ? adminTabs : userTabs) : userTabs.slice(0, 2);
  const onAdminPage = pathname.startsWith(`/${locale}/admin`);

  const isActive = (href: string) => {
    if (!href) return false;
    if (href === "/") return pathname === `/${locale}`;
    return pathname.startsWith(`/${locale}${href}`);
  };

  const getHref = (tab: TabItem) => {
    if (tab.key === "profile" && !userId) return "/auth/signin";
    return tab.href;
  };

  return (
    <>
      {/* Admin bottom sheet */}
      <div
        className={`fixed inset-0 z-[60] transition-all duration-300 ease-out ${
          adminMenuOpen ? "visible pointer-events-auto" : "invisible pointer-events-none"
        }`}
      >
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
            adminMenuOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeAdminMenu}
        />
        <div
          className={`absolute bottom-0 inset-x-0 bg-white rounded-t-3xl shadow-2xl max-h-[75vh] overflow-y-auto transition-transform duration-300 ease-out ${
            adminMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center border-b border-gray-100 rounded-t-3xl z-10">
            <div className="w-10 h-1 bg-gray-300 rounded-full" />
            <button
              onClick={closeAdminMenu}
              className="absolute right-4 top-3 w-8 h-8 flex items-center justify-center rounded-lg text-[#1A2B48] hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <p className="text-xs font-semibold text-[#1A2B48] uppercase tracking-wider px-4 mb-2">
              {ta("dashboard.title")}
            </p>
            <nav>
              {adminSheetItems.map((item) => {
                const itemActive = pathname === `/${locale}${item.href}` || pathname.startsWith(`/${locale}${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={`/${locale}${item.href}`}
                    onClick={closeAdminMenu}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      itemActive
                        ? "bg-purple-50 text-purple-700 font-semibold"
                        : "text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-medium">{ta(item.labelKey)}</span>
                  </Link>
                );
              })}
              {role === "superadmin" && (
                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link
                    href={`/${locale}/superadmin`}
                    onClick={closeAdminMenu}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-600 hover:bg-purple-50 font-semibold transition-colors duration-200"
                  >
                    <span className="text-lg">⚡</span>
                    <span>SuperAdmin</span>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom nav bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-white/90 backdrop-blur-lg border-t border-gray-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] pb-safe-bottom">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            if (tab.auth && !userId && tab.key !== "profile") return null;

            const Icon = tab.icon;
            const href = getHref(tab);
            const active = tab.key === "admin" ? onAdminPage : isActive(tab.href);

            if (tab.key === "admin") {
              return (
                <button
                  key={tab.key}
                  onClick={() => setAdminMenuOpen(true)}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full transition-colors relative ${
                    active ? "text-orange-500" : "text-[#1A2B48] hover:text-[#1A2B48]"
                  }`}
                >
                  {active && (
                    <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
                  )}
                  <Icon size={active ? 22 : 20} />
                  <span className="text-[10px] font-bold leading-none">
                    {t("admin")}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={tab.key}
                href={`/${locale}${href}`}
                className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] h-full transition-colors relative ${
                  active ? "text-orange-500" : "text-[#1A2B48] hover:text-[#1A2B48]"
                }`}
              >
                {active && (
                  <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-orange-500 rounded-full" />
                )}
                <Icon size={active ? 22 : 20} />
                <span className="text-[10px] font-bold leading-none">
                  {tab.key === "home" ? t("home") :
                   tab.key === "explore" ? t("tours") :
                   tab.key === "bookings" ? "Бронь" :
                   tab.key === "chat" ? "Чат" :
                   userId ? t("dashboard") : t("login")}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
