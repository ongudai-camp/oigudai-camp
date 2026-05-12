import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all unique categories from post meta
  const categories = await prisma.postMeta.findMany({
    where: { key: "category" },
    select: { value: true },
    distinct: ["value"],
  });

  return NextResponse.json(categories.map((c) => c.value).filter(Boolean));
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, postType } = body;

    if (!name || !postType) {
      return NextResponse.json(
        { error: "Name and postType are required" },
        { status: 400 }
      );
    }

    // Categories are stored as post meta, so we just return success
    // In a real app, you might want a separate Category model
    return NextResponse.json({ success: true, category: name });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Category error" }, { status: 500 });
  }
}
