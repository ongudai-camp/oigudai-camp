import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { error: "Phone number is required" },
        { status: 400 }
      );
    }

    // Format phone number (remove all non-digits, ensure +7)
    const digits = phone.replace(/\D/g, "");
    const formattedPhone = digits.startsWith("7") ? "+" + digits : "+7" + digits;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { phone: formattedPhone },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone already exists" },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send SMS via SMS service (Twilio, SMS.ru, etc.)
    // For now, we'll just log it and store in a temporary table or cache
    console.log(`SMS code for ${formattedPhone}: ${code}`);

    // Store code in database or cache (for demo, using a simple approach)
    // In production, use Redis or similar with expiration
    await prisma.$executeRaw`
      INSERT OR REPLACE INTO sms_codes (phone, code, created_at)
      VALUES (${formattedPhone}, ${code}, datetime('now'))
    `.catch(async (err) => {
      // Create table if not exists
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS sms_codes (
          phone TEXT PRIMARY KEY,
          code TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await prisma.$executeRaw`
        INSERT OR REPLACE INTO sms_codes (phone, code, created_at)
        VALUES (${formattedPhone}, ${code}, datetime('now'))
      `;
    });

    return NextResponse.json({ success: true, message: "SMS sent" });
  } catch (error: any) {
    console.error("SMS send error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}
