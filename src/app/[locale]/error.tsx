"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("common");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 pt-24">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-3xl font-black text-gray-900 mb-4">{t("errorTitle") || "Что-то пошло не так"}</h2>
        <p className="text-gray-600 mb-8">{t("errorDescription") || "Попробуйте обновить страницу или вернуться на главную"}</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/30 transition-all cursor-pointer"
          >
            {t("retry") || "Повторить"}
          </button>
          <Link
            href={`/${locale}`}
            className="px-8 py-3 border border-gray-200 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all"
          >
            {t("goHome") || "На главную"}
          </Link>
        </div>
      </div>
    </div>
  );
}
