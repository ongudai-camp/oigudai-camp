"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import PhoneInput from "@/components/common/PhoneInput";
import type { CountryCodeEntry } from "@/lib/countryCodes";

export default function SignInPage() {
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const [loginMethod, setLoginMethod] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeEntry | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  function handlePhoneChange(val: string, country: CountryCodeEntry) {
    setPhone(val)
    setSelectedCountry(country)
  }

  const handleSendSMS = async () => {
    if (!phone) {
      setError(t("auth.phone") + " " + t("common.required"));
      return;
    }
    if (!privacyAccepted) {
      setError(t("privacy.required"));
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/send-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, mode: "signin" }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Ошибка отправки SMS");
      }
      
      setSmsSent(true);
      setError("");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySMS = async () => {
    if (!smsCode) {
      setError("Введите код из SMS");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone,
          code: smsCode 
        }),
      });

      const verifyData = await res.json();
      
      if (!res.ok) {
        throw new Error(verifyData.error || "Неверный код");
      }
      
      const signInRes = await signIn("credentials", {
        phone,
        password: verifyData.signInToken,
        redirect: false,
      });

      if (signInRes?.error) {
        setError("Ошибка входа");
      } else {
        router.push(`/${locale}/dashboard`);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!privacyAccepted) {
      setError(t("privacy.required"));
      return;
    }
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else {
      router.push(`/${locale}/dashboard`);
    }
  };

  const handleSocialSignIn = (provider: string) => {
    if (!privacyAccepted) {
      setError(t("privacy.required"));
      return;
    }
    if (provider === "vk") {
      const clientId = process.env.NEXT_PUBLIC_VK_CLIENT_ID || "your-vk-client-id";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/vk`);
      window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email`;
    } else if (provider === "telegram") {
      const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "your-telegram-bot-id";
      window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${window.location.origin}&return_to=/api/auth/callback/telegram`;
    } else if (provider === "yandex") {
      const clientId = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID || "your-yandex-client-id";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/yandex`);
      window.location.href = `https://oauth.yandex.ru/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=login:info login:email`;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column: Sign In Form */}
      <div className="flex items-center justify-center bg-white py-12 px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center md:text-left">
            <Link href={`/${locale}`} className="inline-block text-2xl font-black text-sky-900 tracking-tighter mb-8">
              ONGUDAI<span className="text-orange-500">CAMP</span>
            </Link>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {t("auth.signin")}
            </h2>
            <p className="mt-3 text-gray-500">
              {t("auth.noAccount")}{" "}
              <Link href={`/${locale}/auth/register`} className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
                {t("auth.register")}
              </Link>
            </p>
          </div>

          {/* Privacy Policy Checkbox */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                id="privacy"
                checked={privacyAccepted}
                onChange={(e) => setPrivacyAccepted(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500 cursor-pointer transition-all"
              />
            </div>
            <label htmlFor="privacy" className="text-sm text-gray-600 leading-tight">
              {t("privacy.accept")}{" "}
              <Link href={`/${locale}/privacy-policy`} className="text-sky-600 font-medium hover:underline">
                {t("privacy.link")}
              </Link>{" "}
              <span className="text-gray-400">({t("privacy.required")})</span>
            </label>
          </div>

          {/* Login Method Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => { setLoginMethod("phone"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                loginMethod === "phone"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("auth.phone")}
            </button>
            <button
              onClick={() => { setLoginMethod("email"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                loginMethod === "email"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t("auth.email")}
            </button>
          </div>

          {loginMethod === "phone" ? (
            <div className="space-y-6">
              {!smsSent ? (
                <>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                      {t("auth.phone")}
                    </label>
                    <PhoneInput onChange={handlePhoneChange} />
                  </div>

                  <button
                    type="button"
                    onClick={handleSendSMS}
                    disabled={loading || !privacyAccepted}
                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale cursor-pointer"
                  >
                    {loading ? t("common.loading") : t("auth.getCode")}
                  </button>
                </>
              ) : (
                <>
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <label htmlFor="smsCode" className="block text-sm font-bold text-gray-700 mb-2">
                      {t("auth.verifyCode")}
                    </label>
                    <input
                      id="smsCode"
                      type="text"
                      required
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="······"
                      className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-center text-4xl tracking-[0.5em] font-black"
                      maxLength={6}
                    />
                    <p className="mt-3 text-sm text-gray-500 text-center">
                      {t("auth.codeSent")} <span className="font-bold text-gray-900">{phone}</span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifySMS}
                    disabled={loading}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-600/30 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                  >
                    {loading ? t("common.loading") : t("auth.verifyCode")}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setSmsSent(false); setSmsCode(""); }}
                    className="w-full py-2 text-sm font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer"
                  >
                    {t("auth.resendCode")}
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleSocialSignIn("vk")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="VK"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24" fill="#4C75A3">
                    <path d="M12.14 18.11c-3.44 0-6.26-2.54-6.26-6.26 0-3.44 2.54-6.26 6.26-6.26 3.44 0 6.26 2.54 6.26 6.26 0 3.44-2.54 6.26-6.26 6.26zm0-10.52c-2.34 0-4.26 1.92-4.26 4.26s1.92 4.26 4.26 4.26 4.26-1.92 4.26-4.26-1.92-4.26-4.26-4.26z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialSignIn("telegram")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="Telegram"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24" fill="#0088cc">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-2.02 1.28-5.7 3.76-.54.37-1.03.56-1.47.55-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.42-1.45-.89.03-.25.38-.5 1.04-.76 4.07-1.77 6.79-2.94 8.15-3.5 3.88-1.62 4.69-1.9 5.21-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialSignIn("yandex")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="Yandex"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 24 24" fill="#FF0000">
                    <path d="M2 8.5v7h3.5c.17 0 .3-.13.3-.3v-6.4c0-.17-.13-.3-.3-.3H2zm4.5 0v7c0 .83.67 1.5 1.5 1.5h3.5c.17 0 .3-.13.3-.3v-7.4c0-.17-.13-.3-.3-.3H7c-.83 0-1.5.67-1.5 1.5z"/>
                  </svg>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"/>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-gray-400 font-bold uppercase tracking-widest">{t("auth.orSignInWith")} email</span>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleEmailSignIn}>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    {t("auth.email")}
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                    {t("auth.password")}
                  </label>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !privacyAccepted}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:grayscale cursor-pointer"
                >
                  {loading ? t("common.loading") : t("auth.signin")}
                </button>
              </form>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Visual Branding */}
      <div className="hidden md:block relative overflow-hidden bg-sky-900">
        <div 
          className="absolute inset-0 z-0 scale-110 hover:scale-100 transition-transform duration-1000"
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-sky-950/80 via-sky-900/40 to-orange-500/20 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-start justify-end p-16 lg:p-24 text-white">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-1 bg-orange-500 rounded-full"></div>
            <h3 className="text-5xl lg:text-6xl font-black leading-tight tracking-tighter">
              {t("hero.title")} <br/>
              <span className="text-orange-400">{t("hero.subtitle")}</span>
            </h3>
            <p className="text-xl text-sky-100/90 leading-relaxed font-medium">
              {t("hero.description")}
            </p>
            
            <div className="flex items-center gap-4 pt-8">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-sky-900 bg-gray-200 overflow-hidden shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-sky-200 tracking-wide uppercase">
                +2,400 {t("about.stats.guests")}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative SVG Pattern */}
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="198" stroke="white" strokeWidth="4" />
            <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="2" />
            <circle cx="200" cy="200" r="100" stroke="white" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}
