"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, Phone, Plus, User, LayoutDashboard, LogOut } from "lucide-react";
import { navConfig } from "@/lib/navConfig";
import clsx from "clsx";
import type { Session } from "next-auth";
import { signOut, useSession } from "next-auth/react";

interface NavProps {
  locale: string;
  session: Session | null;
  logoutButton: React.ReactNode;
  localeSwitcher: React.ReactNode;
}

export default function RealcreaNav({ locale, session, logoutButton, localeSwitcher }: NavProps) {
  const t = useTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { data: liveSession } = useSession();
  const effectiveSession = session || liveSession;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isAdminOrModerator = effectiveSession?.user?.role === "admin" || effectiveSession?.user?.role === "moderator";
  const navLinkClass = "text-[16px] font-medium text-[#1A1A1A] hover:text-[#EB664E] transition-colors flex items-center gap-1 py-2";

  return (
    <nav className={clsx(
      "fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300",
      isScrolled ? "py-2 shadow-md" : "py-4 border-b border-gray-100"
    )}>
      <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href={`/${locale}`} className="shrink-0 flex items-center gap-1 group">
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#1A1A1A]">ONGUDAI</span>
          <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#EB664E] group-hover:text-orange-600 transition-colors">CAMP</span>
        </Link>

        {/* Center Links (Variation B style) */}
        <div className="hidden lg:flex items-center gap-8">
          <Link href={`/${locale}`} className={navLinkClass}>
            {t("nav.home")}
          </Link>
          {navConfig.map((section) => (
            <div key={section.title} className="relative group">
              <button className={navLinkClass}>
                {t(`nav.${section.title}`)}
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
              
              {/* Simple Dropdown */}
              <div className="absolute top-full left-0 mt-0 w-56 bg-white shadow-2xl rounded-2xl border border-gray-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-hover:translate-y-2 translate-y-4 transition-all duration-300 z-50 p-3">
                {section.items.map((item) => (
                  <Link 
                    key={item.title} 
                    href={`/${locale}${item.href}`}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-[#EB664E] rounded-xl transition-colors"
                  >
                    {item.icon && <item.icon className="w-4 h-4 opacity-50" />}
                    {t(`mega.${section.title}.${item.title}`)}
                  </Link>
                ))}
              </div>
            </div>
          ))}
          <Link href={`/${locale}/about`} className={navLinkClass}>
            {t("nav.about")}
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* Phone (Realcrea style) - Hidden on very small screens */}
          <div className="hidden xl:flex items-center gap-3 text-[#1A1A1A]">
            <div className="w-10 h-10 flex items-center justify-center bg-gray-50 rounded-full border border-gray-100">
              <Phone className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-[16px] tracking-tight">+7 999 123-45-67</span>
          </div>

          <div className="hidden md:block">
            {localeSwitcher}
          </div>

          {/* User / Add Property */}
          <div className="flex items-center gap-2 sm:gap-3">
            {effectiveSession ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <User className="w-5 h-5 text-[#1A1A1A]" />
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-2xl rounded-2xl border border-gray-100 z-50 p-2">
                    <Link
                      href={`/${locale}/dashboard`}
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-900" />
                      {t("nav.dashboard")}
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link 
                href={`/${locale}/auth/signin`}
                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                <User className="w-5 h-5 text-[#1A1A1A]" />
              </Link>
            )}

            {isAdminOrModerator && (
              <Link 
                href={`/${locale}/admin/hotels/new`}
                className="hidden sm:flex items-center gap-2 bg-[#F7F6F7] hover:bg-gray-200 text-[#1A1A1A] px-6 py-3 rounded-full font-bold text-[14px] uppercase tracking-wide transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                Добавить
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden p-2 text-[#1A1A1A] bg-gray-50 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={clsx(
        "fixed inset-x-0 bottom-0 bg-white z-40 transition-all duration-500 lg:hidden overflow-y-auto",
        isScrolled ? "top-[64px]" : "top-[80px]",
        isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <div className="p-8 space-y-8 pb-32">
           <div className="grid gap-4">
              <Link href={`/${locale}`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-[#1A1A1A]">
                {t("nav.home")}
              </Link>
              {navConfig.map((section) => (
                <div key={section.title} className="space-y-4 pt-4 border-t border-gray-50">
                   <h4 className="text-xs font-black uppercase tracking-widest text-gray-900">{t(`nav.${section.title}`)}</h4>
                   <div className="grid gap-4 pl-4">
                      {section.items.map((item) => (
                        <Link 
                          key={item.title} 
                          href={`/${locale}${item.href}`}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="flex items-center gap-3 text-lg font-medium text-gray-700"
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-lg text-[#EB664E]">
                            {item.icon && <item.icon className="w-4 h-4" />}
                          </div>
                          {t(`mega.${section.title}.${item.title}`)}
                        </Link>
                      ))}
                   </div>
                </div>
              ))}
              <Link href={`/${locale}/about`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold text-[#1A1A1A] pt-4 border-t border-gray-50">
                {t("nav.about")}
              </Link>
           </div>

           <div className="pt-8 border-t border-gray-100 space-y-6">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1A1A]">{t("auth.phone")}</span>
                <span className="text-gray-900 font-medium">+7 999 123-45-67</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1A1A1A]">Язык</span>
                {localeSwitcher}
              </div>
              <div className="grid gap-3 pt-4">
            {effectiveSession ? (
                  <>
                    <Link href={`/${locale}/dashboard`} onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-gray-50 text-[#1A1A1A] rounded-2xl text-center font-bold">
                      {t("nav.dashboard")}
                    </Link>
                    <button onClick={() => signOut()} className="w-full py-4 text-red-500 border border-red-200 rounded-2xl text-center font-bold cursor-pointer hover:bg-red-50 transition-colors">
                      Выйти
                    </button>
                  </>
                ) : (
                  <Link href={`/${locale}/auth/signin`} onClick={() => setIsMobileMenuOpen(false)} className="w-full py-4 bg-gray-50 text-[#1A1A1A] rounded-2xl text-center font-bold">
                    {t("nav.login")}
                  </Link>
                )}
                {isAdminOrModerator && (
                  <Link href={`/${locale}/admin/hotels/new`} className="w-full py-4 bg-[#1A1A1A] text-white rounded-2xl text-center font-bold">
                     Добавить объект
                  </Link>
                )}
              </div>
           </div>
        </div>
      </div>
    </nav>
  );
}
