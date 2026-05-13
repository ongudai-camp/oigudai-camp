import { prisma } from "@/lib/prisma";

interface IntentHandler {
  keywords: string[];
  handler: (message: string, userId?: number) => Promise<string>;
}

const greetings = [
  "Здравствуйте! 👋 Добро пожаловать в Онгудай Кэмп. Чем я могу помочь? Вы можете спросить про отели, туры, активности, бронирования — или написать «администратор» для связи с оператором.",
  "Привет! Рад помочь с выбором отдыха на Алтае. 🏔 Спрашивайте про отели, туры, экскурсии — или просто напишите «администратор», если нужна помощь оператора.",
  "Здравствуйте! Чем могу быть полезен? Ищете жильё, хотите забронировать тур или узнать цены? Просто напишите свой вопрос!",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const handlers: IntentHandler[] = [
  {
    keywords: ["администратор", "оператор", "человек", "живой"],
    handler: async (_msg, userId) => {
      if (userId) {
        await prisma.chatMessage.create({
          data: {
            userId,
            content: "[Бот] Пользователь запросил связь с администратором",
            isFromUser: false,
            isAiGenerated: true,
          },
        });
      }
      return "Хорошо, я передаю ваш диалог администратору. Пожалуйста, ожидайте — с вами свяжутся в ближайшее время. ⏳";
    },
  },
  {
    keywords: ["привет", "здравствуй", "здравствуйте", "добрый", "доброго", "хай", "hi", "hello"],
    handler: async () => pick(greetings),
  },
  {
    keywords: ["отель", "гостиниц", "жиль", "номер", "прожива"],
    handler: async () => {
      const count = await prisma.post.count({ where: { type: "hotel", status: "publish" } });
      const cheapest = await prisma.post.findFirst({
        where: { type: "hotel", status: "publish" },
        orderBy: { price: "asc" },
        select: { price: true, title: true },
      });
      let msg = `У нас ${count} вариантов размещения в Онгудайском районе. 🏨`;
      if (cheapest) {
        msg += `\n\nСамый бюджетный вариант: **${cheapest.title}** — от ${cheapest.price} ₽/ночь.`;
      }
      msg += "\n\nВы можете посмотреть подробнее на странице /hotels или спросить меня о конкретном отеле.";
      return msg;
    },
  },
  {
    keywords: ["тур", "экскурси"],
    handler: async () => {
      const count = await prisma.post.count({ where: { type: "tour", status: "publish" } });
      const cheapest = await prisma.post.findFirst({
        where: { type: "tour", status: "publish" },
        orderBy: { price: "asc" },
        select: { price: true, title: true, salePrice: true },
      });
      let msg = `У нас доступно ${count} туров и экскурсий по Алтаю. 🗺️`;
      if (cheapest) {
        const price = cheapest.salePrice || cheapest.price;
        msg += `\n\nСамый доступный: **${cheapest.title}** — от ${price} ₽.`;
      }
      msg += "\n\nПодробнее на странице /tours. Если хотите узнать про конкретный тур — напишите его название!";
      return msg;
    },
  },
  {
    keywords: ["актив", "развлечен", "заняти"],
    handler: async () => {
      const count = await prisma.post.count({ where: { type: "activity", status: "publish" } });
      const categories = await prisma.postMeta.findMany({
        where: { key: "category", post: { type: "activity", status: "publish" } },
        select: { value: true },
        distinct: ["value"],
      });
      let msg = `У нас ${count} вариантов активного отдыха! 🎯`;
      const cats = categories.map((c) => c.value).filter(Boolean) as string[];
      if (cats.length > 0) {
        msg += `\n\nДоступные категории: ${cats.join(", ")}.`;
      }
      msg += "\n\nСмотрите все на странице /activities.";
      return msg;
    },
  },
  {
    keywords: ["скольк", "цен", "стоит", "прайс", "стоимость", "дешев"],
    handler: async () => {
      const hotelMin = await prisma.post.findFirst({
        where: { type: "hotel", status: "publish" },
        orderBy: { price: "asc" },
        select: { price: true },
      });
      const tourMin = await prisma.post.findFirst({
        where: { type: "tour", status: "publish" },
        orderBy: { price: "asc" },
        select: { price: true, salePrice: true },
      });
      const parts = ["Вот примерные цены на нашем сайте:"];
      if (hotelMin) parts.push(`\n🏨 Отели: от ${hotelMin.price} ₽/ночь`);
      if (tourMin) parts.push(`\n🗺️ Туры: от ${tourMin.salePrice || tourMin.price} ₽`);
      parts.push("\n\nТочная стоимость зависит от сезона, количества гостей и дополнительных услуг. Рекомендую посмотреть на сайте или написать «администратор» для индивидуального расчёта.");
      return parts.join("");
    },
  },
  {
    keywords: ["телефон", "позвон", "контакт", "адрес", "связат"],
    handler: async () => {
      return "Наши контакты:\n\n📞 Телефон: +7 (388) 123-45-67\n📧 Email: info@ongudaicamp.ru\n📍 Адрес: с. Онгудай, Республика Алтай\n\nТакже вы можете написать «администратор» здесь в чате, и мы ответим в ближайшее время.";
    },
  },
  {
    keywords: ["бронь", "бронирован", "мо", "статус", "заказ"],
    handler: async (_msg, userId) => {
      if (!userId) {
        return "Чтобы проверить статус бронирования, пожалуйста, войдите в свой аккаунт. 🔐";
      }
      const bookings = await prisma.booking.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { post: { select: { title: true } } },
      });
      if (bookings.length === 0) {
        return "У вас пока нет бронирований. Хотите подобрать отель или тур?";
      }
      const lines = bookings.map(
        (b, i) =>
          `${i + 1}. **${b.post.title}** — ${b.status === "confirmed" ? "✅ Подтверждено" : b.status === "pending" ? "⏳ Ожидает" : "❌ Отменено"} (${b.totalPrice} ₽)`
      );
      return `Ваши последние бронирования:\n\n${lines.join("\n")}\n\nЕсли нужно отменить бронь — напишите «отменить».`;
    },
  },
  {
    keywords: ["отмен", "отказ", "вернут"],
    handler: async () => {
      return "Для отмены бронирования или возврата средств необходимо связаться с администратором. Я передам ваш запрос. Напишите, пожалуйста, номер бронирования. 🔄";
    },
  },
  {
    keywords: ["плат", "оплат", "деньг", "перевод", "нал"],
    handler: async () => {
      return "По вопросам оплаты лучше обратиться к администратору — я передам ваш вопрос. 💳\n\nНапишите «администратор», чтобы мы могли вам помочь.";
    },
  },
  {
    keywords: ["спасиб", "благодар"],
    handler: async () => {
      return "Пожалуйста! Рад был помочь. 😊 Если появятся ещё вопросы — обращайтесь. Хорошего отдыха на Алтае! 🏔";
    },
  },
  {
    keywords: ["погод", "климат", "сезон"],
    handler: async () => {
      return "Лучшее время для посещения Алтая — с мая по сентябрь. 🏔\n\n🌞 Летом +20..+30°C\n🍂 Осенью +5..+15°C\n❄️ Зимой -10..-20°C\n🌺 Весной +5..+15°C\n\nНо точный прогноз лучше уточнить перед поездкой!";
    },
  },
  {
    keywords: ["как добрат", "транспорт", "дорог", "проезд", "доеха"],
    handler: async () => {
      return "Добраться до Онгудая можно несколькими способами:\n\n🚗 **На машине**: по Чуйскому тракту (М-52) — около 600 км от Новосибирска, 250 км от Барнаула.\n🚌 **На автобусе**: от автовокзала Барнаула или Новосибирска до с. Онгудай.\n✈️ **На самолёте**: до аэропорта Горно-Алтайска, далее на такси или автобусе (около 180 км).\n\nХотите уточнить детали?";
    },
  },
  {
    keywords: ["отзыв", "рейтинг"],
    handler: async () => {
      return "Вы можете посмотреть отзывы на страницах отелей, туров и активностей. ⭐\n\nПосле посещения вы тоже можете оставить отзыв — это помогает другим путешественникам!";
    },
  },
];

function scoreMessage(message: string, keywords: string[]): number {
  const lower = message.toLowerCase();
  return keywords.reduce((score, kw) => {
    return score + (lower.includes(kw) ? 1 : 0);
  }, 0);
}

export async function handleChatMessage(
  message: string,
  userId?: number
): Promise<string | null> {
  const trimmed = message.trim();
  if (!trimmed) return null;

  let bestScore = 0;
  let bestResponse: string | null = null;

  for (const handler of handlers) {
    const score = scoreMessage(trimmed, handler.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestResponse = await handler.handler(trimmed, userId);
    }
  }

  if (bestScore === 0) {
    return `Я не совсем понял ваш вопрос. 🤔\n\nВот что я могу:\n• Искать отели, туры и активности\n• Сообщить цены и контакты\n• Проверить статус бронирования\n• Передать вопрос администратору\n\nПросто напишите, что вас интересует, или скажите «администратор» для связи с оператором.`;
  }

  return bestResponse;
}

export function isRuleBotEnabled(): boolean {
  return process.env.AI_CHAT_ENABLED === "true";
}
