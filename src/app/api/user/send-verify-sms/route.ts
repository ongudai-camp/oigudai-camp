import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { sendSms } from "@/lib/sms";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user || !user.phone) {
      return NextResponse.json({ error: "Phone number not found" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit({ key: `user-sms-send:${ip}`, limit: 3, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait." },
        { status: 429 }
      );
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const formattedPhone = user.phone;

    await prisma.smsCode.upsert({
      where: { phone: formattedPhone },
      update: { code, createdAt: new Date() },
      create: { phone: formattedPhone, code },
    });

    await sendSms(formattedPhone, `Код подтверждения Ongudai Camp: ${code}`);

    return NextResponse.json({ success: true, message: "SMS sent" });
  } catch (error: unknown) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}
