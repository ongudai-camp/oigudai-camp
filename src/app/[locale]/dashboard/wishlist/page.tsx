"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Heart, Trash2, Home, MapPin, Compass, ArrowLeft } from "lucide-react";

interface WishlistItem {
  id: string;
  type: "hotel" | "tour" | "activity";
  title: string;
  slug: string;
  image?: string;
  price?: number;
  addedAt: number;
}

const STORAGE_KEY = "ongudai_wishlist";
const typeIcons: Record<string, React.ReactNode> = {
  hotel: <Home size={16} />,
  tour: <Compass size={16} />,
  activity: <MapPin size={16} />,
};

export default function WishlistPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  return (
    <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart size={24} className="text-red-500" />
              {t("wishlist")}
            </h1>
            {items.length > 0 && (
              <p className="text-sm text-gray-900 mt-1">{items.length} {t("wishlistCount")}</p>
            )}
          </div>
          <Link
            href={`/${locale}/dashboard`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center gap-1"
          >
            <ArrowLeft size={14} /> {t("backToDashboard")}
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <Heart size={48} className="mx-auto text-gray-500 mb-4" />
            <p className="text-gray-900 text-lg mb-2">{t("wishlistEmpty")}</p>
            <p className="text-gray-900 text-sm mb-6">{t("wishlistEmptyHint")}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/${locale}/hotels`}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                {t("findHotel")}
              </Link>
              <Link
                href={`/${locale}/tours`}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors"
              >
                {t("findTour")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items
              .sort((a, b) => b.addedAt - a.addedAt)
              .map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between group hover:shadow-xl transition-shadow"
                >
                  <Link
                    href={`/${locale}/${item.type === "activity" ? "activities" : item.type + "s"}/${item.slug}`}
                    className="flex-1 min-w-0 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-900 shrink-0">
                      {typeIcons[item.type]}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <span className="capitalize">{t(`wishlistType_${item.type}`)}</span>
                        {item.price != null && (
                          <>
                            <span>·</span>
                            <span className="font-medium">от {item.price.toLocaleString()} ₽</span>
                          </>
                        )}
                      </div>
                    </div>
                  </Link>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 rounded-lg text-gray-900 hover:text-red-500 hover:bg-red-50 transition-all shrink-0 cursor-pointer"
                    title={t("wishlistRemove")}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
          </div>
        )}
    </>
  );
}
