import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { isSuperAdmin } from "@/lib/adminAccess";

export default async function SuperAdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user || !isSuperAdmin(session.user.role)) {
    redirect(`/${locale}/dashboard`);
  }

  const [
    totalUsers,
    totalAdmins,
    totalPosts,
    totalBookings,
    totalPackages,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["admin", "superadmin"] } } }),
    prisma.post.count(),
    prisma.booking.count(),
    prisma.package.count(),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    }),
  ]);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight">SuperAdmin</h1>
            <p className="text-gray-900 mt-1">Панель управления системой</p>
          </div>
          <Link
            href={`/${locale}/admin`}
            className="px-4 py-2 bg-gray-800 rounded-xl text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            ← Admin Panel
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard label="Пользователей" value={totalUsers} color="blue" />
          <StatCard label="Администраторов" value={totalAdmins} color="emerald" />
          <StatCard label="Объектов" value={totalPosts} color="amber" />
          <StatCard label="Бронирований" value={totalBookings} color="violet" />
          <StatCard label="Пакетов" value={totalPackages} color="rose" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h2 className="text-lg font-bold mb-4">Новые пользователи</h2>
            <div className="space-y-3">
              {recentUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="font-medium">{user.name || "Без имени"}</div>
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    user.role === "superadmin" ? "bg-purple-900 text-purple-300" :
                    user.role === "admin" ? "bg-emerald-900 text-emerald-500" :
                    "bg-gray-800 text-gray-500"
                  }`}>
                    {user.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800 space-y-4">
            <h2 className="text-lg font-bold">Управление</h2>
            <Link
              href={`/${locale}/admin/users`}
              className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <span>Пользователи</span>
              <span className="text-gray-900">→</span>
            </Link>
            <Link
              href={`/${locale}/admin/packages`}
              className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <span>Пакеты</span>
              <span className="text-gray-900">→</span>
            </Link>
            <Link
              href={`/${locale}/admin/settings/meta`}
              className="flex items-center justify-between w-full p-4 bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors"
            >
              <span>Настройки</span>
              <span className="text-gray-900">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: "from-blue-500 to-blue-600",
    emerald: "from-emerald-500 to-emerald-600",
    amber: "from-amber-500 to-amber-600",
    violet: "from-violet-500 to-violet-600",
    rose: "from-rose-500 to-rose-600",
  };

  return (
    <div className="bg-gray-900 rounded-2xl p-5 border border-gray-800">
      <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${colors[color] || colors.blue} mb-4`} />
      <div className="text-3xl font-black">{value}</div>
      <div className="text-sm text-gray-900 mt-1">{label}</div>
    </div>
  );
}
