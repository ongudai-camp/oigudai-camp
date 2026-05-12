import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function ToursPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { locale } = await params;
  const { q, minPrice, maxPrice } = await searchParams;
  const t = await getTranslations("listing");
  const tc = await getTranslations("common");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    type: "tour",
    status: "publish",
    locale,
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { address: { contains: q, mode: "insensitive" } },
    ];
  }

  if (minPrice) {
    where.price = { gte: parseFloat(minPrice) };
  }

  if (maxPrice) {
    where.price = { ...where.price, lte: parseFloat(maxPrice) };
  }

  const tours = await prisma.post.findMany({
    where,
    orderBy: { price: "asc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">{t("toursTitle")}</h1>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("search")}
              </label>
              <input
                type="text"
                name="q"
                placeholder={t("searchPlaceholder")}
                defaultValue={q}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("priceFrom")}
              </label>
              <input
                type="number"
                name="minPrice"
                placeholder="0"
                defaultValue={minPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("priceTo")}
              </label>
              <input
                type="number"
                name="maxPrice"
                placeholder="50000"
                defaultValue={maxPrice}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                {t("find")}
              </button>
            </div>
          </form>
        </div>

        {/* Tours Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {tours.map((tour: any) => (
            <div key={tour.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
              <div className="h-48 bg-gray-300 relative">
                {tour.featuredImage && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tour.featuredImage}
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                )}
                {tour.salePrice && (
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-1 text-xs rounded">
                    {tc("discount")}
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-semibold">{tour.title}</h3>
                  <div className="flex items-center">
                    <span className="text-yellow-500">★</span>
                    <span className="ml-1 text-sm">{tour.rating || tc("noRating")}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-4">{tour.address}</p>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-blue-600">
                      {tour.salePrice || tour.price} ₽
                    </span>
                    {tour.salePrice && (
                      <span className="ml-2 text-sm text-gray-500 line-through">
                        {tour.price} ₽
                      </span>
                    )}
                    <span className="text-gray-500 text-sm"> / {tc("perPerson")}</span>
                  </div>
                  <Link
                    href={`/${locale}/tours/${tour.slug}`}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    {tc("details")}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {tours.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">{t("noResults")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
