import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - List all hotels
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hotels = await prisma.post.findMany({
    where: { type: "hotel" },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return NextResponse.json(hotels);
}

// POST - Create new hotel
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      address,
      latitude,
      longitude,
      price,
      salePrice,
      currency,
      authorId,
      status,
    } = body;

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9а-яё]/gi, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const hotel = await prisma.post.create({
      data: {
        title,
        slug,
        type: "hotel",
        content,
        excerpt,
        address,
        latitude,
        longitude,
        price,
        salePrice,
        currency: currency || "RUB",
        authorId: authorId ? parseInt(authorId) : null,
        status: status || "publish",
      },
    });

    return NextResponse.json(hotel, { status: 201 });
  } catch (error) {
    console.error("Create hotel error:", error);
    return NextResponse.json(
      { error: "Ошибка создания отеля" },
      { status: 500 }
    );
  }
}
