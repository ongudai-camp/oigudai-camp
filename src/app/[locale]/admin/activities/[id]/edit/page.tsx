import { requireAdmin } from "@/lib/adminAccess";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import ActivityForm from "@/components/admin/ActivityForm";
import { getTranslations } from "next-intl/server";

interface EditActivityPageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default async function EditActivityPage({ params }: EditActivityPageProps) {
  const { id, locale } = await params;
  const t = await getTranslations('admin');
  await requireAdmin(locale);

  const activityId = parseInt(id);
  const activity = await prisma.post.findUnique({
    where: { id: activityId, type: "activity" },
    include: { author: true },
  });

  if (!activity) {
    redirect(`/${locale}/admin/activities`);
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/${locale}/admin/activities`}
          className="text-blue-600 hover:text-blue-800"
        >
          {t('general.backToList')}
        </Link>
        <h1 className="text-2xl font-bold">{t('activities.editTitle')}</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <ActivityForm users={users} activity={activity} />
      </div>
    </div>
  );
}
