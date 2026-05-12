import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// GET - Get single hotel
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const hotel = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { author: true, rooms: true, meta: true },
    });

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json(hotel);
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PUT - Update hotel
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

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
      featuredImage,
      gallery,
    } = body;

    const hotel = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        excerpt,
        address,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        currency,
        authorId: authorId ? parseInt(authorId) : null,
        status,
        featuredImage: featuredImage || null,
        gallery: gallery || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(hotel);
  } catch (err) {
    console.error("Update hotel error:", err);
    return NextResponse.json({ error: "Ошибка обновления" }, { status: 500 });
  }
}

// DELETE - Delete hotel
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "Отель удален" });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
