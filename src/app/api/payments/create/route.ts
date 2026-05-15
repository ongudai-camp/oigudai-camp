import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { createPayment } from "@/lib/payment";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { bookingId } = body;

    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(bookingId) },
      include: { post: { select: { title: true } } },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== parseInt(session.user.id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (booking.paymentStatus === "paid") {
      return NextResponse.json({ error: "Already paid" }, { status: 400 });
    }

    const result = await createPayment(
      booking.totalPrice,
      booking.bookingId,
      `Бронирование ${booking.bookingId}: ${booking.post.title}`
    );

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    if (result.paymentId) {
      await prisma.bookingPayment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalPrice,
          method: "yookassa",
          status: "pending",
          transactionId: result.paymentId,
        },
      });
    }

    return NextResponse.json({ paymentUrl: result.paymentUrl, paymentId: result.paymentId });
  } catch (error) {
    console.error("Payment creation error:", error);
    return NextResponse.json({ error: "Ошибка создания платежа" }, { status: 500 });
  }
}
