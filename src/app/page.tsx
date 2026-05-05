import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section" style={{ backgroundImage: "url('/hero-bg.jpg')" }}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Открой для себя Онгудай
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Туристический комплекс с комфортабельными отелями, захватывающими турами
            и незабываемыми активностями на Алтае
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/hotels"
              className="btn-main"
            >
              Посмотреть отели
            </Link>
            <Link
              href="/tours"
              className="btn-orange"
            >
              Выбрать тур
            </Link>
            <Link
              href="/activities"
              className="btn-orange"
              style={{ backgroundColor: "#10b981" }}
            >
              Активности
            </Link>
          </div>
        </div>
      </section>

      {/* Search Form */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="search-form-wrapper">
            <form className="search-form grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Тип
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="hotel">Отель</option>
                  <option value="tour">Тур</option>
                  <option value="activity">Активность</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Место
                </label>
                <input
                  type="text"
                  placeholder="Онгудай..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Заезд
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Гости
                </label>
                <input
                  type="number"
                  min="1"
                  defaultValue="2"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="btn-main w-full"
                >
                  Найти
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className="container mx-auto px-4">
          <h2 className="section-title">
            Почему выбирают Ongudai Camp
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Комфортабельные отели</h3>
              <p className="text-gray-600">
                Широкий выбор отелей и гостевых домов в живописных местах Алтая
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Увлекательные туры</h3>
              <p className="text-gray-600">
                Экскурсионные и приключенческие туры по красивейшим местам региона
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Активный отдых</h3>
              <p className="text-gray-600">
                Рафтинг, конные прогулки, треккинг и другие активности для всей семьи
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Hotels */}
      <section className="section section-gray">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Популярные отели</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="hotel-card">
                <div className="h-48 bg-gray-300 relative">
                  <Image
                    src={`/images/hotels/hotel${item}.jpg`}
                    alt={`Отель ${item}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Отель на Алтае {item}</h3>
                  <p className="text-gray-600 mb-4">с. Онгудай, Алтай</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-blue-600">от 3 500 ₽</span>
                      <span className="text-gray-500 text-sm"> / ночь</span>
                    </div>
                    <Link
                      href={`/hotels/${item}`}
                      className="btn-main px-4 py-2 text-sm"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/hotels"
              className="btn-main inline-block"
            >
              Все отели
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Tours */}
      <section className="section">
        <div className="container mx-auto px-4">
          <h2 className="section-title">Популярные туры</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="tour-card">
                <div className="h-48 bg-gradient-to-br from-blue-400 to-indigo-500 relative">
                  <Image
                    src={`/images/tours/tour${item}.jpg`}
                    alt={`Тур ${item}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">Тур по Алтаю {item}</h3>
                  <p className="text-gray-600 mb-4">Сказочный Алтай</p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-2xl font-bold text-indigo-600">от 15 000 ₽</span>
                      <span className="text-gray-500 text-sm"> / чел</span>
                    </div>
                    <Link
                      href={`/tours/${item}`}
                      className="btn-main px-4 py-2 text-sm"
                      style={{ backgroundColor: "#4f46e5" }}
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              href="/tours"
              className="btn-main inline-block"
              style={{ backgroundColor: "#4f46e5" }}
            >
              Все туры
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
