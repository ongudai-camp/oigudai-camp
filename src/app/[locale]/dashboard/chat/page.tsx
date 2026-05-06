import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import ChatInterface from "@/components/chat/ChatInterface";

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const userId = parseInt((session.user as any).id);

  return (
    <div className="min-h-screen bg-[#f8fafc] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="md:w-64 bg-white rounded-xl shadow-lg p-6 sticky top-24">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl text-blue-600 font-bold">
                  {(session.user as any).name?.[0] || "U"}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{(session.user as any).name || "Пользователь"}</h3>
              <p className="text-sm text-gray-500">{(session.user as any).phone || (session.user as any).email}</p>
            </div>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <span>📋</span>
                <span className="font-medium">Мои бронирования</span>
              </Link>
              <Link
                href="/dashboard/profile"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer transition-all duration-200"
              >
                <span>👤</span>
                <span className="font-medium">Профиль</span>
              </Link>
              <Link
                href="/dashboard/chat"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-blue-50 text-blue-600 cursor-pointer transition-all duration-200"
              >
                <span>💬</span>
                <span className="font-medium">Чат поддержки</span>
              </Link>
            </nav>
          </aside>

          {/* Main Chat Area */}
          <main className="flex-1">
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden h-[calc(100vh-8rem)]">
              <ChatInterface userId={userId} isAdmin={false} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
