"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { useEffect, useState, useRef } from "react";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (!session?.user?.id) {
      router.push(`/${locale}/auth/signin`);
      return;
    }

    fetch("/api/user/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch");
        return r.json();
      })
      .then((user) => {
        setName(user.name || "");
        setEmail(user.email || "");
        setPhone(user.phone || "");
        setImage(user.image || "");
        setRole(user.role || "");
        setCreatedAt(user.createdAt || "");
        setHasPassword(!!user.hasPassword);
        setLoading(false);
      })
      .catch(() => {
        setName(session?.user?.name || "");
        setEmail(session?.user?.email || "");
        setRole(session?.user?.role || "");
        setLoading(false);
      });
  }, [session, router, locale]);

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

  function formatPhone(value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits.startsWith("7") && !digits.startsWith("8") && digits.length > 0) {
      return "+" + digits;
    }
    const normalized = digits.startsWith("8") ? "7" + digits.slice(1) : digits;
    return "+" + normalized;
  }

  function handlePhoneChange(value: string) {
    const cleaned = value.replace(/[^\d+]/g, "");
    if (cleaned === "") {
      setPhone("");
      return;
    }
    if (!cleaned.startsWith("+")) {
      setPhone(formatPhone(cleaned));
    } else {
      const afterPlus = cleaned.slice(1).replace(/\D/g, "");
      setPhone("+" + afterPlus);
    }
  }

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const uploadRes = await fetch("/api/user/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || "Upload failed");
      }

      const { url } = await uploadRes.json();
      setImage(url);

      const patchRes = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: url }),
      });

      if (patchRes.ok) {
        setMessage({ type: "success", text: t("profileUpdated") });
        await updateSession();
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Upload failed" });
    }

    setAvatarUploading(false);
    setTimeout(() => setMessage(null), 4000);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setMessage({ type: "error", text: t("passwordMismatch") });
      setSaving(false);
      return;
    }

    const body: Record<string, unknown> = {};
    if (name !== (session?.user?.name || "")) body.name = name;
    if (email !== (session?.user?.email || "")) body.email = email;
    if (phone !== "" && phone !== session?.user?.phone) body.phone = phone;
    if (currentPassword && newPassword) {
      body.currentPassword = currentPassword;
      body.newPassword = newPassword;
    }

    if (Object.keys(body).length === 0) {
      setMessage({ type: "success", text: t("saved") });
      setSaving(false);
      return;
    }

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      setMessage({ type: "error", text: data.error || "Failed to save" });
    } else {
      setMessage({ type: "success", text: t("profileUpdated") });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      await updateSession();
    }

    setSaving(false);
    setTimeout(() => setMessage(null), 4000);
  }

  const filledCount = [name, email, phone, image].filter(Boolean).length;
  const completionPct = Math.round((filledCount / 4) * 100);

  const roleDescriptions: Record<string, string> = {
    admin: "Администратор — полный доступ к управлению",
    superadmin: "Супер-администратор — доступ ко всем функциям",
    moderator: "Модератор — управление контентом",
    subscriber: "Подписчик — базовый доступ",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] pt-24 pb-8 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 bg-white rounded-xl shadow-lg p-6 sticky top-24 self-start">
            <div className="text-center mb-6">
              <div className="relative mx-auto mb-3 w-20 h-20">
                {image ? (
                  <img
                    src={image}
                    alt={name || "User"}
                    className="w-20 h-20 rounded-full object-cover border-2 border-sky-200"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-sky-200">
                    <span className="text-2xl text-white font-bold">
                      {(name || "U")[0]}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute -bottom-1 -right-1 w-7 h-7 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
                  title="Сменить фото"
                >
                  {avatarUploading ? (
                    <span className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5 text-[#1A2B48]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <h3 className="font-semibold text-lg">{name || "User"}</h3>
              <p className="text-sm text-[#1A2B48]">{phone || email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {role}
              </span>
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#1A2B48] font-medium">Профиль заполнен</span>
                <span className="text-xs font-bold text-blue-600">{completionPct}%</span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-sky-400 to-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${completionPct}%` }}
                />
              </div>
            </div>

            <nav className="space-y-2">
              <Link
                href={`/${locale}/dashboard`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <span>📋</span>
                <span className="font-medium">{t("myBookings")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/settings`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <span>⚙️</span>
                <span className="font-medium">{t("settings")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/profile`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 transition-all duration-200"
              >
                <span>👤</span>
                <span className="font-medium">{t("profile")}</span>
              </Link>
              <Link
                href={`/${locale}/dashboard/chat`}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <span>💬</span>
                <span className="font-medium">{t("support")}</span>
              </Link>
              {role === "admin" && (
                <Link
                  href={`/${locale}/admin`}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <span>⚙️</span>
                  <span className="font-medium">{t("adminPanel")}</span>
                </Link>
              )}
            </nav>
          </aside>

          <main className="flex-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h1 className="text-2xl font-bold mb-2">{t("profile")}</h1>
              <p className="text-[#1A2B48]">{t("settingsDescription")}</p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl text-sm font-medium ${
                  message.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span>👤</span>
                {t("personalInfo")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t("profile")}</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t("email")}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">{t("phone")}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                    placeholder="+71234567890"
                  />
                  <p className="text-xs text-[#1A2B48]">Формат: +7XXXXXXXXXX</p>
                </div>
                {createdAt && (
                  <div className="space-y-1">
                    <label className="block text-sm font-medium text-gray-700">{t("memberSince")}</label>
                    <p className="text-lg font-medium text-gray-900 pt-2">
                      {format(new Date(createdAt), "dd MMM yyyy", { locale: dateLocale })}
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                  <span>🔑</span>
                  {t("changePassword")}
                </h3>
                {!hasPassword ? (
                  <p className="text-sm text-[#1A2B48]">{t("editingDisabledHint")}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t("currentPassword")}</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                        placeholder={t("enterCurrentPassword")}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t("newPassword")}</label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                        placeholder="••••••"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">{t("confirmPassword")}</label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-gray-900"
                        placeholder="••••••"
                      />
                      {newPassword && confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{t("passwordMismatch")}</p>
                      )}
                      {newPassword && newPassword.length < 6 && (
                        <p className="text-xs text-red-500 mt-1">{t("passwordShort")}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-sky-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 cursor-pointer"
                >
                  {saving ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {t("save")}
                    </span>
                  ) : (
                    t("save")
                  )}
                </button>
              </div>
            </form>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>ℹ️</span>
                Информация об аккаунте
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-[#1A2B48] uppercase tracking-wider mb-1">Роль</p>
                  <p className="font-semibold text-gray-900 capitalize">{role}</p>
                  <p className="text-sm text-[#1A2B48] mt-0.5">
                    {roleDescriptions[role] || "Пользователь"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-[#1A2B48] uppercase tracking-wider mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900">{email || "—"}</p>
                    {email ? (
                      <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                        подтверждён
                      </span>
                    ) : (
                      <span className="text-xs px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full font-medium">
                        не указан
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-[#1A2B48] uppercase tracking-wider mb-1">Телефон</p>
                  <p className="font-semibold text-gray-900">{phone || "—"}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-[#1A2B48] uppercase tracking-wider mb-1">
                    На сайте с
                  </p>
                  <p className="font-semibold text-gray-900">
                    {createdAt
                      ? format(new Date(createdAt), "dd MMM yyyy", { locale: dateLocale })
                      : "—"}
                  </p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
