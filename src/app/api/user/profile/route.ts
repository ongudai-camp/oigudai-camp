import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { 
        id: true, 
        name: true, 
        email: true, 
        phone: true, 
        image: true, 
        role: true, 
        createdAt: true, 
        password: true,
        identityVerified: true,
        citizenship: true
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      hasPassword: !!user.password,
      password: undefined,
    });
  } catch (error: unknown) {
    console.error("Profile GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const body = await request.json();
    const { name, email, phone, image, currentPassword, newPassword } = body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (image !== undefined) updates.image = image;
    const errors: string[] = [];

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length === 0) {
        errors.push("Name is required");
      } else {
        updates.name = name.trim();
      }
    }

    if (email !== undefined && email !== user.email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push("Invalid email format");
      } else {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing && existing.id !== userId) {
          errors.push("Email already in use");
        } else {
          updates.email = email;
        }
      }
    }

    if (phone !== undefined && phone !== user.phone) {
      const digits = phone.replace(/\D/g, "");
      const formatted = "+" + digits;
      const existing = await prisma.user.findFirst({ where: { phone: formatted } });
      if (existing && existing.id !== userId) {
        errors.push("Phone already in use");
      } else {
        updates.phone = formatted;
      }
    }

    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        errors.push("Both current and new password are required");
      } else if (newPassword.length < 6) {
        errors.push("New password must be at least 6 characters");
      } else {
        const storedPassword = user.password;
        if (!storedPassword) {
          errors.push("Cannot change password for phone-only accounts. Set an email first.");
        } else {
          const isValid = await bcrypt.compare(currentPassword, storedPassword);
          if (!isValid) {
            errors.push("Current password is incorrect");
          } else {
            updates.password = await bcrypt.hash(newPassword, 10);
          }
        }
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join(". ") }, { status: 400 });
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ message: "No changes to save" });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updates,
      select: { id: true, name: true, email: true, phone: true, image: true, role: true },
    });

    return NextResponse.json({ message: "Profile updated", user: updated });
  } catch (error: unknown) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update profile" },
      { status: 500 }
    );
  }
}
