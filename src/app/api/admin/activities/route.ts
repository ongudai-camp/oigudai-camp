import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/activities - list all activities
export async function GET() {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const activities = await prisma.post.findMany({
    where: { type: "activity" },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return NextResponse.json(activities);
}

// POST /api/admin/activities - create new activity
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      address,
      price,
      salePrice,
      authorId,
      status,
    } = body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/gi, "-")
      .replace(/-+/g, "-");

    const activity = await prisma.post.create({
      data: {
        title,
        slug,
        type: "activity",
        content,
        address,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        authorId: authorId ? parseInt(authorId) : null,
        status: status || "publish",
      },
    });

    return NextResponse.json(activity);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to create activity" },
      { status: 500 }
    );
  }
}
