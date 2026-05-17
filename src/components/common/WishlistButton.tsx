"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/providers/WishlistProvider";
import { useTranslations } from "next-intl";

export default function WishlistButton({ postId, className }: { postId: number; className?: string }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const t = useTranslations("dashboard");
  const active = isInWishlist(postId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(postId);
      }}
      className={`p-2 rounded-full transition-all duration-300 ${
        active 
          ? "bg-red-50 text-red-500 shadow-md scale-110" 
          : "bg-white/80 backdrop-blur-md text-gray-400 hover:text-red-500 hover:bg-white"
      } ${className || ""}`}
      title={active ? t("wishlistRemove") : t("wishlistAdd") || "Add to wishlist"}
    >
      <Heart size={18} className={active ? "fill-current" : ""} />
    </button>
  );
}
