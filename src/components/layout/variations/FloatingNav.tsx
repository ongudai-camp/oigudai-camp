"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, Compass, User } from "lucide-react";
import { navConfig } from "@/lib/navConfig";
import clsx from "clsx";
import type { Session } from "next-auth";

interface NavProps {
  locale: string;
  session: Session | null;
  localeSwitcher: React.ReactNode;
}

export default function FloatingNav({ locale, session, localeSwitcher }: NavProps) {
  const t = useTranslations();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed top-4 sm:top-6 left-0 right-0 z-50 px-2 sm:px-4 md:px-10 pointer-events-none">
      <nav className={clsx(
        "container mx-auto max-w-6xl pointer-events-auto transition-all duration-500 rounded-2xl sm:rounded-3xl border",
        isScrolled 
          ? "bg-white/80 backdrop-blur-xl shadow-2xl py-2 sm:py-3 border-white/20" 
          : "bg-white/10 backdrop-blur-md py-3 sm:py-5 border-white/10 shadow-lg"
      )}>
        <div className="px-4 sm:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="shrink-0 flex items-center gap-2 group">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 rounded-lg sm:rounded-xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform">
               <Compass className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className={clsx(
              "text-lg sm:text-xl font-black tracking-tighter transition-colors",
              isScrolled ? "text-sky-900" : "text-white"
            )}>
              ONGUDAI<span className="text-orange-500">CAMP</span>
            </span>
          </Link>

          {/* Nav Links */}
          <div className="hidden lg:flex items-center gap-1 bg-black/5 p-1 rounded-2xl">
            <Link href={`/${locale}`} className={clsx(
              "px-5 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/10",
              isScrolled ? "text-sky-900" : "text-white"
            )}>
              {t("nav.home")}
            </Link>
            {navConfig.map((section) => (
              <Link key={section.title} href={`/${locale}${section.href}`} className={clsx(
                "px-5 py-2 rounded-xl text-sm font-bold transition-all hover:bg-white/10",
                isScrolled ? "text-sky-900" : "text-white"
              )}>
                {t(`nav.${section.title}`)}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden md:block">
                {localeSwitcher}
             </div>
             
             {session ? (
               <Link 
                 href={`/${locale}/dashboard`}
                 className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-orange-500 text-white rounded-full shadow-lg shadow-orange-500/30 hover:scale-110 transition-transform"
               >
                 <User className="w-4 h-4 sm:w-5 sm:h-5" />
               </Link>
             ) : (
               <Link 
                 href={`/${locale}/auth/signin`}
                 className="hidden sm:flex items-center gap-2 bg-white text-sky-900 px-6 py-2.5 rounded-xl font-bold text-sm shadow-xl hover:bg-orange-500 hover:text-white transition-all"
               >
                 {t("nav.login")}
               </Link>
             )}

             <button 
               className={clsx(
                 "lg:hidden p-2 rounded-lg sm:rounded-xl transition-colors",
                 isScrolled ? "text-sky-900 bg-gray-100" : "text-white bg-white/10"
               )}
               onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             >
               {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </nav>

      {/* Mobile Glass Menu */}
      <div className={clsx(
        "absolute top-20 sm:top-24 left-2 sm:left-4 right-2 sm:right-4 bg-white/95 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-white/20 p-6 sm:p-8 transition-all duration-500 transform origin-top lg:hidden overflow-y-auto max-h-[80vh]",
        isMobileMenuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-4 pointer-events-none"
      )}>
         <div className="grid gap-6">
            <Link href={`/${locale}`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-sky-900">
               {t("nav.home")}
            </Link>
            {navConfig.map((section) => (
              <Link key={section.title} href={`/${locale}${section.href}`} onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-black text-sky-900 border-t border-gray-100 pt-4">
                 {t(`nav.${section.title}`)}
              </Link>
            ))}
            <div className="pt-6 mt-6 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
               {localeSwitcher}
               {session ? (
                 <Link href={`/${locale}/dashboard`} onClick={() => setIsMobileMenuOpen(false)} className="w-full sm:w-auto text-center bg-orange-500 text-white px-8 py-3 rounded-2xl font-bold">
                   Cabinet
                 </Link>
               ) : (
                 <Link href={`/${locale}/auth/signin`} onClick={() => setIsMobileMenuOpen(false)} className="w-full sm:w-auto text-center bg-sky-900 text-white px-8 py-3 rounded-2xl font-bold">
                   {t("nav.login")}
                 </Link>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
