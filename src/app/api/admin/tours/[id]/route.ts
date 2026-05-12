import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET /api/admin/tours/[id] - get single tour
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const tour = await prisma.post.findUnique({
    where: { id: parseInt(id), type: "tour" },
    include: { meta: true, author: true },
  });

  if (!tour) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(tour);
}

// PUT /api/admin/tours/[id] - update tour
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
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
      featuredImage,
      gallery,
    } = body;

    const tour = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        address,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        authorId: authorId ? parseInt(authorId) : null,
        status,
        featuredImage: featuredImage || null,
        gallery: gallery || null,
      },
    });

    // Update meta fields
    if (duration || groupSize || difficulty) {
      // Delete existing meta
      await prisma.postMeta.deleteMany({
        where: { postId: tour.id },
      });

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
      { error: error instanceof Error ? error.message : "Failed to update tour" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tours/[id] - delete tour
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete tour" },
      { status: 500 }
    );
  }
}
