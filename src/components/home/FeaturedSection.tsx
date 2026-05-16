"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Star, MapPin } from "lucide-react";
import WishlistButton from "@/components/common/WishlistButton";

interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  price: number;
  salePrice: number | null;
  type: string;
  address: string | null;
  rating: number | null;
}

export default function FeaturedSection({ type, titleKey }: { type: string; titleKey: string }) {
  const t = useTranslations("featured");
  const locale = useLocale();

  const { data, isLoading } = useQuery<Post[]>({
    queryKey: ["featured", type],
    queryFn: async () => {
      const res = await fetch(`/api/posts?type=${type}&limit=6&locale=${locale}`);
      if (!res.ok) throw new Error("Failed to fetch posts");
      const json = await res.json();
      return json.posts;
    },
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="h-8 w-48 bg-gray-200 rounded-full mb-10 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-80 bg-gray-100 rounded-3xl animate-pulse" />
          ))}
        </div>
      </section>
    );
  }

  const typePath = type === "activity" ? "activities" : `${type}s`;

  return (
    <section className="py-16">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{t(titleKey)}</h2>
          <div className="h-1 w-16 bg-orange-500 rounded-full" />
        </div>
        <Link
          href={`/${locale}/${typePath}`}
          className="text-blue-600 font-semibold hover:text-blue-800 transition-colors text-sm"
        >
          {t("viewAll")} →
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.slice(0, 6).map((post) => (
          <Link
            key={post.id}
            href={`/${locale}/${typePath}/${post.slug}`}
            className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
          >
            <div className="relative h-52 overflow-hidden">
              <Image
                src={post.featuredImage || "/images/image_default.jpg"}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {post.salePrice && post.salePrice < post.price && (
                  <div className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-sm">
                    -{Math.round((1 - post.salePrice / post.price) * 100)}%
                  </div>
                )}
                <WishlistButton postId={post.id} />
              </div>
              <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm font-bold text-gray-900 shadow-sm flex items-center gap-1">
                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                {post.rating || 5.0}
              </div>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                {post.title}
              </h3>
              {post.address && (
                <p className="text-sm text-gray-700 flex items-center gap-1">
                  <MapPin size={14} className="shrink-0" />
                  <span className="truncate">{post.address}</span>
                </p>
              )}
              {post.excerpt && (
                <p className="text-sm text-gray-700 line-clamp-2">{post.excerpt}</p>
              )}
              {post.rating && (
                <div className="flex items-center gap-1 pt-2 text-sm">
                  <Star size={14} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">{post.rating}</span>
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
