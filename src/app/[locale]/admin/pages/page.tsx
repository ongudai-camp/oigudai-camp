"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";

interface PageContent {
  [key: string]: string | Record<string, string>;
}

interface PageData {
  slug: string;
  content: Record<string, PageContent | null>;
}

const PAGE_SLUGS = [
  { slug: "about", locales: ["ru", "en", "kk"] },
  { slug: "terms", locales: ["ru", "en", "kk"] },
  { slug: "privacy-policy", locales: ["ru", "en", "kk"] },
];

const PAGE_LABELS: Record<string, string> = {
  about: "О нас",
  terms: "Условия",
  "privacy-policy": "Политика конфиденциальности",
};

export default function AdminPagesPage() {
  const t = useTranslations('admin');
  const params = useParams();
  const currentLocale = (params.locale as string) || "ru";

  const [selectedSlug, setSelectedSlug] = useState<string>("about");
  const [editLocale, setEditLocale] = useState(currentLocale);
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: async () => {
      const r = await fetch("/api/admin/pages");
      return r.json() as Promise<{ pages: PageData[] }>;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async ({ slug, locale, content }: { slug: string; locale: string; content: PageContent }) => {
      const r = await fetch("/api/admin/pages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, locale, content }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pages"] });
      setSaving(false);
    },
    onError: () => setSaving(false),
  });

  const selectedPage = data?.pages.find(p => p.slug === selectedSlug);
  const currentContent = selectedPage?.content?.[editLocale];

  useEffect(() => {
    if (currentContent) {
      setEditContent(JSON.stringify(currentContent, null, 2));
    } else {
      setEditContent("{\n  \n}");
    }
  }, [selectedSlug, editLocale, currentContent]);

  const handleSave = () => {
    setSaving(true);
    try {
      const parsed = JSON.parse(editContent);
      saveMutation.mutate({ slug: selectedSlug, locale: editLocale, content: parsed });
    } catch {
      alert("Invalid JSON");
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('pages.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">{t('pages.pages')}</h3>
            <div className="space-y-1">
              {PAGE_SLUGS.map((p) => (
                <button
                  key={p.slug}
                  onClick={() => setSelectedSlug(p.slug)}
                  className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                    selectedSlug === p.slug
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {PAGE_LABELS[p.slug] || p.slug}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
              <div className="h-64 bg-gray-100 rounded" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">{PAGE_LABELS[selectedSlug]}</h2>
                <div className="flex gap-2">
                  {["ru", "en", "kk"].map((loc) => (
                    <button
                      key={loc}
                      onClick={() => setEditLocale(loc)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase cursor-pointer transition-all ${
                        editLocale === loc
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full h-96 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono"
                spellCheck={false}
              />

              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? t('general.saving') : t('general.save')}
                </button>
                {saveMutation.isSuccess && (
                  <span className="text-green-600 text-sm font-medium">{t('general.saved')}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
