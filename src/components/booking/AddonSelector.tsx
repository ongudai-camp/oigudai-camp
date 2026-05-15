"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Check } from "lucide-react";

interface Addon {
  id: number;
  title: string;
  description: string | null;
  price: number;
  type: string;
}

interface AddonSelectorProps {
  postId: number;
  selectedIds: number[];
  onToggle: (id: number, price: number) => void;
}

export default function AddonSelector({ postId, selectedIds, onToggle }: AddonSelectorProps) {
  const [showAll, setShowAll] = useState(false);

  const { data: addons, isLoading } = useQuery<Addon[]>({
    queryKey: ["addons", postId],
    queryFn: async () => {
      const res = await fetch(`/api/addons?postId=${postId}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-400 py-2">
        <Loader2 size={14} className="animate-spin" /> Loading extras...
      </div>
    );
  }

  if (!addons || addons.length === 0) return null;

  const visible = showAll ? addons : addons.slice(0, 3);

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <Plus size={12} /> Extra services
      </label>
      <div className="space-y-1.5">
        {visible.map((addon) => {
          const isSelected = selectedIds.includes(addon.id);
          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => onToggle(addon.id, addon.price)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-100 bg-white hover:border-gray-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                  isSelected ? "bg-blue-500 border-blue-500" : "border-gray-300"
                }`}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-gray-900">{addon.title}</span>
                  {addon.description && (
                    <p className="text-[11px] text-gray-400">{addon.description}</p>
                  )}
                </div>
              </div>
              <span className="text-sm font-bold text-gray-900">+{addon.price.toLocaleString()} ₽</span>
            </button>
          );
        })}
      </div>
      {addons.length > 3 && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          {showAll ? "Show less" : `+${addons.length - 3} more services`}
        </button>
      )}
    </div>
  );
}
