import { requireAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ru, enUS, kk } from "date-fns/locale";
import DeleteButton from "@/components/admin/DeleteButton";
import { getTranslations } from "next-intl/server";

export default async function AdminHotelsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('admin');
  await requireAdmin(locale);

  const dateLocale = locale === "ru" ? ru : locale === "kk" ? kk : enUS;

  const hotels = await prisma.post.findMany({
    where: { type: "hotel" },
    orderBy: { createdAt: "desc" },
    include: { author: true, _count: { select: { bookings: true, rooms: true } } },
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('hotels.title')}</h1>
        <Link
          href={`/${locale}/admin/hotels/new`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          {t('hotels.addNew')}
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.title')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.author')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.price')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.rooms')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.bookings')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.status')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.date')}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                {t('hotels.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {hotels.map((hotel: any) => (
              <tr key={hotel.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{hotel.title}</div>
                  <div className="text-sm text-gray-900">{hotel.address}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {hotel.author?.name || t('hotels.statusUnknown')}
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900 tabular-nums">
                  {hotel.price} ₽
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 tabular-nums">
                  {hotel._count.rooms}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 tabular-nums">
                  {hotel._count.bookings}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      hotel.status === "publish"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {hotel.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {format(new Date(hotel.createdAt), "dd MMM yyyy", { locale: dateLocale })}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link
                    href={`/${locale}/admin/hotels/${hotel.id}/edit`}
                    className="text-blue-600 hover:text-blue-900 mr-4 cursor-pointer transition-colors duration-200"
                  >
                    {t('general.edit')}
                  </Link>
                  <DeleteButton id={hotel.id} type="hotels" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {hotels.length === 0 && (
          <div className="text-center py-8 text-gray-900">
            {t('hotels.empty.noHotels')}
            <Link href={`/${locale}/admin/hotels/new`} className="text-blue-600 hover:underline">
              {t('hotels.empty.addFirst')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
