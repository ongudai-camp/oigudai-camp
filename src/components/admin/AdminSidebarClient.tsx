"use client";

import { useState, type ReactNode, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronLeft, ChevronRight, LayoutDashboard, Calendar, Hotel, Map, Compass, ClipboardList, PlusCircle, Tag, Star, FolderOpen, FileText, Image as ImageIcon, Film, MessageCircle, Users, Box, Settings, Sliders, Bot, ShieldCheck, ArrowLeft } from "lucide-react";

interface AdminSidebarClientProps {
  menuItems: { href: string; label: string; icon: string | ReactNode }[];
  title: string;
  backLabel: string;
  showSuperAdmin: boolean;
}

const ICON_MAP: Record<string, any> = {
  "📊": LayoutDashboard,
  "📅": Calendar,
  "🏨": Hotel,
  "🗺️": Map,
  "🎯": Compass,
  "📋": ClipboardList,
  "➕": PlusCircle,
  "🏷️": Tag,
  "⭐": Star,
  "📁": FolderOpen,
  "📄": FileText,
  "🖼️": ImageIcon,
  "🎬": Film,
  "💬": MessageCircle,
  "👥": Users,
  "📦": Box,
  "⚙️": Settings,
  "🤖": Bot,
  "📝": ShieldCheck,
};

export default function AdminSidebarClient({
  menuItems,
  title,
  backLabel,
  showSuperAdmin,
}: AdminSidebarClientProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const navItems = useMemo(() =>
    menuItems.map((item) => {
      const IconComp = typeof item.icon === "string" ? ICON_MAP[item.icon] || LayoutDashboard : null;
      return {
        ...item,
        IconComp,
        isActive: pathname === item.href || pathname.startsWith(item.href + "/"),
      };
    }),
    [menuItems, pathname]
  );

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="mb-6 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-purple-200 shrink-0">
            <ShieldCheck size={24} />
          </div>
          <div className={`${desktopCollapsed ? "hidden" : "block"} overflow-hidden`}>
            <h3 className="font-bold text-lg text-gray-900 truncate">{title}</h3>
            <p className="text-xs text-purple-600 font-bold uppercase tracking-wider">Админ-панель</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-2 -mr-2" style={{ scrollbarWidth: 'none' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
              item.isActive
                ? "bg-purple-50 text-purple-700 shadow-sm shadow-purple-100"
                : "text-gray-600 hover:bg-gray-50 hover:text-purple-600"
            }`}
            title={desktopCollapsed ? item.label : ""}
          >
            <div className={`shrink-0 transition-transform duration-200 ${item.isActive ? "scale-110" : "group-hover:scale-110"}`}>
              {item.IconComp ? <item.IconComp size={20} /> : <span className="text-lg">{item.icon}</span>}
            </div>
            <span className={`font-medium text-sm transition-opacity duration-200 ${desktopCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
              {item.label}
            </span>
          </Link>
        ))}

        {showSuperAdmin && (
          <div className="pt-4 mt-4 border-t border-gray-100">
            <Link
              href="/superadmin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-amber-600 hover:bg-amber-50 font-bold transition-all duration-200 group"
              title={desktopCollapsed ? "SuperAdmin" : ""}
            >
              <div className="shrink-0 group-hover:scale-110 transition-transform">
                <ShieldCheck size={20} />
              </div>
              <span className={`text-sm transition-opacity duration-200 ${desktopCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
                SuperAdmin
              </span>
            </Link>
          </div>
        )}
      </nav>

      <div className="pt-4 mt-4 border-t border-gray-100 shrink-0">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
          title={desktopCollapsed ? backLabel : ""}
        >
          <div className="shrink-0 group-hover:-translate-x-1 transition-transform">
            <ArrowLeft size={20} />
          </div>
          <span className={`text-sm font-medium transition-opacity duration-200 ${desktopCollapsed ? "opacity-0 w-0" : "opacity-100"}`}>
            {backLabel}
          </span>
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <div className="lg:hidden fixed top-20 inset-x-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <ShieldCheck size={18} />
          </div>
          <span className="font-bold text-gray-900">{title}</span>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          aria-label="Open admin menu"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile: backdrop overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: bottom sheet */}
      <aside
        className={`
          lg:hidden fixed inset-x-0 bottom-0 z-[70] bg-white rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          max-h-[85vh] flex flex-col
          ${mobileOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center border-b border-gray-100 rounded-t-3xl shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {sidebarContent}
        </div>
      </aside>

      {/* Desktop: collapsible sidebar */}
      <aside
        className={`
          hidden lg:block relative shrink-0
          transition-all duration-300 ease-in-out
          ${desktopCollapsed ? "w-20" : "w-72"}
        `}
      >
        <div className="sticky top-24 h-[calc(100vh-8rem)]">
          {/* Collapse toggle */}
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="absolute -right-3 top-4 z-50 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-900 hover:text-purple-700 hover:border-purple-200 transition-all hover:shadow-lg cursor-pointer"
            aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {desktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div
            className={`
              bg-white rounded-2xl shadow-xl border border-white p-6 h-full overflow-hidden text-gray-900
              transition-all duration-300 ease-in-out
              ${desktopCollapsed ? "px-3" : "px-6"}
            `}
          >
            {sidebarContent}
          </div>
        </div>
      </aside>
    </>
  );
}
