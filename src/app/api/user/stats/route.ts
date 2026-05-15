import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId = parseInt(session.user.id);
    const bookings = await prisma.booking.findMany({
      where: { userId },
      select: { status: true, totalPrice: true },
    });

    return NextResponse.json({
      totalBookings: bookings.length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      pending: bookings.filter((b) => b.status === "pending").length,
      totalSpent: bookings.reduce((sum, b) => sum + b.totalPrice, 0),
    });
  } catch (error) {
    console.error("User stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
