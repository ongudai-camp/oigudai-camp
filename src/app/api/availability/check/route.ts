import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = parseInt(searchParams.get("postId") || "0");
    const roomId = searchParams.get("roomId") ? parseInt(searchParams.get("roomId")!) : null;
    const checkIn = searchParams.get("checkIn");
    const checkOut = searchParams.get("checkOut") || null;

    if (!postId || !checkIn) {
      return NextResponse.json(
        { error: "postId and checkIn are required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = {
      postId,
      status: { notIn: ["cancelled"] },
    };

    if (roomId) where.roomId = roomId;

    if (checkOut) {
      where.checkIn = { lt: new Date(checkOut) };
      where.checkOut = { gt: new Date(checkIn) };
    } else {
      where.checkIn = new Date(checkIn);
    }

    const conflict = await prisma.booking.findFirst({ where: where as any });

    if (conflict) {
      const conflictStart = conflict.checkIn.toISOString().split("T")[0];
      const conflictEnd = conflict.checkOut
        ? conflict.checkOut.toISOString().split("T")[0]
        : null;
      return NextResponse.json({
        available: false,
        conflict: `Already booked${
          conflictEnd
            ? ` from ${conflictStart} to ${conflictEnd}`
            : ` on ${conflictStart}`
        }`,
      });
    }

    return NextResponse.json({ available: true });
  } catch (error) {
    console.error("Availability check error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
