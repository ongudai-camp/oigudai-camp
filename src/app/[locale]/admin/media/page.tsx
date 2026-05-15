"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface MediaFile {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function AdminMediaPage() {
  const t = useTranslations('admin');
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-media"],
    queryFn: async () => {
      const r = await fetch("/api/admin/media");
      return r.json() as Promise<{ files: MediaFile[] }>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (filename: string) => {
      await fetch(`/api/admin/media?filename=${encodeURIComponent(filename)}`, { method: "DELETE" });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-media"] }),
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('media.title')}</h1>
        <span className="text-sm text-gray-500">{data?.files.length ?? 0} {t('media.files')}</span>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 animate-pulse">
              <div className="h-32 bg-gray-100 rounded-lg mb-3" />
              <div className="h-3 w-20 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      ) : data?.files.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <p className="text-gray-500">{t('media.empty')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data?.files.map((file) => (
            <div
              key={file.name}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group"
            >
              <button
                onClick={() => setPreviewUrl(file.url)}
                className="w-full h-32 bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden"
              >
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-cover"
                />
              </button>
              <div className="p-3">
                <p className="text-xs text-gray-900 font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-500">{formatSize(file.size)}</p>
                <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { navigator.clipboard.writeText(file.url); }}
                    className="text-xs text-blue-600 cursor-pointer hover:text-blue-800"
                  >
                    {t('media.copyUrl')}
                  </button>
                  <button
                    onClick={() => { if (confirm(t('media.deleteConfirm'))) deleteMutation.mutate(file.name); }}
                    className="text-xs text-red-500 cursor-pointer hover:text-red-700"
                  >
                    {t('media.delete')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {previewUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <div className="max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img src={previewUrl} className="max-w-full max-h-[85vh] rounded-xl shadow-2xl" alt="preview" />
            <button
              onClick={() => setPreviewUrl(null)}
              className="mt-3 bg-white/90 text-gray-900 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer hover:bg-white transition-colors"
            >
              {t('media.closePreview')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
