import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminChatPage({
  searchParams,
}: {
  searchParams: { userId?: string };
}) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    redirect("/dashboard");
  }

  const selectedUserId = searchParams.userId ? parseInt(searchParams.userId) : null;

  // Get all users who have chatted
  const usersWithChats = await prisma.$queryRaw<Array<{ userId: number; name: string | null; email: string | null; phone: string | null; lastMessage: string; lastMessageTime: Date }>>`
    SELECT DISTINCT 
      u.id as userId,
      u.name,
      u.email,
      u.phone,
      (
        SELECT content 
        FROM ChatMessage cm2 
        WHERE cm2.userId = u.id 
        ORDER BY cm2.createdAt DESC 
        LIMIT 1
      ) as lastMessage,
      (
        SELECT createdAt 
        FROM ChatMessage cm2 
        WHERE cm2.userId = u.id 
        ORDER BY cm2.createdAt DESC 
        LIMIT 1
      ) as lastMessageTime
    FROM User u
    INNER JOIN ChatMessage cm ON u.id = cm.userId
    ORDER BY lastMessageTime DESC
  `;

  // Get messages for selected user
  const messages = selectedUserId
    ? await prisma.chatMessage.findMany({
        where: { userId: selectedUserId },
        orderBy: { createdAt: "asc" },
      })
    : [];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Чат поддержки</h1>
      </div>

      <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        <div className="flex h-[calc(100vh-12rem)]">
          {/* Users List */}
          <div className="w-1/3 border-r border-gray-100 overflow-y-auto">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold">Пользователи</h2>
            </div>
            {usersWithChats.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Нет активных чатов
              </div>
            ) : (
              usersWithChats.map((chat) => (
                <Link
                  key={chat.userId}
                  href={`/admin/chat?userId=${chat.userId}`}
                  className={`block p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                    selectedUserId === chat.userId ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold">
                        {(chat.name?.[0] || "U").toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {chat.name || "Без имени"}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {chat.lastMessage || "Нет сообщений"}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedUserId ? (
              <>
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold">
                    {usersWithChats.find((u) => u.userId === selectedUserId)?.name || "Пользователь"}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {selectedUserId}
                  </p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                          msg.isFromUser
                            ? "bg-blue-100 text-blue-900"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            msg.isFromUser ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString("ru-RU", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <AdminChatInput userId={selectedUserId} />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Выберите пользователя для начала общения</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminChatInput({ userId }: { userId: number }) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          content: input,
          isFromUser: false, // Admin is sending
        }),
      });

      if (res.ok) {
        setInput("");
        // Refresh the page to show new message
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-gray-100 p-4">
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Введите сообщение..."
          rows={2}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {sending ? "..." : "Отправить"}
        </button>
      </div>
    </div>
  );
}
