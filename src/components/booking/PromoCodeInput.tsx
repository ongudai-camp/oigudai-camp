"use client";

import { useState } from "react";
import { Percent, Check, X } from "lucide-react";

interface PromoCodeInputProps {
  total: number;
  onApply: (code: string, discount: number) => void;
  onRemove: () => void;
  appliedCode: string | null;
  discount: number;
}

export default function PromoCodeInput({ total, onApply, onRemove, appliedCode, discount }: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), total }),
      });
      const data = await res.json();
      if (!data.valid) {
        setError(data.message || "Invalid promo code");
        return;
      }
      onApply(code.trim(), data.discountAmount);
    } catch {
      setError("Failed to validate code");
    } finally {
      setLoading(false);
    }
  };

  if (appliedCode) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Check size={16} className="text-emerald-600" />
          <span className="text-sm font-bold text-emerald-700">{appliedCode}</span>
          <span className="text-xs text-emerald-600">(-{discount.toLocaleString()} ₽)</span>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="p-1 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
        >
          <X size={14} className="text-emerald-600" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
        <Percent size={12} /> Promo code
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
          placeholder="Enter code"
          className="flex-1 border border-gray-200 rounded-2xl px-5 py-3 text-sm font-medium outline-none focus:border-gray-400 focus:ring-4 focus:ring-gray-100 transition-all uppercase"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-5 py-3 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl text-sm font-bold transition-all disabled:opacity-40 cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
          ) : (
            "Apply"
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
