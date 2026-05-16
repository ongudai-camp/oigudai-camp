"use client";

import { useState } from "react";
import ChatInterface from "./ChatInterface";

interface ChatWidgetProps {
  userId: number | null;
  locale: string;
}

export default function ChatWidget({ userId, locale }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  if (!userId) return null;

  if (!isOpen) {
    return (
      <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <button
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 bg-gradient-to-br from-blue-500 to-sky-600 text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 flex items-center justify-center cursor-pointer"
          aria-label="Открыть чат с поддержкой"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-24 lg:bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-6rem)] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-300">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-sky-600 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-sm">Чат поддержки</h3>
              <p className="text-[11px] text-blue-100">Онгудай Кэмп</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Закрыть чат"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <ChatInterface userId={userId} isAdmin={false} />
        </div>
      </div>
    </div>
  );
}
