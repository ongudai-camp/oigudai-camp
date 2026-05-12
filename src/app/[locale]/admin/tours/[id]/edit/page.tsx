import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import TourForm from "@/components/admin/TourForm";

interface EditTourPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditTourPage({ params }: EditTourPageProps) {
  const { id, locale } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    redirect(`/${locale}/dashboard`);
  }

  const tourId = parseInt(id);
  const tour = await prisma.post.findUnique({
    where: { id: tourId, type: "tour" },
    include: { meta: true, author: true },
  });

  if (!tour) {
    redirect(`/${locale}/admin/tours`);
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          <aside className="md:w-64 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-6">Админ панель</h2>
            <nav className="space-y-2">
              <Link href={`/${locale}/admin`} className="block px-4 py-2 rounded hover:bg-gray-50">
                Дашборд
              </Link>
              <Link href={`/${locale}/admin/hotels`} className="block px-4 py-2 rounded hover:bg-gray-50">
                Отели
              </Link>
              <Link href={`/${locale}/admin/tours`} className="block px-4 py-2 rounded bg-blue-50 text-blue-600">
                Туры
              </Link>
              <Link href={`/${locale}/admin/bookings`} className="block px-4 py-2 rounded hover:bg-gray-50">
                Бронирования
              </Link>
              <Link href={`/${locale}/admin/users`} className="block px-4 py-2 rounded hover:bg-gray-50">
                Пользователи
              </Link>
            </nav>
          </aside>

          <main className="flex-1">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href={`/${locale}/admin/tours`}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Назад к списку
              </Link>
              <h1 className="text-2xl font-bold">Редактировать тур</h1>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <TourForm users={users} tour={tour} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
