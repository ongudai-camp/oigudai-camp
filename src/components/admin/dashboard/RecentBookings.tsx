'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useTranslations } from 'next-intl';

export default function RecentBookings() {
  const t = useTranslations('admin');

  const { data, isLoading, error } = useQuery({
    queryKey: ['recent-bookings'],
    queryFn: async () => {
      const res = await fetch('/api/admin/bookings?limit=5');
      if (!res.ok) throw new Error('Failed to fetch bookings');
      return res.json();
    },
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-sky-100 p-6 animate-pulse'>
        <div className='h-6 w-48 bg-gray-200 rounded mb-6'></div>
        <div className='space-y-4'>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className='h-12 bg-gray-100 rounded'></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) return <div className='p-4 text-red-500'>{t('dashboard.errorLoad')}</div>;

  const bookings = data?.bookings || [];

  return (
    <div className='bg-white rounded-xl shadow-sm border border-sky-100 hover:shadow-md transition-shadow duration-300 p-6'>
      <h2 className='text-xl font-semibold mb-4 text-sky-950'>{t('dashboard.recentBookings')}</h2>

      {bookings.length === 0 ? (
        <p className='text-gray-900 text-center py-8'>{t('dashboard.bookingsEmpty')}</p>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-sky-50'>
                <th className='text-left py-3 px-4 text-xs font-medium text-sky-600 uppercase tracking-wider'>{t('dashboard.columns.id')}</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-sky-600 uppercase tracking-wider'>{t('dashboard.columns.object')}</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-sky-600 uppercase tracking-wider'>{t('dashboard.columns.user')}</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-sky-600 uppercase tracking-wider'>{t('dashboard.columns.date')}</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-sky-600 uppercase tracking-wider'>{t('dashboard.columns.amount')}</th>
                <th className='text-left py-3 px-4 text-xs font-medium text-sky-600 uppercase tracking-wider'>{t('dashboard.columns.status')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-sky-50'>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {bookings.map((booking: any) => (
                <tr key={booking.id} className='hover:bg-sky-50/50 cursor-pointer transition-colors duration-200 group'>
                  <td className='py-4 px-4 text-sm text-sky-800 font-mono'>{booking.bookingId}</td>
                  <td className='py-4 px-4 font-medium text-sky-950'>{booking.post.title}</td>
                  <td className='py-4 px-4 text-sm text-sky-700'>{booking.user.name || booking.user.email}</td>
                  <td className='py-4 px-4 text-sm text-sky-600'>
                    {format(new Date(booking.checkIn), 'dd MMM yyyy', { locale: ru })}
                  </td>
                  <td className='py-4 px-4 font-semibold text-sky-950'>{booking.totalPrice} ₽</td>
                  <td className='py-4 px-4'>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
