"use client";

import { useState, type ReactNode } from "react";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

export default function DashboardSidebarClient({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="md:hidden flex items-center gap-2 text-sm font-bold text-sky-700 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3 mb-4 w-full hover:bg-sky-50 transition-colors"
        aria-label="Open sidebar menu"
      >
        <Menu size={18} />
        Меню
      </button>

      {/* Mobile: backdrop overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile: bottom sheet */}
      <aside
        className={`
          md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl
          transition-transform duration-300 ease-out
          max-h-[75vh] overflow-y-auto
          ${mobileOpen ? "translate-y-0" : "translate-y-full"}
        `}
      >
        <div className="sticky top-0 bg-white pt-3 pb-2 flex justify-center border-b border-gray-100 rounded-t-3xl">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute right-4 top-3 w-8 h-8 flex items-center justify-center rounded-lg text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </aside>

      {/* Desktop: collapsible sidebar */}
      <aside
        className={`
          hidden md:block relative
          transition-all duration-300 ease-out
          ${desktopCollapsed ? "w-16" : "w-72"}
        `}
      >
        <div className="sticky top-24 h-fit">
          {/* Collapse toggle */}
          <button
            onClick={() => setDesktopCollapsed(!desktopCollapsed)}
            className="absolute -right-3 top-4 z-10 w-7 h-7 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center text-gray-900 hover:text-sky-700 hover:border-sky-200 transition-all hover:shadow-lg"
            aria-label={desktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {desktopCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>

          <div
            className={`
              bg-white rounded-xl shadow-lg p-6 h-fit overflow-hidden text-sky-950
              transition-all duration-300 ease-out
              ${desktopCollapsed ? "p-3" : "p-6"}
            `}
          >
            {/* Hide content text when collapsed */}
            <div className={desktopCollapsed ? "hidden" : ""}>
              {children}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
