"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Shield, Key, ToggleLeft, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

interface ChatSettings {
  configured: boolean;
  envEnabled: boolean;
  dbEnabled: boolean | null;
  enabled: boolean;
}

export default function AdminChatSettingsPage() {
  const t = useTranslations("admin");
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings/chat")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load settings");
        setLoading(false);
      });
  }, []);

  const handleToggle = async () => {
    if (!settings) return;
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/settings/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !settings.enabled }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setSettings({ ...settings, enabled: data.enabled, dbEnabled: data.enabled });
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError("Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Shield size={28} className="text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Chat Settings</h1>
          <p className="text-sm text-gray-900 mt-1">Configure AI-powered chat support for users</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 size={18} />
          Settings saved successfully
        </div>
      )}

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Key size={20} className="text-gray-900" />
                <div>
                  <p className="font-medium text-gray-900">OpenAI API Key</p>
                  <p className="text-sm text-gray-900">Required for AI chat replies</p>
                </div>
              </div>
              <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${
                settings?.configured ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
              }`}>
                {settings?.configured ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {settings?.configured ? "Configured" : "Not configured"}
              </span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <ToggleLeft size={20} className="text-gray-900" />
                <div>
                  <p className="font-medium text-gray-900">AI Chat Enabled</p>
                  <p className="text-sm text-gray-900">Toggle AI-powered responses in user chat</p>
                </div>
              </div>
              <button
                onClick={handleToggle}
                disabled={saving || !settings?.configured}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 ${
                  settings?.enabled ? "bg-blue-600" : "bg-gray-300"
                } ${!settings?.configured ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                    settings?.enabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <span className="text-lg">🤖</span>
                <div>
                  <p className="font-medium text-gray-900">Model</p>
                  <p className="text-sm text-gray-900">OpenAI GPT-4o-mini for intelligent replies</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                gpt-4o-mini
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Smart Fallback Logic</h2>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm text-gray-900">
            <p>1. <strong>AI Chat</strong> — tries OpenAI GPT-4o-mini with database tool calling</p>
            <p>2. <strong>Rule-based bot</strong> — falls back to keyword-matching bot if AI is unavailable</p>
            <p>3. <strong>Admin handoff</strong> — if user requests &quot;admin&quot;, notifies staff</p>
            <p className="text-xs text-gray-900 mt-3">
              Note: The rule-based bot is always enabled. The AI chat layer can be toggled above.
            </p>
          </div>
        </div>
      </div>

      {saving && (
        <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <Loader2 size={16} className="animate-spin" />
          Saving...
        </div>
      )}
    </div>
  );
}
