import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/tours - list all tours
export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tours = await prisma.post.findMany({
    where: { type: "tour" },
    orderBy: { createdAt: "desc" },
    include: { author: true },
  });

  return NextResponse.json(tours);
}

// POST /api/admin/tours - create new tour
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
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
      duration,
      groupSize,
      difficulty,
    } = body;

    const slug = title
      .toLowerCase()
      .replace(/[^a-zа-я0-9]/gi, "-")
      .replace(/-+/g, "-");

    const tour = await prisma.post.create({
      data: {
        title,
        slug,
        type: "tour",
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

    // Add meta fields
    if (duration || groupSize || difficulty) {
      const metaData = [];
      if (duration) metaData.push({ key: "duration", value: duration });
      if (groupSize) metaData.push({ key: "groupSize", value: groupSize });
      if (difficulty) metaData.push({ key: "difficulty", value: difficulty });

      await prisma.postMeta.createMany({
        data: metaData.map((m) => ({ ...m, postId: tour.id })),
      });
    }

    return NextResponse.json(tour);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create tour" },
      { status: 500 }
    );
  }
}
