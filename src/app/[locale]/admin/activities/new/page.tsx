import Link from "next/link";
import ActivityWizard from "@/components/admin/ActivityWizard";

export default async function NewActivityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Добавить новую активность</h1>
        <Link
          href={`/${locale}/admin/activities`}
          className="text-blue-600 hover:underline cursor-pointer transition-colors duration-200"
        >
          ← Назад к списку
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <ActivityWizard />
      </div>
    </div>
  );
}
