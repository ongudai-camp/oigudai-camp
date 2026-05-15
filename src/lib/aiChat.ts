import OpenAI from "openai";
import { prisma } from "./prisma";

const openaiApiKey = process.env.OPENAI_API_KEY;
const isAiEnabled = () => !!(openaiApiKey && openaiApiKey !== "your-openai-api-key" && process.env.AI_CHAT_ENABLED === "true");

let openai: OpenAI | null = null;

if (isAiEnabled()) {
  openai = new OpenAI({ apiKey: openaiApiKey });
}

const SYSTEM_PROMPT = `Ты — дружелюбный AI-помощник туристического комплекса "Ongudai Camp" в Онгудайском районе Республики Алтай.

Твоя задача — помогать гостям с вопросами о:
- Отелях, турах, активностях и экскурсиях
- Бронировании и оплате
- Ценах, скидках, акциях
- Погоде, сезонах, как добраться
- Достопримечательностях Алтая
- Контактах и расположении

Отвечай приветливо, кратко и по делу. Используй эмодзи (🏔 🏨 🗺 🎯) для дружелюбного тона.
Если вопрос требует вмешательства человека (отмена брони, возврат, сложные проблемы), предложи написать "администратор".
Не выдумывай информацию — если не знаешь точного ответа, предложи обратиться к администратору.

Для точной информации о текущих ценах, наличии мест и деталях объектов используй базу данных через доступные функции.`;

const TOOLS: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_hotels",
      description: "Поиск отелей по параметрам",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Поисковый запрос (название, адрес)" },
          minPrice: { type: "number", description: "Минимальная цена за ночь" },
          maxPrice: { type: "number", description: "Максимальная цена за ночь" },
          limit: { type: "number", description: "Максимум результатов" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_tours",
      description: "Поиск туров по параметрам",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Поисковый запрос" },
          limit: { type: "number", description: "Максимум результатов" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_activities",
      description: "Поиск активностей/экскурсий по параметрам",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Категория (excursion, rafting, hiking, horseback, fishing, skiing, other)" },
          limit: { type: "number", description: "Максимум результатов" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_booking_info",
      description: "Получить информацию о бронировании пользователя",
      parameters: {
        type: "object",
        properties: {
          userId: { type: "number", description: "ID пользователя" },
        },
        required: ["userId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_contacts",
      description: "Получить контактную информацию комплекса",
      parameters: { type: "object", properties: {} },
    },
  },
];

async function searchHotels(args: { query?: string; minPrice?: number; maxPrice?: number; limit?: number }) {
  const where: Record<string, unknown> = { type: "hotel", status: "publish" };
  if (args.query) {
    where.title = { contains: args.query };
  }
  if (args.minPrice !== undefined || args.maxPrice !== undefined) {
    where.price = {};
    if (args.minPrice !== undefined) (where.price as Record<string, number>).gte = args.minPrice;
    if (args.maxPrice !== undefined) (where.price as Record<string, number>).lte = args.maxPrice;
  }
  const hotels = await prisma.post.findMany({
    where: where as any,
    take: args.limit || 5,
    select: { title: true, price: true, salePrice: true, excerpt: true, address: true, rating: true },
  });
  return JSON.stringify(hotels);
}

async function searchTours(args: { query?: string; limit?: number }) {
  const where: Record<string, unknown> = { type: "tour", status: "publish" };
  if (args.query) where.title = { contains: args.query };
  const tours = await prisma.post.findMany({
    where: where as any,
    take: args.limit || 5,
    select: { title: true, price: true, salePrice: true, excerpt: true, rating: true },
  });
  return JSON.stringify(tours);
}

async function searchActivities(args: { category?: string; limit?: number }) {
  const where: Record<string, unknown> = { type: "activity", status: "publish" };
  if (args.category) {
    where.meta = { some: { key: "category", value: args.category } };
  }
  const activities = await prisma.post.findMany({
    where: where as any,
    take: args.limit || 5,
    select: { title: true, price: true, salePrice: true, excerpt: true, rating: true },
  });
  return JSON.stringify(activities);
}

async function getBookingInfo(args: { userId: number }) {
  const bookings = await prisma.booking.findMany({
    where: { userId: args.userId },
    take: 5,
    orderBy: { createdAt: "desc" },
    select: {
      bookingId: true,
      status: true,
      totalPrice: true,
      checkIn: true,
      post: { select: { title: true } },
    },
  });
  return JSON.stringify(bookings);
}

async function getContacts() {
  return JSON.stringify({
    phone: "+7 (388) 123-45-67",
    email: "info@ongudaicamp.ru",
    address: "с. Онгудай, Республика Алтай",
  });
}

const functionMap: Record<string, (args: any) => Promise<string>> = {
  search_hotels: searchHotels,
  search_tours: searchTours,
  search_activities: searchActivities,
  get_booking_info: getBookingInfo,
  get_contacts: getContacts,
};

export async function getAiReply(message: string, userId?: number): Promise<string | null> {
  if (!isAiEnabled() || !openai) {
    return null;
  }

  try {
    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: message },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      max_tokens: 512,
      temperature: 0.7,
    });

    const choice = response.choices[0];
    if (!choice?.message) return null;

    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const toolResults: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        ...messages,
        { role: "assistant", content: null, tool_calls: choice.message.tool_calls },
      ];

      for (const toolCall of choice.message.tool_calls) {
        if (toolCall.type === "function") {
          const fn = functionMap[toolCall.function.name];
          if (fn) {
            try {
              const args = JSON.parse(toolCall.function.arguments);
              if (toolCall.function.name === "get_booking_info" && userId) {
                args.userId = userId;
              }
              const result = await fn(args);
              toolResults.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: result,
              });
            } catch (e) {
              toolResults.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify({ error: String(e) }),
              });
            }
          }
        }
      }

      const finalResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: toolResults,
        max_tokens: 512,
        temperature: 0.7,
      });

      return finalResponse.choices[0]?.message?.content || null;
    }

    return choice.message.content;
  } catch (error) {
    console.error("AI chat error:", error);
    return null;
  }
}
