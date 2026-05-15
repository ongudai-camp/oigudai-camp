"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Category {
  id: number;
  key: string;
  value: string | null;
  postId: number;
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ key: "", value: "", postId: "" });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => { const r = await fetch("/api/admin/categories"); return r.json() as Promise<Category[]>; },
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-all-posts-for-categories"],
    queryFn: async () => { const r = await fetch("/api/posts?limit=100"); return (await r.json()).posts || []; },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const r = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-categories"] }); setForm({ key: "", value: "", postId: "" }); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(form);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Категории</h1>

      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-lg font-bold mb-4">Добавить категорию</h2>
        <form onSubmit={handleSubmit} className="flex gap-4 items-end">
          <select value={form.postId} onChange={e => setForm({...form, postId: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm cursor-pointer" required>
            <option value="">Выберите объект</option>
            {posts?.map((p: {id: number; title: string}) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
          <input placeholder="Ключ (category)" value={form.key} onChange={e => setForm({...form, key: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
          <input placeholder="Значение" value={form.value} onChange={e => setForm({...form, value: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" />
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-medium cursor-pointer hover:bg-blue-700">+</button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? <div className="animate-pulse p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Объект</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Ключ</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Значение</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {categories?.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{c.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.postId}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">{c.key}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{c.value || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {categories?.length === 0 && <div className="text-center py-8 text-gray-500">Нет категорий</div>}
      </div>
    </div>
  );
}
