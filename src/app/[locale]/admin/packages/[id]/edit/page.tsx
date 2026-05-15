import { requireAdmin } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import PackageForm from "@/components/admin/PackageForm";
import { getTranslations } from "next-intl/server";

interface EditPackagePageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditPackagePage({ params }: EditPackagePageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  await requireAdmin(locale);

  const packageId = parseInt(id);
  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
  });

  if (!pkg) {
    redirect(`/${locale}/admin/packages`);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('packages.editTitle')}</h1>
        <Link
          href={`/${locale}/admin/packages`}
          className="text-blue-600 hover:underline cursor-pointer transition-colors duration-200"
        >
          {t('general.backToList')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <PackageForm
          initialData={{
            id: pkg.id,
            name: pkg.name,
            price: pkg.price,
            duration: pkg.duration,
            postsLimit: pkg.postsLimit,
            featured: pkg.featured,
          }}
        />
      </div>
    </div>
  );
}
