import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

// GET /api/admin/activities - list all activities
export async function GET() {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
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

  if (!session?.user || !isAdmin(session.user.role)) {
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
      latitude,
      longitude,
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
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        authorId: authorId ? parseInt(authorId) : null,
        status: status || "publish",
      },
    });

    return NextResponse.json(activity);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create activity" },
      { status: 500 }
    );
  }
}
