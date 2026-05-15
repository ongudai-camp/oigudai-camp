"use client";

import { useState, useRef } from "react";
import { uploadImagesAction, deleteImageAction } from "@/app/actions/upload";

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxFiles?: number;
}

export default function ImageUploader({ images, onChange, maxFiles = 10 }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = () => {
    inputRef.current?.click();
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      for (const file of Array.from(files)) {
        formData.append("files", file);
      }
      const result = await uploadImagesAction(formData);
      if (result.error) {
        setError(result.error);
      } else if (result.urls) {
        onChange([...images, ...result.urls]);
      }
    } catch {
      setError("Ошибка при загрузке");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = async (url: string) => {
    onChange(images.filter((img) => img !== url));
    await deleteImageAction(url);
  };

  const handleReorder = (index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const newImages = [...images];
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-900">
          {images.length > 0
            ? `Загружено: ${images.length} ${images.length === 1 ? "изображение" : "изображений"}`
            : "Изображения не загружены"}
        </p>
      </div>

      {/* Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {images.map((url, idx) => (
            <div key={url} className="relative group aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={url}
                alt={`Image ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {idx === 0 && (
                <span className="absolute top-2 left-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                  Главная
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {idx > 0 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, -1)}
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    aria-label="Переместить влево"
                  >
                    ←
                  </button>
                )}
                {idx < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 1)}
                    className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                    aria-label="Переместить вправо"
                  >
                    →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(url)}
                  className="w-8 h-8 bg-red-500/90 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors cursor-pointer"
                  aria-label="Удалить"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {images.length < maxFiles && (
        <button
          type="button"
          onClick={handleSelect}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors cursor-pointer"
          aria-label="Выбрать изображения"
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFiles}
            className="hidden"
          />
          <p className="text-gray-900">
            {uploading ? "Загрузка…" : "Перетащите изображения сюда или нажмите для выбора"}
          </p>
          <p className="text-xs text-gray-900 mt-1">
            {maxFiles - images.length > 0
              ? `Можно загрузить еще ${maxFiles - images.length}`
              : "Лимит исчерпан"}
          </p>
        </button>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
