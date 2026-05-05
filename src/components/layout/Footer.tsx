import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4" style={{ color: "var(--main-color)" }}>
              Ongudai Camp
            </h3>
            <p className="text-gray-300">
              Туристический комплекс в сердце Алтая. Комфорт, природа, приключения.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Навигация</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/" className="hover:text-white">Главная</Link></li>
              <li><Link href="/hotels" className="hover:text-white">Отели</Link></li>
              <li><Link href="/tours" className="hover:text-white">Туры</Link></li>
              <li><Link href="/activities" className="hover:text-white">Активности</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-gray-300">
              <li><Link href="/contact" className="hover:text-white">Контакты</Link></li>
              <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-white">Условия</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Контакты</h4>
            <p className="text-gray-300">с. Онгудай, Республика Алтай</p>
            <p className="text-gray-300">+7 (388) 123-45-67</p>
            <p className="text-gray-300">info@ongudaicamp.ru</p>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2026 Ongudai Camp. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}
