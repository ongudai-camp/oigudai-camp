import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

// GET /api/admin/activities/[id] - get single activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const activity = await prisma.post.findUnique({
    where: { id: parseInt(id), type: "activity" },
    include: { author: true },
  });

  if (!activity) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(activity);
}

// PUT /api/admin/activities/[id] - update activity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
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
      authorId,
      status,
    } = body;

    const activity = await prisma.post.update({
      where: { id: parseInt(id) },
      data: {
        title,
        content,
        address,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        authorId: authorId ? parseInt(authorId) : null,
        status,
      },
    });

    return NextResponse.json(activity);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update activity" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/activities/[id] - delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to delete activity" },
      { status: 500 }
    );
  }
}
