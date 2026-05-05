import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HotelForm from "@/components/admin/HotelForm";

export default async function NewHotelPage() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  // Get all users for author selection
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  // Cast to match HotelForm type requirement
  const formattedUsers = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email || "",
  }));

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
              <Link href="/admin/hotels" className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
                Отели
              </Link>
              <Link href="/admin/bookings" className="block px-4 py-2 rounded hover:bg-gray-50">
                Бронирования
              </Link>
              <Link href="/admin/users" className="block px-4 py-2 rounded hover:bg-gray-50">
                Пользователи
              </Link>
              <Link href="/admin/packages" className="block px-4 py-2 rounded hover:bg-gray-50">
                Пакеты
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Добавить новый отель</h1>
              <a
                href="/admin/hotels"
                className="text-blue-600 hover:underline"
              >
                ← Назад к списку
              </a>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <HotelForm users={formattedUsers as any} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

function Link({ href, children, className }: any) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}
