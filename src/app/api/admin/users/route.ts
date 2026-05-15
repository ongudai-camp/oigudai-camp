import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  const users = await prisma.user.findMany({
    where: {
      OR: query ? [
        { name: { contains: query } },
        { email: { contains: query } },
        { phone: { contains: query } },
      ] : undefined,
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
    },
  });

  return NextResponse.json(users);
}
