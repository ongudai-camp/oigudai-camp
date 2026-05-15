"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Addon {
  id: number;
  postId: number;
  title: string;
  description: string | null;
  price: number;
  type: string;
  active: boolean;
}

export default function AdminAddonsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Addon | null>(null);
  const [form, setForm] = useState({ postId: "", title: "", description: "", price: "", type: "extra", active: true });

  const { data: addons, isLoading } = useQuery({
    queryKey: ["admin-addons"],
    queryFn: async () => { const r = await fetch("/api/admin/addons"); return r.json() as Promise<Addon[]>; },
  });

  const { data: posts } = useQuery({
    queryKey: ["admin-all-posts"],
    queryFn: async () => { const r = await fetch("/api/posts?limit=100"); return (await r.json()).posts || []; },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const r = await fetch("/api/admin/addons", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-addons"] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Addon) => {
      const r = await fetch("/api/admin/addons", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-addons"] }); setEditItem(null); setShowForm(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/admin/addons?id=${id}`, { method: "DELETE" }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-addons"] }),
  });

  const resetForm = () => setForm({ postId: "", title: "", description: "", price: "", type: "extra", active: true });

  const openEdit = (a: Addon) => { setEditItem(a); setForm({ postId: String(a.postId), title: a.title, description: a.description || "", price: String(a.price), type: a.type, active: a.active }); setShowForm(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editItem) updateMutation.mutate({ ...editItem, ...form, price: parseFloat(form.price), postId: parseInt(form.postId) } as Addon);
    else createMutation.mutate(form);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Доп. услуги (Addons)</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); resetForm(); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 transition-colors">+ Добавить</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editItem ? "Редактировать" : "Создать"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select value={form.postId} onChange={e => setForm({...form, postId: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm cursor-pointer" required>
              <option value="">Выберите объект</option>
              {posts?.map((p: {id: number; title: string}) => <option key={p.id} value={p.id}>{p.title}</option>)}
            </select>
            <input placeholder="Название" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
            <input placeholder="Описание" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
            <div className="flex gap-4">
              <input type="number" placeholder="Цена" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl text-sm cursor-pointer">
                <option value="extra">Дополнительно</option>
                <option value="service">Услуга</option>
                <option value="meal">Питание</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="cursor-pointer" /> Активен</label>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">{editItem ? "Сохранить" : "Создать"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium cursor-pointer">Отмена</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? <div className="animate-pulse p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Название</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Тип</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Цена</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">Активен</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase">Действия</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {addons?.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{a.id}</td>
                  <td className="px-6 py-4"><div className="font-medium text-gray-900">{a.title}</div>{a.description && <div className="text-xs text-gray-500">{a.description}</div>}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{a.type}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{a.price} ₽</td>
                  <td className="px-6 py-4"><span className={`px-2 py-1 text-xs rounded-full ${a.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>{a.active ? "Да" : "Нет"}</span></td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(a)} className="text-blue-600 hover:text-blue-900 text-sm mr-3 cursor-pointer">✎</button>
                    <button onClick={() => { if (confirm("Удалить?")) deleteMutation.mutate(a.id); }} className="text-red-500 hover:text-red-700 text-sm cursor-pointer">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {addons?.length === 0 && <div className="text-center py-8 text-gray-500">Нет доп. услуг</div>}
      </div>
    </div>
  );
}
