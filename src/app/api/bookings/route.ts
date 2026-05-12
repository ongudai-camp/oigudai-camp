import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

// POST - Create new booking
export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      postId,
      roomId,
      checkIn,
      checkOut,
      guests,
      totalPrice,
    } = body;

    // Generate unique booking ID
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        userId: parseInt(session.user.id),
        postId: parseInt(postId),
        roomId: roomId ? parseInt(roomId) : null,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: parseInt(guests) || 1,
        totalPrice: parseFloat(totalPrice),
        status: "pending",
        paymentStatus: "unpaid",
      },
      include: {
        post: true,
        room: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Ошибка создания бронирования" },
      { status: 500 }
    );
  }
}

// PATCH - Update booking (cancel)
export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId, status, paymentStatus } = body;

    const userId = parseInt(session.user.id);
    const isAdmin = session.user.role === "admin";

    // Verify ownership
    const existing = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
    });

    if (!existing) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (!isAdmin && existing.userId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const booking = await prisma.booking.update({
      where: { id: parseInt(bookingId) },
      data: {
        ...(status && { status }),
        ...(paymentStatus && { paymentStatus }),
      },
      include: { post: true, room: true },
    });

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking update error:", error);
    return NextResponse.json(
      { error: "Ошибка обновления бронирования" },
      { status: 500 }
    );
  }
}

// GET - List user bookings
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const { searchParams } = new URL(request.url);
  const isAdmin = session.user.role === "admin";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = isAdmin ? {} : { userId };

  if (searchParams.get("status")) {
    where.status = searchParams.get("status");
  }

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      post: true,
      room: true,
      user: true,
    },
  });

  return NextResponse.json(bookings);
}
