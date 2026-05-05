"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Неверный email или пароль");
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  const handleSocialSignIn = (provider: string) => {
    if (provider === "vk") {
      const clientId = process.env.NEXT_PUBLIC_VK_CLIENT_ID || "your-vk-client-id";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/vk`);
      window.location.href = `https://oauth.vk.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email`;
    } else if (provider === "telegram") {
      const botId = process.env.NEXT_PUBLIC_TELEGRAM_BOT_ID || "your-telegram-bot-id";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/telegram`);
      window.location.href = `https://oauth.telegram.org/auth?bot_id=${botId}&origin=${window.location.origin}&return_to=/api/auth/callback/telegram`;
    } else if (provider === "yandex") {
      const clientId = process.env.NEXT_PUBLIC_YANDEX_CLIENT_ID || "your-yandex-client-id";
      const redirectUri = encodeURIComponent(`${window.location.origin}/api/auth/callback/yandex`);
      window.location.href = `https://oauth.yandex.ru/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=login:info login:email`;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 space-y-6">
          <div>
            <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
              Вход в аккаунт
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Или{" "}
              <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 cursor-pointer">
                зарегистрируйтесь
              </Link>
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignIn("vk")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4C75A3">
                <path d="M12.14 18.11c-3.44 0-6.26-2.54-6.26-6.26 0-3.44 2.54-6.26 6.26-6.26 3.44 0 6.26 2.54 6.26 6.26 0 3.44-2.54 6.26-6.26 6.26zm0-10.52c-2.34 0-4.26 1.92-4.26 4.26s1.92 4.26 4.26 4.26 4.26-1.92 4.26-4.26-1.92-4.26-4.26-4.26z"/>
              </svg>
              Войти через VK
            </button>

            <button
              onClick={() => handleSocialSignIn("telegram")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0088cc">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.2-.04-.28-.02-.12.02-2.02 1.28-5.7 3.76-.54.37-1.03.56-1.47.55-.48-.01-1.4-.27-2.09-.49-.84-.28-1.51-.42-1.45-.89.03-.25.38-.5 1.04-.76 4.07-1.77 6.79-2.94 8.15-3.5 3.88-1.62 4.69-1.9 5.21-1.91.12 0 .37.03.54.17.14.12.18.28.2.47-.01.06.01.24 0 .38z"/>
              </svg>
              Войти через Telegram
            </button>

            <button
              onClick={() => handleSocialSignIn("yandex")}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#FF0000">
                <path d="M2 8.5v7h3.5c.17 0 .3-.13.3-.3v-6.4c0-.17-.13-.3-.3-.3H2zm4.5 0v7c0 .83.67 1.5 1.5 1.5h3.5c.17 0 .3-.13.3-.3v-7.4c0-.17-.13-.3-.3-.3H7c-.83 0-1.5.67-1.5 1.5z"/>
              </svg>
              Войти через Yandex
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"/>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Или войдите по почте</span>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Пароль
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer transition-colors duration-200"
              >
                {loading ? "Вход..." : "Войти"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
