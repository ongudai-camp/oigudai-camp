import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import {
  generateFilename,
  validateMagicBytes,
  ALLOWED_IMAGE_TYPES,
} from "@/lib/upload";
import { encryptIdentityData } from "@/lib/crypto";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "identity");

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const documents = await prisma.identityDocument.findMany({
      where: { userId },
      orderBy: { uploadedAt: "desc" },
    });

    return NextResponse.json({ documents });
  } catch (error: unknown) {
    console.error("Identity list error:", error);
    return NextResponse.json({ error: "Failed to load documents" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const formData = await request.formData();
    const file = formData.get("document") as File | null;
    const docType = formData.get("docType") as string || "passport";
    const docDataStr = formData.get("docData") as string || "{}";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}` 
      }, { status: 400 });
    }

    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    if (!validateMagicBytes(buffer, file.type)) {
      return NextResponse.json({ error: "Invalid file content" }, { status: 400 });
    }

    const filename = generateFilename();
    const filepath = join(UPLOAD_DIR, filename);
    await writeFile(filepath, buffer);

    const url = `/uploads/identity/${filename}`;

    let docData = {};
    try {
      docData = JSON.parse(docDataStr);
    } catch (e) {
      docData = { raw: docDataStr };
    }

    const encryptedData = encryptIdentityData(docData, userId);

    const doc = await prisma.identityDocument.create({
      data: {
        userId,
        docType,
        fileUrl: url,
        fileType: file.type,
        encryptedData,
        status: "pending",
      },
    });

    return NextResponse.json({ document: doc });
  } catch (error: unknown) {
    console.error("Identity upload error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Failed to upload document" 
    }, { status: 500 });
  }
}
