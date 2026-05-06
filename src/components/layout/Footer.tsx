import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0C4A6E] text-white py-16 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <h3 className="text-2xl font-black mb-6 tracking-tighter">
              ONGUDAI<span className="text-orange-500">CAMP</span>
            </h3>
            <p className="text-sky-200/70 leading-relaxed">
              Туристический комплекс в самом сердце горного Алтая. Мы создаем незабываемые впечатления для каждого гостя.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Навигация</h4>
            <ul className="space-y-4 text-sky-100/60">
              <li><Link href="/" className="hover:text-sky-400 transition-colors">Главная</Link></li>
              <li><Link href="/hotels" className="hover:text-sky-400 transition-colors">Отели</Link></li>
              <li><Link href="/tours" className="hover:text-sky-400 transition-colors">Туры</Link></li>
              <li><Link href="/activities" className="hover:text-sky-400 transition-colors">Активности</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Поддержка</h4>
            <ul className="space-y-4 text-sky-100/60">
              <li><Link href="/contact" className="hover:text-sky-400 transition-colors">Контакты</Link></li>
              <li><Link href="/faq" className="hover:text-sky-400 transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-sky-400 transition-colors">Условия</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6">Контакты</h4>
            <div className="space-y-4 text-sky-100/60">
              <p>📍 с. Онгудай, Республика Алтай</p>
              <p>📞 +7 (388) 123-45-67</p>
              <p>✉️ info@ongudaicamp.ru</p>
            </div>
          </div>
        </div>

        <div className="border-t border-sky-800/50 mt-16 pt-8 text-center text-sky-200/40 text-sm">
          <p>&copy; 2026 Ongudai Camp. Сделано с любовью к Алтаю.</p>
        </div>
      </div>
    </footer>
  );
}
