import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit({ key: `sms-verify:${ip}`, limit: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Слишком много попыток. Попробуйте через минуту." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { phone, code } = body;

    if (!phone || !code) {
      return NextResponse.json(
        { error: "Phone and code are required" },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, "");
    const formattedPhone = "+" + digits;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    const smsCode = await prisma.smsCode.findUnique({
      where: { phone: formattedPhone },
    });

    if (!smsCode || smsCode.code !== code || smsCode.createdAt < fiveMinutesAgo) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Generate one-time sign-in token (replace SMS code with sign-in token)
    const signInToken = crypto.randomUUID();
    await prisma.smsCode.upsert({
      where: { phone: formattedPhone },
      update: { code: signInToken, createdAt: new Date() },
      create: { phone: formattedPhone, code: signInToken },
    });

    return NextResponse.json({ success: true, verified: true, signInToken });
  } catch (error: unknown) {
    console.error("SMS verification error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
