"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ReviewsList, { type Review } from "./ReviewsList";
import ReviewForm from "./ReviewForm";

interface ReviewSectionProps {
  postId: number;
  reviews: Review[];
}

export default function ReviewSection({ postId, reviews }: ReviewSectionProps) {
  const t = useTranslations("reviews");
  const tc = useTranslations("common");
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white/50 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-indigo-700">
          {tc("reviews")} ({reviews.length})
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-sky-950 hover:bg-sky-900 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          {showForm ? t("cancelReview") : t("writeReview")}
        </button>
      </div>

      {showForm && (
        <div className="mb-8">
          <ReviewForm
            postId={postId}
            onSuccess={() => {
              setShowForm(false);
              router.refresh();
            }}
          />
        </div>
      )}

      <ReviewsList reviews={reviews} />
    </div>
  );
}