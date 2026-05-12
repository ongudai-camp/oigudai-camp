import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
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
