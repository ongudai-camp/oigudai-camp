import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const promocodes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json(promocodes);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const promo = await prisma.promoCode.create({
      data: {
        code: body.code,
        discountType: body.discountType || "percent",
        discountValue: parseFloat(body.discountValue),
        minAmount: body.minAmount ? parseFloat(body.minAmount) : null,
        maxUses: body.maxUses ? parseInt(body.maxUses) : null,
        active: body.active !== false,
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
      },
    });
    return NextResponse.json(promo, { status: 201 });
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
    if (data.discountValue) data.discountValue = parseFloat(data.discountValue);
    if (data.minAmount) data.minAmount = parseFloat(data.minAmount);
    if (data.maxUses) data.maxUses = parseInt(data.maxUses);
    if (data.expiresAt) data.expiresAt = new Date(data.expiresAt);
    const promo = await prisma.promoCode.update({ where: { id: parseInt(id) }, data });
    return NextResponse.json(promo);
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
    await prisma.promoCode.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete error" }, { status: 500 });
  }
}
