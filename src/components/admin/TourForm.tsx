"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "./ImageUploader";
import LocationPicker from "@/components/common/LocationPicker";

interface TourData {
  id: number;
  title: string;
  content: string | null;
  address: string | null;
  price: number;
  salePrice: number | null;
  latitude: number | null;
  longitude: number | null;
  authorId: number | null;
  status: string;
  meta?: Array<{ key: string; value: string | null }>;
  featuredImage?: string | null;
  gallery?: string | null;
}

interface TourFormProps {
  users: { id: number; name: string | null; email: string | null }[];
  tour?: TourData;
}

export default function TourForm({ users, tour }: TourFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: tour?.title || "",
    content: tour?.content || "",
    address: tour?.address || "",
    price: tour?.price?.toString() || "",
    salePrice: tour?.salePrice?.toString() || "",
    latitude: tour?.latitude?.toString() || "",
    longitude: tour?.longitude?.toString() || "",
    authorId: tour?.authorId?.toString() || "",
    status: tour?.status || "publish",
    duration: tour?.meta?.find((m) => m.key === "duration")?.value || "",
    groupSize: tour?.meta?.find((m) => m.key === "groupSize")?.value || "",
    difficulty: tour?.meta?.find((m) => m.key === "difficulty")?.value || "",
  });
  const [images, setImages] = useState<string[]>(
    tour?.featuredImage
      ? [tour.featuredImage, ...(tour.gallery ? JSON.parse(tour.gallery) : [])].filter(
          (v, i, a) => a.indexOf(v) === i
        )
      : tour?.gallery
        ? JSON.parse(tour.gallery)
        : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = tour
        ? `/api/admin/tours/${tour.id}`
        : "/api/admin/tours";

      const method = tour ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          authorId: formData.authorId ? parseInt(formData.authorId) : null,
          price: parseFloat(formData.price as unknown as string),
          salePrice: formData.salePrice ? parseFloat(formData.salePrice as unknown as string) : null,
          latitude: formData.latitude ? parseFloat(formData.latitude as unknown as string) : null,
          longitude: formData.longitude ? parseFloat(formData.longitude as unknown as string) : null,
          featuredImage: images[0] || null,
          gallery: images.length > 0 ? JSON.stringify(images) : null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка сохранения");
      }

      router.push("/admin/tours");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Название тура *
        </label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Описание
        </label>
        <textarea
          rows={6}
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Локация
        </label>
        <LocationPicker
          address={formData.address}
          latitude={formData.latitude ? parseFloat(formData.latitude) : null}
          longitude={formData.longitude ? parseFloat(formData.longitude) : null}
          onChange={(data) => {
            setFormData({
              ...formData,
              address: data.address,
              latitude: data.latitude?.toString() || "",
              longitude: data.longitude?.toString() || "",
            });
          }}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Автор
          </label>
          <select
            value={formData.authorId}
            onChange={(e) => setFormData({ ...formData, authorId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          >
            <option value="">Выберите автора</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name || user.email}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена (₽/чел) *
          </label>
          <input
            type="number"
            required
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Цена со скидкой
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.salePrice}
            onChange={(e) => setFormData({ ...formData, salePrice: e.target.value as unknown as string })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Длительность
          </label>
          <input
            type="text"
            placeholder="3 дня / 2 ночи"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Размер группы
          </label>
          <input
            type="text"
            placeholder="6-12"
            value={formData.groupSize}
            onChange={(e) => setFormData({ ...formData, groupSize: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Сложность
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          >
            <option value="">Выберите</option>
            <option value="Легкий">Легкий</option>
            <option value="Средний">Средний</option>
            <option value="Сложный">Сложный</option>
          </select>
        </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Галерея изображений
        </label>
        <p className="text-sm text-[#1A2B48]">Первое изображение будет главным.</p>
        <ImageUploader images={images} onChange={setImages} />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Статус
        </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-[#5000FF]"
          >
            <option value="publish">Опубликовано</option>
            <option value="draft">Черновик</option>
            <option value="pending">На модерации</option>
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Сохранение..." : "Сохранить"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/tours")}
          className="bg-gray-200 text-gray-700 px-6 py-2 rounded hover:bg-gray-300"
        >
          Отмена
        </button>
      </div>
    </form>
  );
}
