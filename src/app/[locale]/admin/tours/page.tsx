import { requireAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getTranslations } from "next-intl/server";

export default async function AdminToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  await requireAdmin(locale);

  const tours = await prisma.post.findMany({
    where: { type: "tour" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('tours.title')}</h1>
        <Link
          href={`/${locale}/admin/tours/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {t('tours.addNew')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tours.columns.title')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tours.columns.author')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tours.columns.price')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tours.columns.bookings')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tours.columns.status')}
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('tours.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {// eslint-disable-next-line @typescript-eslint/no-explicit-any
            tours.map((tour: any) => (
              <tr key={tour.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{tour.title}</div>
                  <div className="text-sm text-gray-500">{tour.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tour.author?.name || '—'}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  {tour.price} ₽
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {tour._count.bookings}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      tour.status === "publish"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {tour.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/${locale}/admin/tours/${tour.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer transition-colors duration-200"
                  >
                    {t('general.edit')}
                  </Link>
                  <DeleteButton id={tour.id} type="tours" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {tours.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {t('tours.empty.noTours')}
              <Link href={`/${locale}/admin/tours/new`} className="text-blue-600 hover:underline">
                {t('tours.empty.addFirst')}
              </Link>
            </div>
        )}
      </div>
    </div>
  );
}
