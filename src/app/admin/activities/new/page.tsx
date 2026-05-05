import ActivityWizard from "@/components/admin/ActivityWizard";

export default function NewActivityPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Добавить новую активность</h1>
        <a
          href="/admin/activities"
          className="text-blue-600 hover:underline cursor-pointer transition-colors duration-200"
        >
          ← Назад к списку
        </a>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <ActivityWizard />
      </div>
    </div>
  );
}
