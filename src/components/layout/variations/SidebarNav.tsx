"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Menu, X, Home, LayoutDashboard, LogIn, Globe } from "lucide-react";
import { navConfig } from "@/lib/navConfig";
import clsx from "clsx";
import type { Session } from "next-auth";
import { useSession } from "next-auth/react";

interface NavProps {
  locale: string;
  session: Session | null;
  logoutButton: React.ReactNode;
  localeSwitcher: React.ReactNode;
}

export default function SidebarNav({ locale, session, logoutButton, localeSwitcher }: NavProps) {
  const t = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const { data: liveSession } = useSession();
  const effectiveSession = session || liveSession;

  return (
    <>
      {/* Mini Top Bar for Mobile/Desktop to trigger Sidebar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 z-50 flex items-center justify-between px-4 sm:px-6">
         <button 
           onClick={() => setIsOpen(true)}
           className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
         >
           <Menu className="w-6 h-6 text-sky-900" />
         </button>
         
         <Link href={`/${locale}`} className="text-lg sm:text-xl font-black text-sky-900 tracking-tighter">
            ONGUDAI<span className="text-orange-500">CAMP</span>
         </Link>

         <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block">{localeSwitcher}</div>
            {effectiveSession ? (
              <Link href={`/${locale}/dashboard`} className="w-9 h-9 sm:w-10 sm:h-10 bg-sky-100 rounded-full flex items-center justify-center">
                 <LayoutDashboard className="w-5 h-5 text-sky-600" />
              </Link>
            ) : (
              <Link href={`/${locale}/auth/signin`} className="w-9 h-9 sm:w-10 sm:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                 <LogIn className="w-5 h-5" />
              </Link>
            )}
         </div>
      </nav>

      {/* Sidebar Overlay */}
      <div 
        className={clsx(
          "fixed inset-0 bg-sky-950/40 backdrop-blur-sm z-[60] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside 
        className={clsx(
          "fixed top-0 left-0 bottom-0 w-[280px] sm:w-80 bg-white z-[70] transition-transform duration-500 transform shadow-2xl flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 sm:p-8 flex items-center justify-between border-b border-gray-50">
           <Link href={`/${locale}`} className="text-2xl font-black text-sky-900 tracking-tighter">
              ONGUDAI<span className="text-orange-500">CAMP</span>
           </Link>
           <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
              <X className="w-6 h-6" />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-8">
           <div className="space-y-1">
              <Link 
                href={`/${locale}`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-4 py-3 rounded-2xl text-lg font-bold text-sky-900 hover:bg-sky-50 transition-all"
              >
                <Home className="w-5 h-5 text-orange-500" />
                {t("nav.home")}
              </Link>
              
              {navConfig.map((section) => {
                return (
                  <div key={section.title} className="pt-4">
                     <div className="px-4 text-xs font-black uppercase tracking-widest text-gray-900 mb-2">
                        {t(`nav.${section.title}`)}
                     </div>
                     <div className="space-y-1">
                        {section.items.map((item) => (
                          <Link 
                            key={item.title}
                            href={`/${locale}${item.href}`}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 rounded-2xl text-base font-medium text-sky-800 hover:bg-sky-50 transition-all"
                          >
                             {item.icon && <item.icon className="w-5 h-5 opacity-40" />}
                             {t(`mega.${section.title}.${item.title}`)}
                          </Link>
                        ))}
                     </div>
                  </div>
                );
              })}
           </div>
        </div>

        <div className="p-6 sm:p-8 border-t border-gray-100 space-y-6">
           <div className="flex items-center gap-4">
              <Globe className="w-5 h-5 text-gray-900" />
              <div className="scale-90 origin-left">{localeSwitcher}</div>
           </div>
           
           {effectiveSession ? (
             <div className="grid gap-3">
               <Link 
                 href={`/${locale}/dashboard`}
                 onClick={() => setIsOpen(false)}
                 className="flex items-center justify-center gap-2 w-full py-4 bg-sky-900 text-white rounded-2xl font-bold"
               >
                 <LayoutDashboard className="w-5 h-5" />
                 {t("nav.dashboard")}
               </Link>
               {logoutButton}
             </div>
           ) : (
             <Link 
               href={`/${locale}/auth/signin`}
               onClick={() => setIsOpen(false)}
               className="flex items-center justify-center gap-2 w-full py-4 bg-orange-500 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30"
             >
               <LogIn className="w-5 h-5" />
               {t("nav.login")}
             </Link>
           )}
        </div>
      </aside>
    </>
  );
}
