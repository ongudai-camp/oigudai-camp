import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";
import bcrypt from "bcryptjs";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const role = searchParams.get("role") || "";

  const users = await prisma.user.findMany({
    where: {
      OR: query ? [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ] : undefined,
      role: role && role !== "all" ? role : undefined,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      phoneVerified: true,
      identityVerified: true,
      citizenship: true,
      createdAt: true,
      _count: {
        select: {
          bookings: true,
          identityDocuments: true,
          contracts: true,
        },
      },
    },
  });

  return NextResponse.json(users);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, phone, role, password } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: "Email or phone is required" }, { status: 400 });
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: role || "subscriber",
        password: hashedPassword,
      },
    });

    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("User creation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Creation failed" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { id, role, name, email, phone, phoneVerified, identityVerified, citizenship, password } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (phoneVerified !== undefined) data.phoneVerified = phoneVerified;
    if (identityVerified !== undefined) {
      data.identityVerified = identityVerified;
      if (identityVerified) {
        data.identityVerifiedAt = new Date();
      } else {
        data.identityVerifiedAt = null;
      }
    }
    if (citizenship !== undefined) data.citizenship = citizenship;
    
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data,
    });
    return NextResponse.json(user);
  } catch (error: unknown) {
    console.error("User update error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Update error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.user.delete({ where: { id: parseInt(id) } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Delete error" }, { status: 500 });
  }
}
