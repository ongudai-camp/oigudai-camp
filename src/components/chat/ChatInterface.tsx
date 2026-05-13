"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { useTranslations } from "next-intl";

interface Message {
  id: number;
  content: string;
  isFromUser: boolean;
  isAiGenerated?: boolean;
  createdAt: string;
}

export default function ChatInterface({
  userId,
  isAdmin = false,
  targetUserId,
}: {
  userId: number;
  isAdmin?: boolean;
  targetUserId?: number;
}) {
  const t = useTranslations("admin");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const url = targetUserId
        ? `/api/chat?userId=${targetUserId}`
        : `/api/chat?userId=${userId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [userId, targetUserId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          isFromUser: !isAdmin,
          targetUserId: isAdmin ? targetUserId : undefined,
        }),
      });

      if (res.ok) {
        setInput("");
        const data = await res.json();
        if (data.aiMessage) {
          setMessages((prev) => [...prev, data.aiMessage]);
        }
        loadMessages();
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
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="bg-gray-50 border-b border-gray-100 p-4">
        <h2 className="font-semibold text-lg">
          {t("chat.title")}
        </h2>
        {isAdmin && targetUserId && (
          <p className="text-sm text-[#1A2B48]">{t("chat.userLabel")} ID: {targetUserId}</p>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-[#1A2B48]">
            <p>{t("chat.noMessages")}</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.isFromUser ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${
                  msg.isFromUser
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${
                    msg.isFromUser ? "text-blue-100" : "text-[#1A2B48]"
                  }`}
                >
                  {format(new Date(msg.createdAt), "HH:mm", { locale: ru })}
                  {msg.isAiGenerated && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-purple-400">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      AI
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 p-4">
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={t("chat.messagePlaceholder")}
            rows={2}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-[#1A2B48]"
          />
          <button
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? "..." : t("chat.send")}
          </button>
        </div>
      </div>
    </div>
  );
}
