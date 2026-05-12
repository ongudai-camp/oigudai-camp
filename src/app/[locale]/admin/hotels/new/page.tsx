import Link from "next/link";
import HotelWizard from "@/components/admin/HotelWizard";

export default async function NewHotelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Добавить новый отель</h1>
        <Link
          href={`/${locale}/admin/hotels`}
          className="text-blue-600 hover:underline cursor-pointer transition-colors duration-200"
        >
          ← Назад к списку
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <HotelWizard />
      </div>
    </div>
  );
}
