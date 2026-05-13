"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";

interface PackageFormProps {
  initialData?: {
    id: number;
    name: string;
    price: number;
    duration: number;
    postsLimit: number;
    featured: boolean;
  };
}

export default function PackageForm({ initialData }: PackageFormProps) {
  const router = useRouter();
  const locale = useLocale();
  const [name, setName] = useState(initialData?.name || "");
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [duration, setDuration] = useState(initialData?.duration?.toString() || "");
  const [postsLimit, setPostsLimit] = useState(initialData?.postsLimit?.toString() || "0");
  const [featured, setFeatured] = useState(initialData?.featured || false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = initialData
        ? `/api/admin/packages/${initialData.id}`
        : "/api/admin/packages";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price, duration, postsLimit, featured }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save package");
      }

      router.push(`/${locale}/admin/packages`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving package");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название пакета *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-[#1A2B48]"
            placeholder="Базовый"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена (₽) *
          </label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-[#1A2B48]"
            placeholder="10000"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Длительность (дни) *
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            min="1"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-[#1A2B48]"
            placeholder="30"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Лимит постов (0 = безлимит)
          </label>
          <input
            type="number"
            value={postsLimit}
            onChange={(e) => setPostsLimit(e.target.value)}
            min="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-[#1A2B48]"
          />
        </div>

        <div className="flex items-center pt-8">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">Популярный / Featured</span>
          </label>
        </div>
      </div>

      <div className="flex gap-4 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Сохранение..." : initialData ? "Сохранить изменения" : "Создать пакет"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors cursor-pointer"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
