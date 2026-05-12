"use server";

import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function uploadImagesAction(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Не авторизован" };
  }

  const files = formData.getAll("files") as File[];
  if (!files.length) {
    return { error: "Нет файлов" };
  }

  const urls: string[] = [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const ext = file.name.split(".").pop() || "jpg";
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);
      urls.push(`/uploads/${filename}`);
    }

    return { urls };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка загрузки" };
  }
}

export async function deleteImageAction(url: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin") {
    return { error: "Не авторизован" };
  }

  const filename = url.replace("/uploads/", "");
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    const { unlink } = await import("fs/promises");
    await unlink(filepath);
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка удаления" };
  }
}
