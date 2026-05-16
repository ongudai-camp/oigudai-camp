import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { unlink } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const docId = parseInt(params.id);

    const doc = await prisma.identityDocument.findUnique({
      where: { id: docId },
    });

    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (doc.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete file if exists
    if (doc.fileUrl) {
      const filepath = join(process.cwd(), "public", doc.fileUrl);
      if (existsSync(filepath)) {
        await unlink(filepath);
      }
    }

    await prisma.identityDocument.delete({
      where: { id: docId },
    });

    return NextResponse.json({ message: "Document deleted" });
  } catch (error: unknown) {
    console.error("Identity delete error:", error);
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 });
  }
}
