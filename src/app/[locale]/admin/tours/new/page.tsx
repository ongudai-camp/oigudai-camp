import Link from "next/link";
import TourWizard from "@/components/admin/TourWizard";
import { getTranslations } from "next-intl/server";

export default async function NewTourPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('tours.newTitle')}</h1>
        <Link
          href={`/${locale}/admin/tours`}
          className="text-blue-600 hover:underline cursor-pointer transition-colors duration-200"
        >
          {t('general.backToList')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <TourWizard />
      </div>
    </div>
  );
}
