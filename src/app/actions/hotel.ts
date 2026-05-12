"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function createHotelAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return { error: "Не авторизован" };
  }

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const address = formData.get("address") as string;
  const price = parseFloat(formData.get("price") as string);
  const salePrice = formData.get("salePrice") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const roomsJson = formData.get("rooms") as string;
  const featuredImage = formData.get("featuredImage") as string | null;
  const gallery = formData.get("gallery") as string | null;

  if (!title || !price) {
    return { error: "Название и цена обязательны" };
  }

  try {
    const hotel = await prisma.post.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9а-яё]/gi, "-"),
        type: "hotel",
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
      },
    });

    // Create rooms if provided
    if (roomsJson) {
      const rooms = JSON.parse(roomsJson);
      for (const room of rooms) {
        if (room.title && room.price) {
          await prisma.room.create({
            data: {
              postId: hotel.id,
              title: room.title,
              description: room.description,
              price: parseFloat(room.price),
              guests: room.guests || 1,
              beds: room.beds || 1,
              bathrooms: room.bathrooms || 1,
              floor: room.floor || null,
              roomTypeId: room.roomTypeId || null,
              facilities: room.facilityIds ? {
                connect: room.facilityIds.map((id: number) => ({ id }))
              } : undefined,
            },
          });
        }
      }
    }

    return { success: true, hotelId: hotel.id };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка при создании отеля" };
  }
}
