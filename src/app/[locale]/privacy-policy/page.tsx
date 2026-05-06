import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";

export default async function PrivacyPolicyPage({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6">{t("privacy.title")}</h1>

          <div className="space-y-6 text-gray-700">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Общие положения</h2>
              <p>
                Настоящее Соглашение об обработке персональных данных (далее — Соглашение)
                разработано в соответствии с законодательством Российской Федерации,
                включая Федеральный закон от 27.07.2006 № 152-ФЗ «О персональных данных».
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Какие данные мы собираем</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Имя и контактные данные (телефон, email)</li>
                <li>Данные для бронирования (даты, количество гостей)</li>
                <li>Технические данные (IP-адрес, cookies, данные об устройстве)</li>
                <li>Данные для авторизации через социальные сети (VK, Telegram, Yandex)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Цели обработки</h2>
              <p>Мы используем ваши данные для:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Оформления и управления бронированиями</li>
                <li>Связи с вами по вопросам вашего отдыха</li>
                <li>Улучшения качества наших услуг</li>
                <li>Отправки уведомлений и специальных предложений</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Передача данных третьим лицам</h2>
              <p>
                Мы не передаем ваши персональные данные третьим лицам, за исключением
                случаев, предусмотренных законодательством РФ или необходимых для
                оказания услуг (например, отелям для заселения).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Ваши права</h2>
              <p>Вы имеете право:</p>
              <ul className="list-disc pl-6 space-y-2 mt-2">
                <li>Запросить информацию о том, какие данные мы храним о вас</li>
                <li>Требовать изменения или удаления ваших данных</li>
                <li>Отозвать согласие на обработку данных</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Контакты</h2>
              <p>
                По вопросам обработки персональных данных вы можете связаться с нами:
                <br />
                Email: privacy@ongudaicamp.ru
                <br />
                Телефон: +7 (388) 123-45-67
              </p>
            </section>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Последнее обновление: {new Date().toLocaleDateString("ru-RU")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
