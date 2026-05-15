"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Review {
  id: number;
  rating: number;
  title: string | null;
  content: string | null;
  status: string;
  verified: boolean;
  createdAt: string;
  user: { name: string | null; email: string | null };
  post: { title: string; type: string };
}

export default function AdminReviewsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("pending");

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews", filter],
    queryFn: async () => {
      const r = await fetch(`/api/admin/reviews?status=${filter}`);
      return r.json() as Promise<Review[]>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, status, verified }: { id: number; status?: string; verified?: boolean }) => {
      const r = await fetch("/api/admin/reviews", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status, verified }) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-reviews"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Отзывы</h1>

      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex gap-2">
          {["pending", "approved", "rejected", "all"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all ${filter === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >{s === "pending" ? "На модерации" : s === "approved" ? "Одобрено" : s === "rejected" ? "Отклонено" : "Все"}</button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>}
        {reviews?.map((review) => (
          <div key={review.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-gray-900">{review.user.name || review.user.email}</div>
                <div className="text-xs text-gray-500">{review.post.title} ({review.post.type})</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-yellow-500 font-bold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString("ru-RU")}</span>
              </div>
            </div>
            {review.title && <div className="font-semibold text-gray-900 mb-1">{review.title}</div>}
            {review.content && <div className="text-sm text-gray-700 mb-3">{review.content}</div>}
            <div className="flex items-center gap-3">
              {filter === "pending" && (
                <>
                  <button onClick={() => updateMutation.mutate({ id: review.id, status: "approved" })} className="bg-green-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-green-600">Одобрить</button>
                  <button onClick={() => updateMutation.mutate({ id: review.id, status: "rejected" })} className="bg-red-500 text-white px-4 py-1.5 rounded-lg text-xs font-medium cursor-pointer hover:bg-red-600">Отклонить</button>
                </>
              )}
              <label className="flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
                <input type="checkbox" checked={review.verified} onChange={(e) => updateMutation.mutate({ id: review.id, verified: e.target.checked })} className="cursor-pointer" />
                Verified
              </label>
              <button onClick={() => { if (confirm("Удалить отзыв?")) deleteMutation.mutate(review.id); }} className="text-red-500 hover:text-red-700 text-xs ml-auto cursor-pointer">Удалить</button>
            </div>
          </div>
        ))}
        {reviews?.length === 0 && <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-lg">Нет отзывов</div>}
      </div>
    </div>
  );
}
