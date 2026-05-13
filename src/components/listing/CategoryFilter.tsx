"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
  translations: {
    all: string;
    categories: string;
  };
}

export default function CategoryFilter({ translations }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch categories");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCategories(data);
      })
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryClick = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category) {
      params.set("category", category);
    } else {
      params.delete("category");
    }
    router.push(`?${params.toString()}`);
  };

  if (loading || categories.length === 0 || fetchError) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-sky-700 uppercase tracking-wider">
        {translations.categories}
      </h3>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => handleCategoryClick(null)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
            !currentCategory
              ? "bg-sky-950 text-white shadow-lg shadow-sky-950/20"
              : "bg-white text-sky-950 hover:bg-sky-50 border border-sky-200"
          }`}
        >
          {translations.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              currentCategory === cat
                ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                : "bg-white text-sky-950 hover:bg-sky-50 border border-sky-200"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}
