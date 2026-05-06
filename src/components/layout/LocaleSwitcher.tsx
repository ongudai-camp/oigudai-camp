"use client";

import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Replace locale in pathname
    const segments = pathname.split("/");
    if (["ru", "en", "tr"].includes(segments[1])) {
      segments[1] = newLocale;
    } else {
      segments.splice(1, 0, newLocale);
    }
    const newPath = segments.join("/");
    router.push(newPath);
    
    // Set cookie for geolocation
    document.cookie = `preferred-locale=${newLocale}; max-age=${60 * 60 * 24 * 365}; path=/`;
  };

  const getCurrentLocale = () => {
    const segments = pathname.split("/");
    if (["ru", "en", "tr"].includes(segments[1])) {
      return segments[1];
    }
    return "ru";
  };

  const currentLocale = getCurrentLocale();

  return (
    <div className="flex items-center gap-2">
      {["ru", "en", "tr"].map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          className={`px-3 py-1 text-sm rounded-md transition-all duration-200 cursor-pointer ${
            currentLocale === locale
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {locale.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
