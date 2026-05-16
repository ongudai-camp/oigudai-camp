"use client";

import { useState } from "react";
import { X, Phone, CheckCircle2, AlertCircle } from "lucide-react";

interface VerifyPhoneModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerifyPhoneModal({ onClose, onSuccess }: VerifyPhoneModalProps) {
  const [step, setStep] = useState(1);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSendSms = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/send-verify-sms", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.error || "Failed to send SMS");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/user/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess();
      } else {
        setError(data.error || "Invalid code");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Подтверждение телефона</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-all cursor-pointer">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              <p className="text-gray-600 text-sm text-center">
                Мы отправим СМС с 6-значным кодом подтверждения на ваш номер телефона.
              </p>
              <button
                onClick={handleSendSms}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Отправка...
                  </span>
                ) : (
                  "Получить код по СМС"
                )}
              </button>
            </div>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Код из СМС</label>
                <input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-center text-2xl font-bold tracking-[0.5em] text-gray-900"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-all cursor-pointer"
                >
                  Назад
                </button>
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="flex-[2] py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-100 cursor-pointer active:scale-[0.98]"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Проверка...
                    </span>
                  ) : (
                    "Подтвердить"
                  )}
                </button>
              </div>
              <p className="text-center">
                <button 
                  type="button"
                  onClick={handleSendSms}
                  className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                >
                  Отправить код еще раз
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
