import { useTranslations } from "next-intl";

export default function CalendarLegend() {
  const t = useTranslations("calendar");
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-emerald-200" />
        <span className="text-gray-600 font-medium">{t("available")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-amber-200" />
        <span className="text-gray-600 font-medium">{t("limited")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-red-200" />
        <span className="text-gray-600 font-medium">{t("booked")}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded-sm bg-gray-200" />
        <span className="text-gray-600 font-medium">{t("past")}</span>
      </div>
    </div>
  );
}
