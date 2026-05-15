import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const postId = parseInt(searchParams.get("postId") || "0");
  const roomId = searchParams.get("roomId") ? parseInt(searchParams.get("roomId")!) : null;
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const type = searchParams.get("type") || null;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const where: Record<string, unknown> = {
    date: { gte: startDate, lte: endDate },
  };
  if (postId) where.postId = postId;
  if (roomId) where.roomId = roomId;
  if (type && !postId) {
    where.post = { type };
  }

  const availabilities = await prisma.availability.findMany({
    where: where as any,
    orderBy: { date: "asc" },
    include: {
      post: { select: { id: true, title: true, type: true, slug: true } },
      room: { select: { id: true, title: true } },
    },
  });

  return NextResponse.json(availabilities);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, roomId, dates, status, price } = body;

    if (!postId || !dates || !Array.isArray(dates) || dates.length === 0) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const results = [];
    for (const dateStr of dates) {
      const existing = await prisma.availability.findFirst({
        where: {
          postId: parseInt(postId),
          roomId: roomId ? parseInt(roomId) : null,
          date: new Date(dateStr),
        },
      });

      if (existing) {
        const updated = await prisma.availability.update({
          where: { id: existing.id },
          data: {
            ...(status && { status }),
            ...(price !== undefined && { price: parseFloat(price) }),
          },
        });
        results.push(updated);
      } else {
        const created = await prisma.availability.create({
          data: {
            postId: parseInt(postId),
            roomId: roomId ? parseInt(roomId) : null,
            date: new Date(dateStr),
            status: status || "available",
            ...(price !== undefined && { price: parseFloat(price) }),
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json({ count: results.length });
  } catch (error) {
    console.error("Availability update error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
