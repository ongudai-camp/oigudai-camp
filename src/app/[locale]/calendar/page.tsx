"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import UnifiedCalendar from "@/components/calendar/UnifiedCalendar";

export default function CustomerCalendarPage() {
  const t = useTranslations();
  const [selectedType, setSelectedType] = useState<string>("");

  const TYPE_OPTIONS = [
    { value: "", label: t("listing.all") },
    { value: "hotel", label: t("dashboard.hotels") },
    { value: "tour", label: t("dashboard.tours") },
    { value: "activity", label: t("dashboard.activities") },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-black text-gray-900 mb-2">Availability Calendar</h1>
          <p className="text-gray-500">
            Check availability across all properties at Ongudai Camp
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap gap-2 mb-6">
            {TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedType(opt.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${
                  selectedType === opt.value
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-200 hover:text-blue-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <UnifiedCalendar
            type="customer"
            propertyType={selectedType || undefined}
            showPriceToggle
            locale="ru"
          />
        </div>
      </div>
    </div>
  );
}
