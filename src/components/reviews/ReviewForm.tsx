"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Star, Send, Loader2, LogIn } from "lucide-react";

interface ReviewFormProps {
  postId: number;
  onSuccess: () => void;
}

const CATEGORIES = [
  { key: "cleanliness" },
  { key: "location" },
  { key: "staff" },
  { key: "value" },
  { key: "facilities" },
] as const;

export default function ReviewForm({ postId, onSuccess }: ReviewFormProps) {
  const t = useTranslations("reviews");
  const { data: session } = useSession();
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!session) {
    return (
      <button
        onClick={() => router.push(window.location.pathname.replace(/\/(ru|en|kk)\//, "/$1/auth/signin?callbackUrl=") + window.location.pathname)}
        className="w-full bg-white border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer"
      >
        <LogIn size={24} className="mx-auto text-gray-300 mb-2" />
        <p className="text-sm font-bold text-gray-500">{t("signInToReview")}</p>
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError(t("pleaseSelectRating"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          rating,
          cleanliness: scores.cleanliness || null,
          location: scores.location || null,
          staff: scores.staff || null,
          value: scores.value || null,
          facilities: scores.facilities || null,
          title,
          content,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit review");
      }

      onSuccess();
      setRating(0);
      setScores({});
      setTitle("");
      setContent("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
      <h3 className="font-bold text-gray-900">{t("writeReview")}</h3>

      <div>
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">{t("overallRating")}</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 cursor-pointer"
            >
              <Star
                size={24}
                className={`transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-gray-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATEGORIES.map((cat) => (
          <div key={cat.key}>
            <label className="text-[11px] font-bold text-gray-500 mb-1 block">{t(`categories.${cat.key}`)}</label>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setScores((prev) => ({ ...prev, [cat.key]: star }))}
                  className="p-0 cursor-pointer"
                >
                  <Star
                    size={14}
                    className={`transition-colors ${
                      star <= (scores[cat.key] || 0) ? "fill-amber-400 text-amber-400" : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t("titlePlaceholder")}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-gray-400 transition-all"
        />
      </div>

      <div>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t("contentPlaceholder")}
          rows={3}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-gray-400 transition-all resize-none"
          required
        />
      </div>

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full bg-sky-950 hover:bg-sky-900 text-white py-3 rounded-xl text-sm font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <Send size={16} />
        )}
        {loading ? t("submitting") : t("submitReview")}
      </button>
    </form>
  );
}
