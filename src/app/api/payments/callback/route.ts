import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { object } = body;

    if (!object || !object.metadata?.bookingId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const bookingId = object.metadata.bookingId;
    const paymentStatus = object.status;

    const booking = await prisma.booking.findUnique({
      where: { bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (paymentStatus === "succeeded") {
      await prisma.booking.update({
        where: { bookingId },
        data: {
          paymentStatus: "paid",
          status: "confirmed",
        },
      });

      await prisma.bookingPayment.updateMany({
        where: { bookingId: booking.id, transactionId: object.id },
        data: { status: "completed" },
      });

      await prisma.bookingTimeline.create({
        data: {
          bookingId: booking.id,
          fromStatus: booking.status,
          toStatus: "confirmed",
          note: "Оплата получена через YooKassa",
        },
      });
    } else if (paymentStatus === "canceled" || paymentStatus === "refunded") {
      await prisma.booking.update({
        where: { bookingId },
        data: {
          paymentStatus: paymentStatus === "refunded" ? "refunded" : "unpaid",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment callback error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
