"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/providers/WishlistProvider";

export default function WishlistButton({ postId, className }: { postId: number; className?: string }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(postId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(postId);
      }}
      className={`p-2 rounded-full transition-all duration-300 shadow-sm flex items-center justify-center ${
        active 
          ? "bg-red-50 text-red-500" 
          : "bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white"
      } ${className || ""}`}
      title={active ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart size={18} className={active ? "fill-current" : ""} />
    </button>
  );
}
