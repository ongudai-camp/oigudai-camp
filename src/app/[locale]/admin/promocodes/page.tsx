"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface PromoCode {
  id: number;
  code: string;
  discountType: string;
  discountValue: number;
  minAmount: number | null;
  maxUses: number | null;
  usedCount: number;
  active: boolean;
  expiresAt: string | null;
}

export default function AdminPromocodesPage() {
  const t = useTranslations('admin');
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<PromoCode | null>(null);
  const [form, setForm] = useState({ code: "", discountType: "percent", discountValue: "", minAmount: "", maxUses: "", active: true, expiresAt: "" });

  const { data: promocodes, isLoading } = useQuery({
    queryKey: ["admin-promocodes"],
    queryFn: async () => { const r = await fetch("/api/admin/promocodes"); return r.json() as Promise<PromoCode[]>; },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const r = await fetch("/api/admin/promocodes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] }); setShowForm(false); resetForm(); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: PromoCode) => {
      const r = await fetch("/api/admin/promocodes", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...data }) });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] }); setEditItem(null); setShowForm(false); resetForm(); },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => { await fetch(`/api/admin/promocodes?id=${id}`, { method: "DELETE" }); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-promocodes"] }),
  });

  const resetForm = () => setForm({ code: "", discountType: "percent", discountValue: "", minAmount: "", maxUses: "", active: true, expiresAt: "" });

  const openEdit = (p: PromoCode) => {
    setEditItem(p);
    setForm({ code: p.code, discountType: p.discountType, discountValue: String(p.discountValue), minAmount: p.minAmount ? String(p.minAmount) : "", maxUses: p.maxUses ? String(p.maxUses) : "", active: p.active, expiresAt: p.expiresAt ? p.expiresAt.split("T")[0] : "" });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = { ...form };
    if (editItem) updateMutation.mutate({ ...editItem, ...data, discountValue: parseFloat(form.discountValue), minAmount: form.minAmount ? parseFloat(form.minAmount) : null, maxUses: form.maxUses ? parseInt(form.maxUses) : null } as unknown as PromoCode);
    else createMutation.mutate(data);
  };

  const isExpired = (p: PromoCode) => p.expiresAt && new Date(p.expiresAt) < new Date();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('promocodes.title')}</h1>
        <button onClick={() => { setShowForm(true); setEditItem(null); resetForm(); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">{t('promocodes.addNew')}</button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">{editItem ? t('promocodes.editTitle') : t('promocodes.newTitle')}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input placeholder={t('promocodes.form.code')} value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
            <div className="flex gap-4">
              <select value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})} className="px-4 py-3 border border-gray-200 rounded-xl text-sm cursor-pointer">
                <option value="percent">{t('promocodes.discountTypes.percent')}</option>
                <option value="fixed">{t('promocodes.discountTypes.fixed')}</option>
              </select>
              <input type="number" placeholder={t('promocodes.form.discountValue')} value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" required />
            </div>
            <div className="flex gap-4">
              <input type="number" placeholder={t('promocodes.form.minAmount')} value={form.minAmount} onChange={e => setForm({...form, minAmount: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" />
              <input type="number" placeholder={t('promocodes.form.maxUses')} value={form.maxUses} onChange={e => setForm({...form, maxUses: e.target.value})} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm" />
            </div>
            <input type="date" placeholder={t('promocodes.form.expiresAt')} value={form.expiresAt} onChange={e => setForm({...form, expiresAt: e.target.value})} className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})} className="cursor-pointer" /> {t('promocodes.form.active')}</label>
            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700">{editItem ? t('promocodes.form.save') : t('promocodes.form.create')}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); resetForm(); }} className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium cursor-pointer">{t('promocodes.form.cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {isLoading ? <div className="animate-pulse p-8 space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded" />)}</div> : (
          <table className="w-full">
            <thead className="bg-gray-50"><tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.code')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.type')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.value')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.used')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.status')}</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.expires')}</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase">{t('promocodes.columns.actions')}</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-100">
              {promocodes?.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono font-bold text-gray-900">{p.code}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.discountType === "percent" ? "%" : "₽"}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{p.discountValue}{p.discountType === "percent" ? "%" : " ₽"}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.usedCount}{p.maxUses ? ` / ${p.maxUses}` : ""}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${!p.active ? "bg-red-100 text-red-800" : isExpired(p) ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}`}>
                      {!p.active ? t('promocodes.statusDisabled') : isExpired(p) ? t('promocodes.statusExpired') : t('promocodes.statusActive')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("ru-RU") : "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => openEdit(p)} className="text-blue-600 hover:text-blue-900 text-sm mr-3 cursor-pointer">✎</button>
                    <button onClick={() => { if (confirm(t('promocodes.deleteConfirm'))) deleteMutation.mutate(p.id); }} className="text-red-500 hover:text-red-700 text-sm cursor-pointer">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {promocodes?.length === 0 && <div className="text-center py-8 text-gray-500">{t('promocodes.empty')}</div>}
      </div>
    </div>
  );
}
