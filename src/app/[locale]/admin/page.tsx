import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import StatsCards from "@/components/admin/dashboard/StatsCards";
import RecentBookings from "@/components/admin/dashboard/RecentBookings";

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

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
