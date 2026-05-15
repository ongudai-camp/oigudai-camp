import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";
import { notifyBookingStatusChanged } from "@/lib/notifications";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const skip = (page - 1) * limit;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (status && status !== "all") {
    where.status = status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        post: true,
        user: true,
        room: true,
      },
      skip,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return NextResponse.json({
    bookings,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { userId, postId, roomId, checkIn, checkOut, guests, totalPrice, status, paymentStatus } = body;
    const bookingId = "ADM-" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase();

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        userId: parseInt(userId),
        postId: parseInt(postId),
        roomId: roomId ? parseInt(roomId) : null,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: parseInt(guests) || 1,
        totalPrice: parseFloat(totalPrice),
        status: status || "pending",
        paymentStatus: paymentStatus || "unpaid",
      },
    });
    return NextResponse.json(booking, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Create error" }, { status: 500 });
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
    await prisma.booking.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status, paymentStatus } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const existing = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { post: true, user: true },
    });

    const booking = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    if (existing && status && existing.status !== status) {
      notifyBookingStatusChanged({
        id: existing.id,
        bookingId: existing.bookingId,
        userId: existing.userId,
        status,
        totalPrice: existing.totalPrice,
        post: existing.post,
        user: existing.user,
      }, existing.status);
    }

    return NextResponse.json(booking);
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Booking error" }, { status: 500 });
  }
}
