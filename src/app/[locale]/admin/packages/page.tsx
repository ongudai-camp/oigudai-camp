import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPackagesPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const packages = await prisma.package.findMany({
    orderBy: { price: "asc" },
    include: { _count: { select: { users: true } } },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Админ панель</h2>
            <nav className="space-y-2">
              <Link href="/admin" className="block px-4 py-2 rounded hover:bg-gray-50">
                Дашборд
              </Link>
              <Link href="/admin/hotels" className="block px-4 py-2 rounded hover:bg-gray-50">
                Отели
              </Link>
              <Link href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-50">
                Бронирования
              </Link>
              <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-50">
                Пользователи
              </Link>
              <Link href="/admin/packages" className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
                Пакеты
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Пакеты подписки</h1>
              <Link
                href="/admin/packages/new"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Добавить пакет
              </Link>
            </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {packages.map((pkg: any) => (
                <div key={pkg.id} className="bg-white rounded-lg shadow p-6 relative">
                  {pkg.featured && (
                    <span className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-2 py-1 text-xs rounded">
                      Популярный
                    </span>
                  )}
                  <h3 className="text-xl font-bold mb-2">{pkg.name}</h3>
                  <div className="mb-4">
                    <span className="text-3xl font-bold">{pkg.price} ₽</span>
                    <span className="text-gray-500"> / {pkg.duration} дн.</span>
                  </div>
                  <ul className="space-y-2 mb-6 text-sm">
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Лимит постов: {pkg.postsLimit === 0 ? "Безлимит" : pkg.postsLimit}
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Длительность: {pkg.duration} дней
                    </li>
                    <li className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      Активных пользователей: {pkg._count.users}
                    </li>
                  </ul>
                  <div className="flex gap-2">
                    <Link
                      href={`/admin/packages/${pkg.id}/edit`}
                      className="flex-1 text-center bg-blue-50 text-blue-600 py-2 rounded hover:bg-blue-100"
                    >
                      Редактировать
                    </Link>
                    <button className="flex-1 bg-red-50 text-red-600 py-2 rounded hover:bg-red-100">
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {packages.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                <p>Пакеты не созданы.</p>
                <Link href="/admin/packages/new" className="text-blue-600 hover:underline">
                  Создать первый пакет
                </Link>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
