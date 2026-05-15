import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const rl = rateLimit({ key: `register:${ip}`, limit: 10, windowMs: 60_000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: "Слишком много запросов. Попробуйте через минуту." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.resetInMs / 1000)) } }
      );
    }

    const body = await request.json();
    const { name, phone, email, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    const digits = phone.replace(/\D/g, "");
    const formattedPhone = "+" + digits;

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: formattedPhone },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this phone or email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        phone: formattedPhone,
        phoneVerified: true, // Already verified via SMS
        email: email || null,
        password: hashedPassword,
        role: "subscriber",
      },
    });

    return NextResponse.json({
      success: true,
      userId: user.id,
    });
  } catch (error: unknown) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Registration failed" },
      { status: 500 }
    );
  }
}
