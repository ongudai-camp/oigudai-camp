"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, ChevronDown, ArrowRight, LogIn, LayoutDashboard } from "lucide-react";
import { navConfig } from "@/lib/navConfig";
import clsx from "clsx";
import type { Session } from "next-auth";

interface ClientNavProps {
  locale: string;
  session: Session | null;
  logoutButton: React.ReactNode;
  localeSwitcher: React.ReactNode;
}

export default function ClientNav({ locale, session, logoutButton, localeSwitcher }: ClientNavProps) {
  const t = useTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileSection = (title: string) => {
    setActiveMobileSection(activeMobileSection === title ? null : title);
  };

  const navLinkClass = "text-[15px] font-bold text-sky-950 hover:text-orange-500 transition-colors flex items-center gap-1 py-2 cursor-pointer";

  return (
    <nav 
      className={clsx(
        "sticky top-0 z-50 transition-all duration-300 border-b w-full",
        isScrolled 
          ? "backdrop-blur-lg bg-white/90 shadow-md py-2 border-sky-100" 
          : "bg-white py-4 border-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`/${locale}`} className="shrink-0 flex items-center gap-1 group">
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-sky-950">ONGUDAI</span>
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-orange-500 group-hover:text-orange-600 transition-colors">CAMP</span>
          </Link>

          {/* Desktop Navigation (Centered) */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href={`/${locale}`} className={navLinkClass}>
              {t("nav.home")}
            </Link>

            {navConfig.map((section) => (
              <div 
                key={section.title}
                className="relative group"
                onMouseEnter={() => setActiveMegaMenu(section.title)}
                onMouseLeave={() => setActiveMegaMenu(null)}
              >
                <button className={clsx(navLinkClass, activeMegaMenu === section.title && "text-orange-500")}>
                  {t(`nav.${section.title}`)}
                  <ChevronDown className={clsx("w-4 h-4 transition-transform duration-300", activeMegaMenu === section.title && "rotate-180")} />
                </button>

                {/* Refined Mega Menu Panel */}
                <div 
                  className={clsx(
                    "absolute top-full left-1/2 -translate-x-1/2 w-[calc(100vw-2rem)] sm:w-[600px] lg:w-[850px] xl:w-[1050px] bg-white rounded-[2.5rem] shadow-2xl border border-sky-50 p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-5 gap-8 transition-all duration-300 origin-top z-50",
                    activeMegaMenu === section.title 
                      ? "opacity-100 translate-y-4 visible scale-100" 
                      : "opacity-0 translate-y-8 invisible scale-95"
                  )}
                >
                  <div className="lg:col-span-3 space-y-8">
                    <div className="flex items-center justify-between">
                       <h4 className="font-black text-sky-900 uppercase tracking-widest text-[11px] opacity-40">{t(`nav.${section.title}`)}</h4>
                       <Link href={`/${locale}${section.href}`} className="text-[11px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors">
                          {t("featured.viewAll")}
                       </Link>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                      {section.items.map((item) => (
                        <Link 
                          key={item.title} 
                          href={`/${locale}${item.href}`}
                          className="group/item flex items-start gap-4 p-4 rounded-3xl hover:bg-sky-50 transition-all border border-transparent hover:border-sky-100"
                        >
                          <div className="p-3 bg-sky-50 text-sky-600 rounded-2xl group-hover/item:bg-white group-hover/item:shadow-sm transition-all transform group-hover/item:scale-110">
                            {item.icon && <item.icon className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="font-bold text-sky-950 text-[15px] group-hover/item:text-orange-500 transition-colors">
                              {t(`mega.${section.title}.${item.title}`)}
                            </div>
                            <div className="text-[12px] text-sky-400 font-medium leading-relaxed mt-1">{t(`mega.${section.title}.${item.title}_desc`)}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {section.featured && (
                    <div className="lg:col-span-2 bg-sky-950 rounded-[2rem] p-8 text-white flex flex-col justify-between overflow-hidden relative group/feat border border-white/10 shadow-2xl">
                      <div className="relative z-10">
                        <span className="inline-block text-[10px] font-black uppercase tracking-widest text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full border border-orange-400/20 mb-6">
                          {t(`mega.${section.title}.${section.featured.title}`)}
                        </span>
                        <h3 className="text-2xl font-black mt-2 leading-tight text-white tracking-tight">
                          {t(`mega.${section.title}.${section.featured.description}`)}
                        </h3>
                        <p className="text-sky-200/60 text-sm mt-4 leading-relaxed line-clamp-2 font-medium">
                           Откройте для себя новый уровень комфорта и сервиса в нашем комплексе.
                        </p>
                      </div>
                      <Link 
                        href={`/${locale}${section.featured.href}`}
                        className="relative z-10 flex items-center gap-2 text-xs font-black text-orange-400 hover:text-orange-300 transition-colors mt-8 uppercase tracking-widest group/btn"
                      >
                        {t("common.book")} <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                      </Link>
                      {/* Abstract Background Element */}
                      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl group-hover/feat:scale-150 transition-transform duration-1000" />
                      <div className="absolute -left-10 -top-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl group-hover/feat:scale-125 transition-transform duration-1000" />
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <Link href={`/${locale}/about`} className={navLinkClass}>
              {t("nav.about")}
            </Link>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              {localeSwitcher}
            </div>
            
            <div className="flex items-center gap-2">
              {session ? (
                <div className="flex items-center gap-2">
                   <Link 
                    href={`/${locale}/dashboard`} 
                    className="w-10 h-10 flex items-center justify-center bg-sky-50 text-sky-900 rounded-full hover:bg-sky-100 transition-colors"
                    title={t("nav.dashboard")}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                  </Link>
                  {session.user && session.user.role === "admin" && (
                    <Link 
                      href={`/${locale}/admin`} 
                      className="hidden md:flex bg-sky-950 text-white px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest hover:bg-sky-900 transition-all shadow-lg shadow-sky-950/20"
                    >
                      {t("nav.admin")}
                    </Link>
                  )}
                  <div className="hidden lg:block">
                    {logoutButton}
                  </div>
                </div>
              ) : (
                <>
                  <Link 
                    href={`/${locale}/auth/signin`} 
                    className="w-10 h-10 flex lg:w-auto lg:h-auto lg:px-5 lg:py-2.5 items-center justify-center gap-2 text-sky-950 hover:text-orange-500 font-bold transition-all text-sm rounded-full hover:bg-sky-50"
                  >
                    <LogIn className="w-5 h-5 lg:hidden" />
                    <span className="hidden lg:inline">{t("nav.login")}</span>
                  </Link>
                  <Link
                    href={`/${locale}/auth/register`}
                    className="hidden sm:flex bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-black uppercase tracking-tighter shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform active:scale-95"
                  >
                    {t("nav.register")}
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Toggle */}
            <button 
              className="lg:hidden p-2.5 text-sky-950 bg-sky-50 hover:bg-sky-100 rounded-2xl transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Accordion Style) */}
      <div 
        className={clsx(
          "fixed inset-x-0 bottom-0 bg-white z-40 transition-all duration-500 lg:hidden overflow-y-auto",
          isScrolled ? "top-[65px]" : "top-[81px]",
          isMobileMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
        )}
      >
        <div className="p-8 space-y-8 pb-32">
          <div className="grid gap-2">
            <Link 
              href={`/${locale}`} 
              className="text-3xl font-black text-sky-950 tracking-tighter mb-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.home")}
            </Link>

            {navConfig.map((section) => (
              <div key={section.title} className="border-t border-sky-50 pt-4">
                <button 
                  onClick={() => toggleMobileSection(section.title)}
                  className="w-full flex items-center justify-between text-xl font-extrabold text-sky-900 py-3"
                >
                  {t(`nav.${section.title}`)}
                  <ChevronDown className={clsx("w-5 h-5 transition-transform duration-300", activeMobileSection === section.title && "rotate-180")} />
                </button>
                
                <div 
                  className={clsx(
                    "grid gap-4 overflow-hidden transition-all duration-300",
                    activeMobileSection === section.title ? "max-h-[500px] opacity-100 mb-6 mt-2" : "max-h-0 opacity-0"
                  )}
                >
                  {section.items.map((item) => (
                    <Link 
                      key={item.title} 
                      href={`/${locale}${item.href}`}
                      className="flex items-center gap-4 group/mob"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="w-10 h-10 flex items-center justify-center bg-sky-50 text-sky-600 rounded-xl group-hover/mob:bg-orange-500 group-hover/mob:text-white transition-colors">
                        {item.icon && <item.icon className="w-5 h-5" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sky-900">{t(`mega.${section.title}.${item.title}`)}</span>
                        <span className="text-[11px] text-sky-400 font-medium">{t(`mega.${section.title}.${item.title}_desc`)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}

            <Link 
              href={`/${locale}/about`} 
              className="text-xl font-extrabold text-sky-900 border-t border-sky-50 pt-6 mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {t("nav.about")}
            </Link>
          </div>

          <div className="pt-10 border-t border-sky-100 space-y-8">
            <div className="flex items-center justify-between">
              <span className="text-sm font-black uppercase tracking-widest text-sky-300">Language</span>
              {localeSwitcher}
            </div>
            
            <div className="grid gap-4">
              {session ? (
                <div className="grid gap-3">
                  <Link 
                    href={`/${locale}/dashboard`} 
                    className="flex items-center justify-center gap-2 bg-sky-950 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-sky-950/20"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    {t("nav.dashboard")}
                  </Link>
                  <div onClick={() => setIsMobileMenuOpen(false)}>
                    {logoutButton}
                  </div>
                </div>
              ) : (
                <div className="grid gap-3">
                  <Link 
                    href={`/${locale}/auth/signin`} 
                    className="flex items-center justify-center bg-sky-50 text-sky-900 py-5 rounded-2xl font-black uppercase tracking-widest text-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("nav.login")}
                  </Link>
                  <Link 
                    href={`/${locale}/auth/register`} 
                    className="flex items-center justify-center bg-orange-500 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl shadow-orange-500/30"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {t("nav.register")}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
