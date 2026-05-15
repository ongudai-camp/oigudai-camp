import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notifyBookingCreated, notifyBookingStatusChanged, notifyAdminNewBooking } from "@/lib/notifications";

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
      specialRequests,
      guestName,
      guestEmail,
      guestPhone,
      promoCode,
      discountAmount,
      addonIds,
    } = body;

    // Calculate addon total
    let addonsTotal = 0;
    let addonData: { id: number; title: string; price: number }[] = [];
    if (addonIds && Array.isArray(addonIds) && addonIds.length > 0) {
      const addons = await prisma.addon.findMany({
        where: { id: { in: addonIds }, active: true },
      });
      addonsTotal = addons.reduce((sum, a) => sum + a.price, 0);
      addonData = addons.map((a) => ({ id: a.id, title: a.title, price: a.price }));
    }

    // Generate unique booking ID
    const bookingId = `BK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const finalPrice = parseFloat(totalPrice) + addonsTotal - (parseFloat(discountAmount) || 0);

    const booking = await prisma.booking.create({
      data: {
        bookingId,
        userId: parseInt(session.user.id),
        postId: parseInt(postId),
        roomId: roomId ? parseInt(roomId) : null,
        checkIn: new Date(checkIn),
        checkOut: checkOut ? new Date(checkOut) : null,
        guests: parseInt(guests) || 1,
        totalPrice: Math.max(0, finalPrice),
        specialRequests: specialRequests || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        promoCode: promoCode || null,
        discountAmount: parseFloat(discountAmount) || 0,
        addons: addonData.length > 0 ? JSON.stringify(addonData) : null,
        status: "pending",
        paymentStatus: "unpaid",
      },
      include: {
        post: true,
        room: true,
        user: true,
      },
    });

    notifyBookingCreated({
      id: booking.id,
      bookingId: booking.bookingId,
      userId: booking.userId,
      status: booking.status,
      totalPrice: booking.totalPrice,
      post: booking.post,
      user: booking.user,
    });

    notifyAdminNewBooking({
      id: booking.id,
      bookingId: booking.bookingId,
      userId: booking.userId,
      status: booking.status,
      totalPrice: booking.totalPrice,
      post: booking.post,
      user: booking.user,
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
      include: { post: true },
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
      include: { post: true, room: true, user: true },
    });

    if (status && existing.status !== status) {
      notifyBookingStatusChanged({
        id: existing.id,
        bookingId: existing.bookingId,
        userId: existing.userId,
        status,
        totalPrice: existing.totalPrice,
        post: existing.post,
        user: booking.user,
      }, existing.status);
    }

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
