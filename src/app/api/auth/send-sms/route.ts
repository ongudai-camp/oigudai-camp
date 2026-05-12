import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSms } from "@/lib/sms";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, mode } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, "");
    const formattedPhone = "+" + digits;

    if (mode !== "signin") {
      const existingUser = await prisma.user.findFirst({
        where: { phone: formattedPhone },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "User with this phone already exists" },
          { status: 400 }
        );
      }
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await prisma.smsCode.upsert({
      where: { phone: formattedPhone },
      update: { code, createdAt: new Date() },
      create: { phone: formattedPhone, code },
    });

    const message = `Ongudai Camp: ваш код подтверждения ${code}`;
    const result = await sendSms(formattedPhone, message);

    if (!result.success) {
      console.error("SMS send failed:", result.error);
    }

    return NextResponse.json({ success: true, message: "SMS sent" });
  } catch (error: unknown) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send SMS" },
      { status: 500 }
    );
  }
}
