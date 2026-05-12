import { requireAdmin } from "@/lib/adminAccess";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getTranslations } from "next-intl/server";

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ role?: string; page?: string }>;
}) {
  const { locale } = await params;
  const { role: roleParam, page: pageParam } = await searchParams;
  const t = await getTranslations();
  await requireAdmin(locale);

  const role = roleParam || "all";
  const page = parseInt(pageParam || "1");
  const limit = 10;
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (role !== "all") {
    where.role = role;
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { bookings: true },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      subscriber: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-3 py-1 text-xs rounded-full ${styles[role] || "bg-gray-100 text-gray-800"}`}>
        {role}
      </span>
    );
  };

  return (
    <div>
       <h1 className="text-2xl font-bold mb-6">{t('admin.users.title')}</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex gap-2">
          {["all", "admin", "subscriber"].map((r) => (
            <Link
              key={r}
              href={`/${locale}/admin/users?role=${r}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                role === r
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
               {r === "all" ? t('admin.users.filters.all') : t(`admin.users.filters.${r}`)}
            </Link>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                 {t('admin.users.columns.name')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                 {t('admin.users.columns.email')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                 {t('admin.users.columns.role')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                 {t('admin.users.columns.bookings')}
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                 {t('admin.users.columns.registered')}
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                 {t('admin.users.columns.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {// eslint-disable-next-line @typescript-eslint/no-explicit-any
            users.map((user: any) => (
              <tr key={user.id} className="hover:bg-gray-50 cursor-pointer transition-colors duration-200">
                <td className="px-6 py-4">
                   <div className="font-medium text-gray-900">{user.name || t('admin.users.noName')}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.email}
                </td>
                <td className="px-6 py-4">
                  {getRoleBadge(user.role)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user._count.bookings}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(user.createdAt).toLocaleDateString("ru-RU")}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <button className="text-blue-600 hover:text-blue-900 cursor-pointer transition-colors duration-200 mr-4">
                     {t('admin.users.changeRole')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
             {t('admin.users.notFound')}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/admin/users?role=${role}&page=${p}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 ${
                page === p
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
