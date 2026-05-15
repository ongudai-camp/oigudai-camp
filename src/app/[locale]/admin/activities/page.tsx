import { requireAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DeleteButton from "@/components/admin/DeleteButton";
import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";

export default async function AdminActivitiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  await requireAdmin(locale);

  const activities = await prisma.post.findMany({
    where: { type: "activity" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('admin.activities.title')}</h1>
        <Link
          href={`/${locale}/admin/activities/new`}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {t('admin.activities.addNew')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('admin.activities.columns.title')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('admin.activities.columns.location')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('admin.activities.columns.price')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('admin.activities.columns.bookings')}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('admin.activities.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity: Prisma.PostGetPayload<{ include: { author: true; _count: { select: { bookings: true } } } }>) => (
              <tr key={activity.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{activity.title}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {activity.address}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 tabular-nums">
                  {activity.price} ₽
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 tabular-nums">
                  {activity._count.bookings}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/${locale}/admin/activities/${activity.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer transition-colors duration-200"
                  >
                    {t('admin.general.edit')}
                  </Link>
                  <DeleteButton id={activity.id} type="activities" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>

        {activities.length === 0 && (
          <div className="text-center py-8 text-gray-900">
            {t('admin.activities.empty.noActivities')}{' '}
            <Link href={`/${locale}/admin/activities/new`} className="text-blue-600 hover:underline">
              {t('admin.activities.empty.addFirst')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
