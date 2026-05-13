import { requireAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeletePackageButton from "./DeletePackageButton";
import { getTranslations } from "next-intl/server";

export default async function AdminPackagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  await requireAdmin(locale);

  const packages = await prisma.package.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { userPackages: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('packages.title')}</h1>
        <Link
          href={`/${locale}/admin/packages/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {t('packages.addNew')}
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {packages.map((pkg: any) => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 relative hover:shadow-md transition-shadow">
            {pkg.featured && (
              <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 text-xs rounded-full font-medium">
                {t('packages.featured')}
              </span>
            )}
            <h3 className="text-xl font-bold mb-2 text-sky-950">{pkg.name}</h3>
            <div className="mb-4">
              <span className="text-3xl font-bold text-sky-950">{pkg.price} ₽</span>
              <span className="text-[#1A2B48]"> / {t('packages.duration', { duration: pkg.duration })}</span>
            </div>
            <ul className="space-y-2 mb-6 text-sm">
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                {t('packages.postsLimit', { postsLimit: pkg.postsLimit === 0 ? t('packages.unlimited') : pkg.postsLimit })}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                {t('packages.duration', { duration: pkg.duration })}
              </li>
              <li className="flex items-center text-gray-700">
                <span className="text-green-500 mr-2">✓</span>
                {t('packages.activeUsers', { count: pkg._count.userPackages })}
              </li>
            </ul>
            <div className="flex gap-2">
              <Link
                href={`/${locale}/admin/packages/${pkg.id}/edit`}
                className="flex-1 text-center bg-blue-50 text-blue-600 py-2 rounded-lg hover:bg-blue-100 font-medium transition-colors"
              >
                {t('packages.edit')}
              </Link>
              <DeletePackageButton id={pkg.id} />
            </div>
          </div>
        ))}
      </div>

      {packages.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-12 text-center text-[#1A2B48]">
          <p className="text-lg mb-4">{t('packages.noPackages')}</p>
          <Link
            href={`/${locale}/admin/packages/new`}
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
          >
            {t('packages.createFirst')}
          </Link>
        </div>
      )}
    </div>
  );
}
