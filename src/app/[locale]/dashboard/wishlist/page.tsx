"use client";

import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Heart, Trash2, Home, MapPin, Compass, ArrowLeft, Star, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";

const typeIcons: Record<string, React.ReactNode> = {
  hotel: <Home size={16} />,
  tour: <Compass size={16} />,
  activity: <MapPin size={16} />,
};

export default function WishlistPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json();
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/wishlist/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  const items = data?.wishlist || [];

  return (
    <>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart size={24} className="text-red-500 fill-red-500" />
              {t("wishlist")}
            </h1>
            {items.length > 0 && (
              <p className="text-sm text-gray-600 mt-1">{items.length} {t("wishlistCount")}</p>
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
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <Heart size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-900 text-lg font-bold mb-2">{t("wishlistEmpty")}</p>
            <p className="text-gray-500 text-sm mb-6">{t("wishlistEmptyHint")}</p>
            <div className="flex gap-3 justify-center">
              <Link
                href={`/${locale}/hotels`}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                {t("findHotel")}
              </Link>
              <Link
                href={`/${locale}/tours`}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
              >
                {t("findTour")}
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {items.map((item: any) => (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-md border border-gray-100 p-4 flex gap-4 group transition-all"
              >
                <Link
                  href={`/${locale}/${item.post.type === "activity" ? "activities" : item.post.type + "s"}/${item.post.slug}`}
                  className="relative w-28 h-28 rounded-xl overflow-hidden shrink-0 bg-gray-100"
                >
                  <Image
                    src={item.post.featuredImage || "/images/image_default.jpg"}
                    alt={item.post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="112px"
                  />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                        {typeIcons[item.post.type]}
                        {t(`wishlistType_${item.post.type}`)}
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          if (confirm(t("wishlistRemove") + "?")) {
                            removeMutation.mutate(item.postId);
                          }
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                        disabled={removeMutation.isPending}
                        title={t("wishlistRemove")}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <Link
                      href={`/${locale}/${item.post.type === "activity" ? "activities" : item.post.type + "s"}/${item.post.slug}`}
                      className="block font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors"
                    >
                      {item.post.title}
                    </Link>
                    {item.post.address && (
                      <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
                        <MapPin size={10} className="shrink-0" /> {item.post.address}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-1">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-900">{item.post.rating || 0}</span>
                    </div>
                    <div className="text-sm font-black text-gray-900 bg-gray-50 px-2.5 py-1 rounded-lg">
                      от {item.post.price.toLocaleString()} ₽
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </>
  );
}
