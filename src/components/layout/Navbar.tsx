import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { LogoutButton } from "./LogoutButton";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold" style={{ color: "var(--main-color)" }}>
            Ongudai Camp
          </Link>

          <div className="hidden md:flex space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600">
              Главная
            </Link>
            <Link href="/hotels" className="text-gray-700 hover:text-blue-600">
              Отели
            </Link>
            <Link href="/tours" className="text-gray-700 hover:text-blue-600">
              Туры
            </Link>
            <Link href="/activities" className="text-gray-700 hover:text-blue-600">
              Активности
            </Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600">
              О нас
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard" className="text-gray-700 hover:text-blue-600">
                  Кабинет
                </Link>
                {session.user && (session.user as any).role === "admin" && (
                  <Link href="/admin" className="text-gray-700 hover:text-blue-600">
                    Админка
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/auth/signin" className="text-gray-700 hover:text-blue-600">
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-main px-4 py-2 text-sm"
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
