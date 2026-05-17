import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";
import { updatePostRating } from "@/lib/reviews";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";
  const where: { status?: string } = {};
  if (status !== "all") where.status = status;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, email: true } }, post: { select: { title: true, type: true } } },
  });
  return NextResponse.json(reviews);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, status, verified } = body;
    const data: { status?: string; verified?: boolean } = {};
    if (status) data.status = status;
    if (verified !== undefined) data.verified = verified;
    
    const review = await prisma.review.update({ 
      where: { id: parseInt(id) }, 
      data 
    });

    if (status) {
      await updatePostRating(review.postId);
    }

    return NextResponse.json(review);
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
    
    const review = await prisma.review.findUnique({
      where: { id: parseInt(id) },
      select: { postId: true }
    });

    await prisma.review.delete({ where: { id: parseInt(id) } });
    
    if (review) {
      await updatePostRating(review.postId);
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete error" }, { status: 500 });
  }
}
