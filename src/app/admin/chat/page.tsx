"use client";

import { auth } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { useState, useEffect } from "react";

export default function AdminChatPage({
  searchParams,
}: {
  searchParams: { userId?: string };
}) {
  const [usersWithChats, setUsersWithChats] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(
    searchParams.userId ? parseInt(searchParams.userId) : null
  );
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    } else {
      setMessages([]);
    }
  }, [selectedUserId]);

  const loadUsers = async () => {
    try {
      const res = await fetch("/api/admin/chat-users");
      if (res.ok) {
        const data = await res.json();
        setUsersWithChats(data.users || []);
      }
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const loadMessages = async (userId: number) => {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUserId) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          content: input,
          isFromUser: false,
        }),
      });

      if (res.ok) {
        setInput("");
        loadMessages(selectedUserId);
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

  // This is a server component wrapper
  return <AdminChatClient usersWithChats={usersWithChats} />;
}

function AdminChatClient({
  usersWithChats: initialUsers,
}: {
  usersWithChats: any[];
}) {
  const [usersWithChats, setUsersWithChats] = useState(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (selectedUserId) {
      loadMessages(selectedUserId);
    }
  }, [selectedUserId]);

  const loadMessages = async (userId: number) => {
    try {
      const res = await fetch(`/api/chat?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedUserId) return;

    setSending(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          content: input,
          isFromUser: false,
        }),
      });

      if (res.ok) {
        setInput("");
        loadMessages(selectedUserId);
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
                <div
                  key={chat.userId}
                  onClick={() => setSelectedUserId(chat.userId)}
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
                </div>
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
