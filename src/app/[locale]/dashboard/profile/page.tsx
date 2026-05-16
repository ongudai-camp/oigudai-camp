"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import { useEffect, useState, useRef } from "react";
import IdentityVerification from "@/components/dashboard/IdentityVerification";
import VerifyPhoneModal from "@/components/dashboard/VerifyPhoneModal";

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
  const [identityVerified, setIdentityVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false);

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
        setIdentityVerified(!!user.identityVerified);
        setPhoneVerified(!!user.phoneVerified);
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
    <>
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-8 text-sky-950">
              <h1 className="text-2xl font-bold mb-2">{t("profile")}</h1>
              <p className="text-gray-900">{t("settingsDescription")}</p>
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

            <div className="bg-white rounded-xl shadow-lg p-6 text-sky-950">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>📸</span>
                {t("photo")}
              </h2>
              <div className="flex items-center gap-6">
                <div className="relative w-24 h-24 rounded-full overflow-hidden bg-sky-100 flex-shrink-0">
                  {image ? (
                    <img
                      src={image}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl text-sky-400 font-bold">
                      {name?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="px-4 py-2 bg-sky-50 text-sky-700 font-medium rounded-xl hover:bg-sky-100 disabled:opacity-50 transition-all cursor-pointer text-sm"
                  >
                    {t("changePhoto")}
                  </button>
                  {image && (
                    <p className="text-xs text-gray-500">{t("clickToChange")}</p>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSave} className="bg-white rounded-xl shadow-lg p-6 text-sky-950">
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
                  <p className="text-xs text-gray-900">Формат: +7XXXXXXXXXX</p>
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
                  <p className="text-sm text-gray-900">{t("editingDisabledHint")}</p>
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

            <div className="bg-white rounded-xl shadow-lg p-6 text-sky-950">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span>ℹ️</span>
                Информация об аккаунте
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-1">Роль</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 capitalize">{role}</p>
                    {identityVerified && (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-bold uppercase">
                        Verified 🛡️
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {roleDescriptions[role] || "Пользователь"}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-1">Email</p>
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
                  <p className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-1">Телефон</p>
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900">{phone || "тАФ"}</p>
                    {phone && (
                      phoneVerified ? (
                        <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                          подтверждён
                        </span>
                      ) : (
                        <button
                          onClick={() => setIsVerifyModalOpen(true)}
                          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-all cursor-pointer shadow-sm active:scale-95"
                        >
                          Подтвердить
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs font-medium text-gray-900 uppercase tracking-wider mb-1">
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

            <IdentityVerification />
          </div>

          {isVerifyModalOpen && (
            <VerifyPhoneModal 
              onClose={() => setIsVerifyModalOpen(false)}
              onSuccess={() => {
                setPhoneVerified(true);
                setIsVerifyModalOpen(false);
                setMessage({ type: "success", text: "Телефон успешно подтвержден" });
                setTimeout(() => setMessage(null), 4000);
              }}
            />
          )}
    </>
  );
}
