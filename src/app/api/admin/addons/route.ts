import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const addons = await prisma.addon.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(addons);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const addon = await prisma.addon.create({
      data: {
        postId: parseInt(body.postId),
        title: body.title,
        description: body.description || null,
        price: parseFloat(body.price),
        type: body.type || "extra",
        active: body.active !== false,
      },
    });
    return NextResponse.json(addon, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Create error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (data.price) data.price = parseFloat(data.price);
    if (data.postId) data.postId = parseInt(data.postId);
    const addon = await prisma.addon.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json(addon);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.addon.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete error" }, { status: 500 });
  }
}
