"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export default function NotFound() {
  const t = useTranslations("notFound");
  const locale = useLocale();

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-9xl font-black text-sky-900 opacity-20">404</h1>
        <div className="-mt-16">
          <h2 className="text-3xl font-bold text-sky-900 mb-4">{t("title")}</h2>
          <p className="text-gray-900 mb-8 max-w-md mx-auto">
            {t("description")}
          </p>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-full text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition-all duration-300"
          >
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
