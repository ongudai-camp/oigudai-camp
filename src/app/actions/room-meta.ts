"use server";

import { prisma } from "@/lib/prisma";

export async function getRoomTypesAction() {
  try {
    const types = await prisma.roomType.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, types };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка при получении типов номеров" };
  }
}

export async function getFacilitiesAction() {
  try {
    const facilities = await prisma.facility.findMany({
      orderBy: { name: "asc" },
    });
    return { success: true, facilities };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка при получении удобств" };
  }
}
