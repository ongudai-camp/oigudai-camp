import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { LogoutButton } from "./LogoutButton";
import LocaleSwitcher from "./LocaleSwitcher";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/90 shadow-sm border-b border-gray-100 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: "var(--main-color)" }}>
            Ongudai Camp
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
              Главная
            </Link>
            <Link href="/hotels" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
              Отели
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
              Туры
            </Link>
            <Link href="/activities" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
              Активности
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
              О нас
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <LocaleSwitcher />
            
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                  Кабинет
                </Link>
                {session.user && (session.user as any).role === "admin" && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                    Админка
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600 cursor-pointer transition-colors duration-200">
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-main px-4 py-2 text-sm cursor-pointer hover:shadow-md transition-all duration-200"
                >
                  Регистрация
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
