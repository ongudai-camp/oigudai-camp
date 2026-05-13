import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const packages = await prisma.package.findMany({
      orderBy: { price: "asc" },
      include: { _count: { select: { userPackages: true } } },
    });
    return NextResponse.json({ packages });
  } catch (error) {
    console.error("Packages API error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, price, duration, postsLimit, featured } = body;

    if (!name || price === undefined || !duration) {
      return NextResponse.json({ error: "Name, price, and duration are required" }, { status: 400 });
    }

    const pkg = await prisma.package.create({
      data: {
        name,
        price: parseFloat(price),
        duration: parseInt(duration),
        postsLimit: postsLimit !== undefined ? parseInt(postsLimit) : 0,
        featured: featured || false,
      },
    });

    return NextResponse.json({ package: pkg });
  } catch (error: unknown) {
    console.error("Package create error:", error);
    if (error && typeof error === "object" && "code" in error && (error as { code: string }).code === "P2002") {
      return NextResponse.json({ error: "Пакет с таким названием уже существует" }, { status: 409 });
    }
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
