"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    const segments = pathname.split("/");
    if (["ru", "en", "kk"].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join("/");
    router.push(newPath);
  };

  useEffect(() => {
    const segments = pathname.split("/");
    const locale = ["ru", "en", "kk"].includes(segments[1]) ? segments[1] : "ru";
    document.cookie = `preferred-locale=${locale}; max-age=${60 * 60 * 24 * 365}; path=/`;
  }, [pathname]);

  const getCurrentLocale = () => {
    const segments = pathname.split("/");
    if (["ru", "en", "kk"].includes(segments[1])) {
      return segments[1];
    }
    return "ru";
  };

  const currentLocale = getCurrentLocale();

  return (
    <div className="flex items-center gap-1 bg-sky-50 p-1 rounded-lg">
      {["ru", "en", "kk"].map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all duration-300 cursor-pointer ${
            currentLocale === locale
              ? "bg-white text-sky-600 shadow-sm"
              : "text-sky-700 hover:text-sky-600"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
