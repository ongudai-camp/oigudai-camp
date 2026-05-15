"use server";

import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import {
  optimizeImage,
  generateFilename,
  validateMagicBytes,
  ALLOWED_IMAGE_TYPES,
  GALLERY_MAX_SIZE,
  GALLERY_MAX_FILES,
} from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";

export async function uploadImagesAction(formData: FormData) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return { error: "Не авторизован" };
  }

  const rl = rateLimit({ key: `upload-${session.user.id}`, limit: 20, windowMs: 60000 });
  if (!rl.allowed) {
    return { error: "Слишком много загрузок. Попробуйте позже." };
  }

  const files = formData.getAll("files") as File[];
  if (!files.length) {
    return { error: "Нет файлов" };
  }

  if (files.length > GALLERY_MAX_FILES) {
    return { error: `Максимум ${GALLERY_MAX_FILES} файлов за раз` };
  }

  const urls: string[] = [];
  const uploadDir = path.join(process.cwd(), "public", "uploads");

  try {
    await mkdir(uploadDir, { recursive: true });

    for (const file of files) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
        return { error: `Неподдерживаемый тип файла: ${file.type}. Разрешены: ${ALLOWED_IMAGE_TYPES.join(", ")}` };
      }

      if (file.size > GALLERY_MAX_SIZE) {
        return { error: `Файл слишком большой. Максимум 20MB` };
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      if (!validateMagicBytes(buffer, file.type)) {
        return { error: `Содержимое файла не соответствует заявленному типу` };
      }

      const optimized = await optimizeImage(buffer, "gallery");
      const filename = generateFilename();
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, optimized);
      urls.push(`/uploads/${filename}`);
    }

    return { urls };
  } catch (error: unknown) {
    for (const url of urls) {
      try {
        const fname = url.replace("/uploads/", "");
        await unlink(path.join(uploadDir, fname));
      } catch {}
    }
    return { error: error instanceof Error ? error.message : "Ошибка загрузки" };
  }
}

export async function deleteImageAction(url: string) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return { error: "Не авторизован" };
  }

  const filename = url.replace("/uploads/", "");
  const filepath = path.join(process.cwd(), "public", "uploads", filename);

  try {
    await unlink(filepath);
    return { success: true };
  } catch (error: unknown) {
    return { error: error instanceof Error ? error.message : "Ошибка удаления" };
  }
}
