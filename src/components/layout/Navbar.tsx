import Link from "next/link";
import { auth } from "@/app/api/auth/[...nextauth]/route";
import { LogoutButton } from "./LogoutButton";
import LocaleSwitcher from "./LocaleSwitcher";
import { getLocale } from "next-intl/server";

export default async function Navbar() {
  const session = await auth();
  const locale = await getLocale();

  const linkClass = "text-sky-900 hover:text-sky-500 font-medium cursor-pointer transition-all duration-300";

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 shadow-sm border-b border-sky-100 transition-all duration-300">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link href={`/${locale}`} className="text-2xl font-black cursor-pointer hover:opacity-80 transition-opacity tracking-tighter" style={{ color: "#0C4A6E" }}>
            ONGUDAI<span className="text-orange-500">CAMP</span>
          </Link>

          <div className="hidden md:flex space-x-10">
            <Link href={`/${locale}`} className={linkClass}>
              Главная
            </Link>
            <Link href={`/${locale}/hotels`} className={linkClass}>
              Отели
            </Link>
            <Link href={`/${locale}/tours`} className={linkClass}>
              Туры
            </Link>
            <Link href={`/${locale}/activities`} className={linkClass}>
              Активности
            </Link>
          </div>

          <div className="flex items-center space-x-6">
            <LocaleSwitcher />
            
            {session ? (
              <>
                <Link href={`/${locale}/dashboard`} className={linkClass}>
                  Кабинет
                </Link>
                {session.user && (session.user as any).role === "admin" && (
                  <Link href={`/${locale}/admin`} className="bg-sky-100 text-sky-700 px-4 py-2 rounded-full text-sm font-bold hover:bg-sky-200 transition-colors cursor-pointer">
                    Админка
                  </Link>
                )}
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href={`/${locale}/auth/signin`} className={linkClass}>
                  Войти
                </Link>
                <Link
                  href={`/${locale}/auth/register`}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full text-sm font-bold cursor-pointer shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 transform hover:scale-105"
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
