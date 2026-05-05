import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center bg-gray-800">
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">О туристическом комплексе</h1>
          <p className="text-xl">Ваш идеальный отдых на Алтае</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Добро пожаловать в Ongudai Camp</h2>
            <p className="text-gray-600 mb-6 text-lg">
              Наш туристический комплекс расположен в живописном селе Онгудай, сердце Республики Алтай.
              Мы предлагаем комфортабельный отдых в окружении величественных гор и кристально чистых рек.
            </p>
            <p className="text-gray-600 mb-6 text-lg">
              С 2015 года мы помогаем туристам открывать для себя красоту Алтая.
              В нашем портфолио более 50 комфортабельных отелей и гостевых домов,
              а также более 100 экскурсионных маршрутов и активностей.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 my-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600 mb-2">50+</div>
                <div className="text-gray-600">Отелей и гостевых домов</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600 mb-2">100+</div>
                <div className="text-gray-600">Туров и активностей</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-600 mb-2">10,000+</div>
                <div className="text-gray-600">Довольных гостей</div>
              </div>
            </div>

            <h3 className="text-2xl font-bold mb-4">Наши преимущества</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <strong>Лучшие цены</strong> - работаем напрямую с владельцами отелей
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <strong>Поддержка 24/7</strong> - наши менеджеры всегда на связи
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <strong>Гарантия бронирования</strong> - 100% гарантия подтверждения
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-3 text-xl">✓</span>
                <div>
                  <strong>Эксклюзивные туры</strong> - маршруты, которые не найдете в массовых предложениях
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
