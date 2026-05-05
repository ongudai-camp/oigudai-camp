import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, email, password } = body;

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Phone and password are required" },
        { status: 400 }
      );
    }

    // Format phone
    const digits = phone.replace(/\D/g, "");
    const formattedPhone = digits.startsWith("7") ? "+" + digits : "+7" + digits;

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
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: error.message || "Registration failed" },
      { status: 500 }
    );
  }
}
