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
    } else if (provider === "sber") {
      const clientId = process.env.NEXT_PUBLIC_SBER_CLIENT_ID || "your-sber-client-id";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/sber`);
      window.location.href = `https://api.sberbank.ru/auth/oauth/v2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=openid name email phone`;
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 pt-24">
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
            <p className="mt-3 text-[#1A2B48]">
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
            <label htmlFor="privacy" className="text-sm text-[#1A2B48] leading-tight">
              {t("privacy.accept")}{" "}
              <Link href={`/${locale}/privacy-policy`} className="text-sky-600 font-medium hover:underline">
                {t("privacy.link")}
              </Link>{" "}
              <span className="text-[#1A2B48]">({t("privacy.required")})</span>
            </label>
          </div>

          {/* Login Method Toggle */}
          <div className="flex p-1 bg-gray-100 rounded-xl">
            <button
              onClick={() => { setLoginMethod("phone"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                loginMethod === "phone"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-[#1A2B48] hover:text-gray-700"
              }`}
            >
              {t("auth.phone")}
            </button>
            <button
              onClick={() => { setLoginMethod("email"); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 cursor-pointer ${
                loginMethod === "email"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-[#1A2B48] hover:text-gray-700"
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
                      className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-center text-4xl tracking-[0.5em] font-black text-[#1A2B48]"
                      maxLength={6}
                    />
                    <p className="mt-3 text-sm text-[#1A2B48] text-center">
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
              <div className="grid grid-cols-4 gap-2">
                <button
                  onClick={() => handleSocialSignIn("vk")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="VK ID"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 48 48" fill="#0077FF">
                    <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm10.6 30.6h-4.2c-1.6 0-2.2-.8-3.6-2.4-1.2-1.2-2.4-2.6-3.6-2.6-.6 0-1.2.2-1.8.6-.6.4-.8 1.2-.8 2.2v2.2c0 .8-.2 1.2-1 1.4-2.4.6-5.2 0-7.8-2.4-3.6-3.6-6.6-8.4-6.8-8.8-.4-.8-.2-1.2.6-1.2h4.2c.8 0 1.2.2 1.6 1 .4.8 1.8 3.8 3.2 5.2 1.2 1.2 2 1.6 2.8 1.6.6 0 1-.4 1-1.4v-4.6c-.2-1.2-.8-1.6-.8-2.2-.2-.4 0-.8.4-1h.2c.6-.2 1.6-.4 2.8-.4 1.6 0 2.4.4 2.8.8.4.4.4 1.2.4 2.2v4c0 .6.2 1 .8 1 .4 0 1-.2 1.8-1 1.6-2 2.6-5 2.8-5.2.2-.6.6-.8 1.2-.8h4.2c.8 0 1.2.4 1 1.2-.6 2.8-3.6 7.2-4.6 8.6-1 1.4-1 1.8 0 3.2.8 1.2 2.6 2.8 3.2 3.8.4.6.2 1.2-.6 1.2z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialSignIn("telegram")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="Telegram"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 48 48" fill="#0088cc">
                    <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm9.4 15.2c-.2 1-3 12.4-4.2 16.4-.6 2-1.8 2.6-3 2.8-.8 0-2-.6-3-1.2-1.8-1.2-3.4-2.6-5-4-.6-.6-.2-1.2.4-1.8.2-.2 3.4-3 6.8-6.2.8-.8 1.6-2.4-.2-2-.2 0-5.4 3.4-7.6 4.8-.8.6-2.2.6-3.2.4l-5.2-1.6c-1.2-.4-1.2-1.2.2-1.8 5.8-2.6 13.4-5.6 19.2-7.6 2.4-.8 4.6-1.6 6.6-2.2 1.2-.4 2.2-.2 2.6 1 .2.6 0 1.6-.4 3z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialSignIn("yandex")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="Yandex ID"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 48 48" fill="#FC3F1D">
                    <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm-2.4 29.6h-3.6V14.6c0-.4.2-.6.6-.6h4.4c4.8 0 8 2.6 8 7 0 3.8-2.2 6.6-5.6 7.6l6.4 9.4v.4h-4l-5.6-8.4h-.6v5.6zm0-8.6h1.8c2.4 0 4-1.6 4-4s-1.6-4-4-4h-1.8v8z"/>
                  </svg>
                </button>

                <button
                  onClick={() => handleSocialSignIn("sber")}
                  className="flex items-center justify-center py-3 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer group"
                  title="SberID"
                >
                  <svg className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" viewBox="0 0 48 48" fill="#2EAC57">
                    <path d="M24 4C12.96 4 4 12.96 4 24s8.96 20 20 20 20-8.96 20-20S35.04 4 24 4zm10.4 16.8l-9.2 9.2c-.6.6-1.6.6-2.2 0l-5.6-5.6c-.6-.6-.6-1.6 0-2.2.6-.6 1.6-.6 2.2 0l4.6 4.4 8-8c.6-.6 1.6-.6 2.2 0 .6.8.6 1.8 0 2.2z"/>
                  </svg>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100"/>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-4 bg-white text-[#1A2B48] font-bold uppercase tracking-widest">{t("auth.orSignInWith")} email</span>
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium text-[#1A2B48]"
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
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium text-[#1A2B48]"
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
