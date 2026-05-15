import Link from "next/link";
import PackageForm from "@/components/admin/PackageForm";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/adminAccess";

export default async function NewPackagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);
  const t = await getTranslations({ locale, namespace: 'admin' });
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('packages.newTitle')}</h1>
        <Link
          href={`/${locale}/admin/packages`}
          className="text-blue-600 hover:underline cursor-pointer transition-colors duration-200"
        >
          {t('general.backToList')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <PackageForm />
      </div>
    </div>
  );
}
