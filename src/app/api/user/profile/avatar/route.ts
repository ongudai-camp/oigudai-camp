import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  optimizeImage,
  generateFilename,
  validateMagicBytes,
  ALLOWED_IMAGE_TYPES,
  AVATAR_MAX_SIZE,
} from "@/lib/upload";
import { rateLimit } from "@/lib/rate-limit";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "avatars");

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rl = rateLimit({ key: `avatar-upload-${session.user.id}`, limit: 5, windowMs: 60000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many uploads. Try again later.", retryAfter: Math.ceil(rl.resetInMs / 1000) },
        { status: 429 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as typeof ALLOWED_IMAGE_TYPES[number])) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}` },
        { status: 400 },
      );
    }

    if (file.size > AVATAR_MAX_SIZE) {
      return NextResponse.json({ error: "File too large. Max 5MB" }, { status: 400 });
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: "File content does not match declared type" }, { status: 400 });
    }

    const optimized = await optimizeImage(buffer, "avatar");
    const filename = generateFilename();
    const filepath = join(UPLOAD_DIR, filename);
    await writeFile(filepath, optimized);

    const url = `/uploads/avatars/${filename}`;

    return NextResponse.json({ url });
  } catch (error: unknown) {
    console.error("Avatar upload error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to upload avatar" },
      { status: 500 },
    );
  }
}
