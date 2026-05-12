"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createActivityAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { error: "Не авторизован" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") as string;
  const duration = formData.get("duration") as string;
  const category = formData.get("category") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const included = formData.get("included") as string;
  const requirements = formData.get("requirements") as string;
  const difficulty = formData.get("difficulty") as string;
  const featuredImage = formData.get("featuredImage") as string | null;
  const gallery = formData.get("gallery") as string | null;

  if (!title || !price) {
    return { error: "Название и цена обязательны" };
  }

  try {
    const activity = await prisma.post.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9а-яё]/gi, "-"),
        type: "activity",
        content: description,
        address,
        price,
        salePrice: salePrice ? parseFloat(salePrice) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        featuredImage,
        gallery,
        authorId: parseInt(session.user.id),
        status: "publish",
        meta: {
          create: [
            { key: "duration", value: duration },
            { key: "category", value: category },
            { key: "difficulty", value: difficulty },
            { key: "included", value: included },
            { key: "requirements", value: requirements },
          ],
        },
      },
    });

    return { success: true, activityId: activity.id };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка при создании активности" };
  }
}
