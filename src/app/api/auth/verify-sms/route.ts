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

    // Format phone number
    const digits = phone.replace(/\D/g, "");
    const formattedPhone = digits.startsWith("7") ? "+" + digits : "+7" + digits;

    // Check code
    const result = await prisma.$queryRaw<Array<{ phone: string; code: string; created_at: string }>>`
      SELECT * FROM sms_codes
      WHERE phone = ${formattedPhone} AND code = ${code}
      AND datetime(created_at) > datetime('now', '-5 minutes')
    `;

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired code" },
        { status: 400 }
      );
    }

    // Delete used code
    await prisma.$executeRaw`
      DELETE FROM sms_codes WHERE phone = ${formattedPhone}
    `;

    return NextResponse.json({ success: true, verified: true });
  } catch (error: any) {
    console.error("SMS verification error:", error);
    return NextResponse.json(
      { error: error.message || "Verification failed" },
      { status: 500 }
    );
  }
}
