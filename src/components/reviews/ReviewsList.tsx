"use client";

import { useTranslations } from "next-intl";
import { Star, User, BadgeCheck } from "lucide-react";

export interface ReviewUser {
  name: string | null;
  image: string | null;
}

export interface Review {
  id: number;
  rating: number;
  cleanliness: number | null;
  location: number | null;
  staff: number | null;
  value: number | null;
  facilities: number | null;
  title: string | null;
  content: string | null;
  verified: boolean;
  createdAt: string;
  user: ReviewUser;
}

interface ReviewsListProps {
  reviews: Review[];
}

function RatingBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-20 text-gray-500 font-medium">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-amber-400 rounded-full" style={{ width: `${(score / 5) * 100}%` }} />
      </div>
      <span className="w-4 text-right font-bold text-gray-700">{score}</span>
    </div>
  );
}

export default function ReviewsList({ reviews }: ReviewsListProps) {
  const t = useTranslations("reviews");

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <Star size={40} className="mx-auto text-gray-200 mb-3" />
        <p className="text-gray-400 text-sm font-medium">{t("noReviews")}</p>
      </div>
    );
  }

  const avgBreakdown = {
    cleanliness: reviews.reduce((s, r) => s + (r.cleanliness || 0), 0) / reviews.filter((r) => r.cleanliness).length,
    location: reviews.reduce((s, r) => s + (r.location || 0), 0) / reviews.filter((r) => r.location).length,
    staff: reviews.reduce((s, r) => s + (r.staff || 0), 0) / reviews.filter((r) => r.staff).length,
    value: reviews.reduce((s, r) => s + (r.value || 0), 0) / reviews.filter((r) => r.value).length,
    facilities: reviews.reduce((s, r) => s + (r.facilities || 0), 0) / reviews.filter((r) => r.facilities).length,
  };

  const avgOverall = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;

  const catKeys = ["cleanliness", "location", "staff", "value", "facilities"] as const;

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl font-black text-gray-900">{avgOverall.toFixed(1)}</div>
          <div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} size={16} className={s <= Math.round(avgOverall) ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{t("reviewCount", { count: reviews.length })}</p>
          </div>
        </div>
        <div className="space-y-2">
          {catKeys.map((key) => (
            <RatingBar key={key} label={t(`categories.${key}`)} score={Math.round(avgBreakdown[key] * 10) / 10} />
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                  {review.user.image ? (
                    <img src={review.user.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={18} className="text-gray-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-gray-900">{review.user.name || t("anonymous")}</span>
                    {review.verified && (
                      <BadgeCheck size={14} className="text-blue-500" />
                    )}
                  </div>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                </div>
              </div>
              <span className="text-[11px] text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
            </div>

            {review.title && <h4 className="font-bold text-sm text-gray-900 mb-1">{review.title}</h4>}
            {review.content && <p className="text-sm text-gray-600 leading-relaxed">{review.content}</p>}

            {review.cleanliness && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 pt-3 border-t border-gray-50">
                {catKeys.filter((k) => review[k]).map((k) => (
                  <span key={k} className="text-[11px] text-gray-500">
                    {t(`categories.${k}`)}: <span className="font-bold text-gray-700">{review[k]}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}