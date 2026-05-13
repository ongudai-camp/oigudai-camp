import { prisma } from "./prisma";

export interface PriceInput {
  postId: number;
  roomId?: number | null;
  checkIn: Date;
  checkOut?: Date | null;
  guests: number;
}

export interface PriceResult {
  totalPrice: number;
  breakdown: string;
}

export async function calculatePrice(input: PriceInput): Promise<PriceResult> {
  const post = await prisma.post.findUnique({
    where: { id: input.postId },
    include: input.roomId ? { rooms: true } : undefined,
  });

  if (!post) {
    throw new Error("Post not found");
  }

  if (post.status !== "publish") {
    throw new Error("This listing is not available for booking");
  }

  if (input.roomId) {
    const room = await prisma.room.findUnique({ where: { id: input.roomId } });
    if (!room) throw new Error("Room not found");
    if (!input.checkOut) throw new Error("Check-out date is required for hotel booking");

    const nights = Math.max(1, Math.ceil(
      (input.checkOut.getTime() - input.checkIn.getTime()) / (1000 * 60 * 60 * 24)
    ));
    const rate = room.salePrice || room.price;
    return {
      totalPrice: rate * nights,
      breakdown: `${rate} ₽ × ${nights} ночей`,
    };
  }

  const rate = post.salePrice || post.price;
  return {
    totalPrice: rate * input.guests,
    breakdown: `${rate} ₽ × ${input.guests} чел.`,
  };
}

export async function checkAvailability(input: {
  postId: number;
  roomId?: number | null;
  checkIn: Date;
  checkOut?: Date | null;
}): Promise<{ available: boolean; conflict?: string }> {
  const where: Record<string, unknown> = {
    postId: input.postId,
    status: { notIn: ["cancelled"] },
  };

  if (input.roomId) {
    where.roomId = input.roomId;
  }

  if (input.checkOut) {
    where.checkIn = { lt: input.checkOut };
    where.checkOut = { gt: input.checkIn };
  } else {
    where.checkIn = input.checkIn;
  }

  const conflict = await prisma.booking.findFirst({ where: where as any });

  if (conflict) {
    return {
      available: false,
      conflict: `Already booked from ${conflict.checkIn.toISOString().split("T")[0]}` +
        (conflict.checkOut ? ` to ${conflict.checkOut.toISOString().split("T")[0]}` : ""),
    };
  }

  return { available: true };
}

export async function cancelExpiredBookings(): Promise<number> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const result = await prisma.booking.updateMany({
    where: {
      status: "pending",
      createdAt: { lt: cutoff },
    },
    data: { status: "cancelled" },
  });
  return result.count;
}
