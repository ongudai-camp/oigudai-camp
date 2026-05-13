import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("privacy");

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-24 pb-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold text-[#5000FF] mb-3">{t("content.p1_title")}</h2>
              <p>{t("content.p1_text")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#5000FF] mb-3">{t("content.p2_title")}</h2>
              <p>{t("content.p2_text")}</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-[#5000FF] mb-3">{t("content.p3_title")}</h2>
              <p>{t("content.p3_text")}</p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium">{t("content.contact")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
