import { requireAdmin } from "@/lib/adminAccess";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import BookingStatsCards from "@/components/admin/dashboard/BookingStatsCards";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";
import DashboardCharts from "@/components/admin/dashboard/DashboardCharts";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  await requireAdmin(locale);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-sky-950 mb-2">{t('dashboard.title')}</h1>
        <p className="text-sky-600 font-medium">{t('dashboard.welcome')}</p>
      </div>

      <BookingStatsCards />
      <StatsCards />
      <DashboardCharts />
      <RecentBookings />
    </div>
  );
}
