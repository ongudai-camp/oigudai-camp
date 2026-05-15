"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, X } from "lucide-react";

interface InlineDateEditorProps {
  dateStr: string;
  postId: number;
  roomId?: number | null;
  onClose: () => void;
}

export default function InlineDateEditor({ dateStr, postId, roomId, onClose }: InlineDateEditorProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState("available");
  const [price, setPrice] = useState("");

  const { data: existing, isLoading } = useQuery({
    queryKey: ["availability-date", postId, roomId, dateStr],
    queryFn: async () => {
      const params = new URLSearchParams({ postId: String(postId), year: dateStr.split("-")[0], month: dateStr.split("-")[1] });
      if (roomId) params.set("roomId", String(roomId));
      const res = await fetch(`/api/admin/availability?${params}`);
      if (!res.ok) throw new Error("Failed to load");
      const records = await res.json();
      const match = records.find((r: { date: string }) => r.date === dateStr);
      return match || null;
    },
    enabled: true,
  });

  useEffect(() => {
    if (existing) {
      setStatus(existing.status || "available");
      setPrice(existing.price ? String(existing.price) : "");
    }
  }, [existing]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          roomId: roomId || null,
          dates: [dateStr],
          status,
          ...(price ? { price: parseFloat(price) } : {}),
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar"] });
      queryClient.invalidateQueries({ queryKey: ["availability-date"] });
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900 text-lg">Edit — {dateStr}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={20} className="animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm cursor-pointer bg-white"
              >
                <option value="available">Available</option>
                <option value="booked">Booked</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Price (₽)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="Enter price or leave empty"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm"
              />
              {!price && (
                <p className="text-xs text-gray-400 mt-1">Leave empty to keep existing price</p>
              )}
            </div>
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
