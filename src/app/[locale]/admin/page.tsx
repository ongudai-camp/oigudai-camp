import { requireAdmin } from "@/lib/adminAccess";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-sky-950 mb-2">Обзор системы</h1>
        <p className="text-sky-600 font-medium">Добро пожаловать в панель управления Ongudai Camp</p>
      </div>

      <StatsCards />
      <RecentBookings />
    </div>
  );
}
