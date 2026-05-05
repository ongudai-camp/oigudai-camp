import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

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
        userId: parseInt((session.user as any).id),
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

// GET - List user bookings
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = parseInt((session.user as any).id);
  const { searchParams } = new URL(request.url);
  const isAdmin = (session.user as any).role === "admin";

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
