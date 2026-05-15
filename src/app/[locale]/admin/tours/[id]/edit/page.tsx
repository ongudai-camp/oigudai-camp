import { requireAdmin } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import TourForm from "@/components/admin/TourForm";
import { getTranslations } from "next-intl/server";

interface EditTourPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditTourPage({ params }: EditTourPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations({ locale, namespace: 'admin' });
  await requireAdmin(locale);

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
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/${locale}/admin/tours`}
          className="text-blue-600 hover:text-blue-800"
        >
          {t('general.backToList')}
        </Link>
        <h1 className="text-2xl font-bold">{t('tours.editTitle')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <TourForm users={users} tour={tour} />
      </div>
    </div>
  );
}
