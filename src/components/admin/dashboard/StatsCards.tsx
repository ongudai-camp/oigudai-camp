'use client';

import { useQuery } from '@tanstack/react-query';

interface Stats {
  hotels: number;
  tours: number;
  activities: number;
  bookings: number;
  users: number;
}

export default function StatsCards() {
  const { data, isLoading, error } = useQuery<Stats>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats');
      if (!res.ok) throw new Error('Failed to fetch stats');
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const stats = [
    { label: 'Отели', value: data?.hotels, color: 'sky', icon: '🏨' },
    { label: 'Туры', value: data?.tours, color: 'blue', icon: '🗺️' },
    { label: 'Активности', value: data?.activities, color: 'indigo', icon: '🎯' },
    { label: 'Бронирования', value: data?.bookings, color: 'orange', icon: '📋' },
    { label: 'Пользователи', value: data?.users, color: 'rose', icon: '👥' },
  ];

  if (isLoading) {
    return (
      <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-8'>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className='bg-white rounded-xl shadow-sm border border-sky-100 p-6 animate-pulse'>
            <div className='h-8 w-8 bg-gray-200 rounded mb-4'></div>
            <div className='h-8 w-16 bg-gray-200 rounded'></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) return <div className='p-4 text-red-500'>Error loading stats</div>;

  return (
    <div className='grid grid-cols-1 md:grid-cols-5 gap-4 mb-8'>
      {stats.map((stat) => (
        <div 
          key={stat.label} 
          className='bg-white rounded-xl shadow-sm border border-sky-100 hover:border-sky-300 hover:shadow-md transition-shadow duration-300 p-6 cursor-pointer group'
        >
          <div className='flex items-center justify-between mb-4'>
            <span className='text-2xl group-hover:scale-110 transition-transform duration-300' aria-hidden="true">{stat.icon}</span>
            <span className={`text-3xl font-bold text-sky-600`}>{stat.value}</span>
          </div>
          <h3 className='text-[#1A2B48] text-sm font-medium'>{stat.label}</h3>
        </div>
      ))}
    </div>
  );
}
