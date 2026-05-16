import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.phone) {
      return NextResponse.json({ error: "User or phone not found" }, { status: 404 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit({ key: `user-sms-verify:${ip}`, limit: 5, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Please wait." },
        { status: 429 }
      );
    }

    const smsCode = await prisma.smsCode.findUnique({
      where: { phone: user.phone },
    });

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (!smsCode || smsCode.code !== code || smsCode.createdAt < fiveMinutesAgo) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    await prisma.smsCode.delete({
      where: { phone: user.phone },
    });

    await prisma.user.update({
      where: { id: userId },
      data: { phoneVerified: true },
    });

    return NextResponse.json({ success: true, message: "Phone verified" });
  } catch (error: unknown) {
    console.error("SMS verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
