import { useTranslations } from "next-intl";

export default function AboutPage() {
  const t = useTranslations("about");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gray-800">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("title")}</h1>
          <p className="text-xl">{t("subtitle")}</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">{t("welcome")}</h2>
            <p className="text-gray-900 mb-6 text-lg">
              {t("description1")}
            </p>
            <p className="text-gray-900 mb-6 text-lg">
              {t("description2")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-900">{t("stats.hotels")}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100+</div>
                <div className="text-gray-900">{t("stats.tours")}</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">10,000+</div>
                <div className="text-gray-900">{t("stats.guests")}</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
