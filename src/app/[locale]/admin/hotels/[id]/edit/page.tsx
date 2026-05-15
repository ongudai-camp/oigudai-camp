import { requireAdmin } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import HotelForm from "@/components/admin/HotelForm";
import { getTranslations } from "next-intl/server";

interface EditHotelPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditHotelPage({ params }: EditHotelPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  await requireAdmin(locale);

  const hotelId = parseInt(id);
  const hotel = await prisma.post.findUnique({
    where: { id: hotelId, type: "hotel" },
    include: { rooms: true, author: true },
  });

  if (!hotel) {
    redirect(`/${locale}/admin/hotels`);
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/${locale}/admin/hotels`}
          className="text-blue-600 hover:text-blue-800"
        >
          {t('general.backToList')}
        </Link>
        <h1 className="text-2xl font-bold">{t('hotels.editTitle')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <HotelForm users={users} hotel={hotel} />
      </div>
    </div>
  );
}
