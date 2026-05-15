"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

interface SiteSettings {
  [key: string]: string;
}

const SETTING_FIELDS = [
  { key: "site_name", label: "siteName", type: "text" },
  { key: "site_description", label: "siteDescription", type: "textarea" },
  { key: "site_keywords", label: "siteKeywords", type: "text" },
  { key: "contact_email", label: "contactEmail", type: "email" },
  { key: "contact_phone", label: "contactPhone", type: "text" },
  { key: "contact_address", label: "contactAddress", type: "text" },
  { key: "social_vk", label: "socialVk", type: "url" },
  { key: "social_telegram", label: "socialTelegram", type: "url" },
  { key: "social_youtube", label: "socialYoutube", type: "url" },
  { key: "og_title", label: "ogTitle", type: "text" },
  { key: "og_description", label: "ogDescription", type: "textarea" },
  { key: "og_image", label: "ogImage", type: "text" },
  { key: "footer_tagline", label: "footerTagline", type: "text" },
  { key: "footer_copyright", label: "footerCopyright", type: "text" },
  { key: "map_center_lat", label: "mapCenterLat", type: "text" },
  { key: "map_center_lng", label: "mapCenterLng", type: "text" },
  { key: "map_zoom", label: "mapZoom", type: "number" },
];

const FIELD_SECTIONS = [
  { title: "siteSection", keys: ["site_name", "site_description", "site_keywords"] },
  { title: "contactsSection", keys: ["contact_email", "contact_phone", "contact_address"] },
  { title: "socialSection", keys: ["social_vk", "social_telegram", "social_youtube"] },
  { title: "seoSection", keys: ["og_title", "og_description", "og_image"] },
  { title: "footerSection", keys: ["footer_tagline", "footer_copyright"] },
  { title: "mapSection", keys: ["map_center_lat", "map_center_lng", "map_zoom"] },
];

export default function AdminSettingsGeneralPage() {
  const t = useTranslations('admin');
  const queryClient = useQueryClient();
  const [form, setForm] = useState<SiteSettings>({});
  const [saving, setSaving] = useState(false);
  const [successKey, setSuccessKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-settings-general"],
    queryFn: async () => {
      const r = await fetch("/api/admin/settings");
      return r.json() as Promise<{ settings: SiteSettings }>;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings-general"] });
      setSaving(false);
    },
    onError: () => setSaving(false),
  });

  const handleChange = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = (key: string) => {
    setSaving(true);
    setSuccessKey(null);
    updateMutation.mutate(
      { key, value: form[key] || "" },
      { onSuccess: () => setSuccessKey(key) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-lg p-6 animate-pulse">
            <div className="h-6 w-40 bg-gray-200 rounded mb-6" />
            <div className="space-y-4">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-12 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('settings.general')}</h1>

      <div className="space-y-6">
        {FIELD_SECTIONS.map((section) => (
          <div key={section.title} className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold mb-4 text-gray-900">{t(`settings.${section.title}`)}</h2>
            <div className="space-y-4">
              {section.keys.map((key) => {
                const field = SETTING_FIELDS.find((f) => f.key === key);
                if (!field) return null;
                const currentValue = data?.settings?.[key] || form[key] || "";
                return (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      {t(`settings.${field.label}`)}
                    </label>
                    <div className="flex gap-3">
                      {field.type === "textarea" ? (
                        <textarea
                          value={currentValue}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm"
                          rows={3}
                        />
                      ) : (
                        <input
                          type={field.type}
                          value={currentValue}
                          onChange={(e) => handleChange(key, e.target.value)}
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm"
                        />
                      )}
                      <button
                        onClick={() => handleSave(key)}
                        disabled={saving}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-medium cursor-pointer hover:bg-blue-700 disabled:opacity-50 shrink-0 transition-colors"
                      >
                        {t('general.save')}
                      </button>
                    </div>
                    {successKey === key && (
                      <p className="text-green-600 text-xs mt-1">{t('general.saved')}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
