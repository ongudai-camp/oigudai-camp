"use client";

import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";

interface WishlistContextType {
  wishlistIds: number[];
  isInWishlist: (postId: number) => boolean;
  toggleWishlist: (postId: number) => void;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const locale = useLocale();
  const t = useTranslations("common");

  const { data: wishlistData, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const res = await fetch("/api/wishlist");
      if (!res.ok) throw new Error("Failed to fetch wishlist");
      return res.json();
    },
    enabled: !!session?.user,
  });

  const wishlistIds = wishlistData?.wishlist?.map((item: any) => item.postId) || [];

  const addToWishlist = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        body: JSON.stringify({ postId }),
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Failed to add to wishlist");
      return res.json();
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      queryClient.setQueryData(["wishlist"], (old: any) => ({
        ...old,
        wishlist: [...(old?.wishlist || []), { postId }]
      }));
      return { previousWishlist };
    },
    onSuccess: () => {
      toast.success(t("wishlistAdded") || "Добавлено в избранное");
    },
    onError: (err, postId, context: any) => {
      queryClient.setQueryData(["wishlist"], context.previousWishlist);
      toast.error(t("error") || "Ошибка");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (postId: number) => {
      const res = await fetch(`/api/wishlist/${postId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to remove from wishlist");
      return res.json();
    },
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);
      queryClient.setQueryData(["wishlist"], (old: any) => ({
        ...old,
        wishlist: old?.wishlist?.filter((item: any) => item.postId !== postId) || []
      }));
      return { previousWishlist };
    },
    onSuccess: () => {
      toast.success(t("wishlistRemoved") || "Удалено из избранного");
    },
    onError: (err, postId, context: any) => {
      queryClient.setQueryData(["wishlist"], context.previousWishlist);
      toast.error(t("error") || "Ошибка");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });

  const toggleWishlist = (postId: number) => {
    if (!session?.user) {
      window.location.href = `/${locale}/auth/signin`;
      return;
    }

    if (wishlistIds.includes(postId)) {
      removeFromWishlist.mutate(postId);
    } else {
      addToWishlist.mutate(postId);
    }
  };

  const isInWishlist = (postId: number) => wishlistIds.includes(postId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, isInWishlist, toggleWishlist, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
