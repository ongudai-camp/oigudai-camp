"use client";

import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { PartyPopper, ArrowRight, Home } from "lucide-react";

export default function CongratulationsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 pt-24">
      <div className="flex items-center justify-center bg-white py-12 px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-100 rounded-full">
            <PartyPopper className="w-12 h-12 text-green-600" />
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {t("congratulations.title")}
            </h2>
            <p className="text-lg text-green-600 font-bold">
              {t("congratulations.subtitle")}
            </p>
            <p className="text-gray-900 leading-relaxed max-w-sm mx-auto">
              {t("congratulations.description")}
            </p>
          </div>

          <div className="space-y-4 pt-4">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/dashboard`)}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] cursor-pointer inline-flex items-center justify-center gap-3"
            >
              {t("congratulations.goToDashboard")}
              <ArrowRight className="w-5 h-5" />
            </button>

            <Link
              href={`/${locale}`}
              className="w-full py-4 border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-2xl font-bold text-lg transition-all cursor-pointer inline-flex items-center justify-center gap-3"
            >
              <Home className="w-5 h-5" />
              {t("congratulations.goToHome")}
            </Link>
          </div>
        </div>
      </div>

      <div className="hidden md:block relative overflow-hidden bg-gradient-to-br from-green-600 to-emerald-800">
        <div className="absolute inset-0 opacity-10">
          <svg width="100%" height="100%" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="198" stroke="white" strokeWidth="4" />
            <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
          </svg>
        </div>
        <div className="relative z-10 h-full flex flex-col items-start justify-end p-16 lg:p-24 text-white">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-1 bg-green-300 rounded-full"></div>
            <h3 className="text-5xl lg:text-6xl font-black leading-tight tracking-tighter">
              {t("about.title")} <br/>
              <span className="text-green-300">{t("about.subtitle")}</span>
            </h3>
            <p className="text-xl text-green-50/90 leading-relaxed font-medium">
              {t("congratulations.description")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
