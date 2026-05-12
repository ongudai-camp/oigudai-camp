"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { Check, Phone, ShieldCheck, UserCircle } from "lucide-react";
import clsx from "clsx";
import PhoneInput from "@/components/common/PhoneInput";
import type { CountryCodeEntry } from "@/lib/countryCodes";

export default function RegisterPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  
  // Step 1: Phone, Step 2: Verification, Step 3: Profile
  const [step, setStep] = useState(1);
  const [phoneRaw, setPhoneRaw] = useState(""); // stores countryCode + digits for API
  const [formData, setFormData] = useState({
    name: "",
    phone: "", // display value
    email: "",
    smsCode: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCodeEntry | null>(null);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  function handlePhoneChange(val: string, country: CountryCodeEntry) {
    setPhoneRaw(val)
    setSelectedCountry(country)
    setFormData(prev => ({ ...prev, phone: val }))
  }

  const handleSendSMS = async () => {
    if (!phoneRaw) {
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
        body: JSON.stringify({ phone: phoneRaw }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка отправки СМС");
      }
      
      setStep(2);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySMS = async () => {
    if (!formData.smsCode || formData.smsCode.length < 6) {
      setError("Введите 6-значный код из СМС");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const res = await fetch("/api/auth/verify-sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          phone: phoneRaw,
          code: formData.smsCode 
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Неверный код");
      }
      
      setStep(3);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    if (formData.password !== formData.confirmPassword) {
      setError("Пароли не совпадают");
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: phoneRaw,
          email: formData.email,
          password: formData.password,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Ошибка регистрации");
      }
      
      router.push(`/${locale}/auth/register/congratulations`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, label: t("auth.phone"), icon: Phone },
    { id: 2, label: t("auth.verifyCode"), icon: ShieldCheck },
    { id: 3, label: t("auth.profile"), icon: UserCircle },
  ];

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left Column: Register Form */}
      <div className="flex items-center justify-center bg-white py-12 px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center md:text-left">
            <Link href={`/${locale}`} className="inline-block text-2xl font-black text-sky-900 tracking-tighter mb-8">
              ONGUDAI<span className="text-orange-500">CAMP</span>
            </Link>
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
              {t("auth.register")}
            </h2>
            <p className="mt-3 text-gray-500">
              {t("auth.hasAccount")}{" "}
              <Link href={`/${locale}/auth/signin`} className="text-orange-500 font-bold hover:text-orange-600 transition-colors">
                {t("auth.signin")}
              </Link>
            </p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center flex-1 last:flex-none">
                <div 
                  className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 border-2",
                    step === s.id 
                      ? "bg-orange-500 border-orange-500 text-white shadow-lg shadow-orange-500/30" 
                      : step > s.id 
                        ? "bg-green-500 border-green-500 text-white" 
                        : "bg-white border-gray-200 text-gray-400"
                  )}
                >
                  {step > s.id ? <Check className="w-5 h-5" /> : <s.icon className="w-5 h-5" />}
                </div>
                {idx < steps.length - 1 && (
                  <div className={clsx(
                    "flex-1 h-0.5 mx-2 rounded-full transition-all duration-500",
                    step > s.id ? "bg-green-500" : "bg-gray-100"
                  )} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-bold animate-shake">
              {error}
            </div>
          )}

          {/* Step 1: Phone input */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="space-y-4">
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
                    <span className="text-gray-400">({t("common.required")})</span>
                  </label>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-gray-700 mb-2">
                    {t("auth.phone")} *
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
              </div>
            </div>
          )}

          {/* Step 2: Verification */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="text-center md:text-left mb-4">
                <h3 className="text-lg font-bold text-gray-900">{t("auth.verifyCode")}</h3>
                <p className="text-sm text-gray-500">
                  {t("auth.codeSent")} <span className="font-bold text-gray-900">{formData.phone}</span>
                </p>
              </div>

              <input
                id="smsCode"
                type="text"
                required
                value={formData.smsCode}
                onChange={(e) => setFormData({ ...formData, smsCode: e.target.value })}
                placeholder="······"
                className="w-full px-4 py-6 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all outline-none text-center text-4xl tracking-[0.5em] font-black"
                maxLength={6}
              />

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={handleVerifySMS}
                  disabled={loading}
                  className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-green-600/30 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? t("common.loading") : t("auth.verifyCode")}
                </button>
              </div>

              <button
                type="button"
                onClick={() => { setStep(1); setFormData({ ...formData, smsCode: "" }); }}
                className="w-full py-2 text-sm font-bold text-sky-600 hover:text-sky-800 transition-colors cursor-pointer text-center"
              >
                {t("auth.resendCode")}
              </button>
            </div>
          )}

          {/* Step 3: Profile info */}
          {step === 3 && (
            <form className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                    {t("auth.name")} *
                  </label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium"
                    placeholder="Иван Иванов"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    {t("auth.email")} ({t("common.optional")})
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium"
                    placeholder="email@example.com"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-2">
                      {t("auth.password")} *
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 mb-2">
                      {t("auth.confirmPassword")} *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all outline-none font-medium"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-4 border border-gray-200 text-gray-600 rounded-2xl font-bold hover:bg-gray-50 transition-all cursor-pointer"
                >
                  ←
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  {loading ? t("common.loading") : t("auth.register")}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Column: Visual Branding */}
      <div className="hidden md:block relative overflow-hidden bg-orange-500">
        <div 
          className="absolute inset-0 z-0 scale-110 hover:scale-100 transition-transform duration-1000"
          style={{
            backgroundImage: 'url(/hero-bg.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600/80 via-orange-500/40 to-sky-500/20 backdrop-blur-[1px]"></div>
        </div>
        
        <div className="relative z-10 h-full flex flex-col items-start justify-end p-16 lg:p-24 text-white">
          <div className="max-w-md space-y-6">
            <div className="w-16 h-1 bg-white rounded-full"></div>
            <h3 className="text-5xl lg:text-6xl font-black leading-tight tracking-tighter">
              {t("about.title")} <br/>
              <span className="text-orange-200">{t("about.subtitle")}</span>
            </h3>
            <p className="text-xl text-orange-50/90 leading-relaxed font-medium">
              {t("about.description1")}
            </p>
            
            <div className="flex items-center gap-4 pt-8">
              <div className="flex -space-x-3">
                {[5,6,7,8].map(i => (
                  <div key={i} className="w-12 h-12 rounded-full border-4 border-orange-600 bg-gray-200 overflow-hidden shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt="user" />
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-orange-100 tracking-wide uppercase">
                {t("about.stats.guests")}
              </p>
            </div>
          </div>
        </div>

        {/* Decorative SVG Pattern */}
        <div className="absolute bottom-0 left-0 p-12 opacity-10 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="50" y="50" width="300" height="300" rx="40" stroke="white" strokeWidth="4" />
            <rect x="100" y="100" width="200" height="200" rx="20" stroke="white" strokeWidth="2" />
          </svg>
        </div>
      </div>
    </div>
  );
}
