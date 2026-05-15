'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area,
} from 'recharts';

interface DayData {
  date: string;
  count: number;
  revenue: number;
}

interface UserDayData {
  date: string;
  count: number;
}

interface TimeseriesData {
  bookingsByDay: DayData[];
  usersByDay: UserDayData[];
}

export default function DashboardCharts() {
  const { data, isLoading, error } = useQuery<TimeseriesData>({
    queryKey: ['admin-stats-timeseries'],
    queryFn: async () => {
      const res = await fetch('/api/admin/stats/timeseries?days=30');
      if (!res.ok) throw new Error('Failed to fetch timeseries');
      return res.json();
    },
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 animate-pulse">
            <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-red-500">Ошибка загрузки графиков</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bookings Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Бронирования по дням
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data?.bookingsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#1A2B48' }}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis tick={{ fontSize: 11, fill: '#1A2B48' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #BAE6FD',
                fontSize: '13px',
              }}
            />
            <Bar dataKey="count" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Line Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Выручка по дням
        </h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data?.bookingsByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#1A2B48' }}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#1A2B48' }}
              tickFormatter={(val: number) => `${(val / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #BAE6FD',
                fontSize: '13px',
              }}
              formatter={(value) => [`${Number(value).toLocaleString()} ₽`, 'Выручка']}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#F97316"
              strokeWidth={2}
              dot={{ fill: '#F97316', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* User Growth Area Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-sky-100 p-6 hover:shadow-md transition-shadow lg:col-span-2">
        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
          Регистрации пользователей
        </h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data?.usersByDay}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#1A2B48' }}
              tickFormatter={(val: string) => val.slice(5)}
            />
            <YAxis tick={{ fontSize: 11, fill: '#1A2B48' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid #BAE6FD',
                fontSize: '13px',
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#8B5CF6"
              fill="#8B5CF6"
              fillOpacity={0.15}
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
