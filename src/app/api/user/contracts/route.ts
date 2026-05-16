import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const contracts = await prisma.contract.findMany({
      where: { userId },
      orderBy: { signedAt: "desc" },
    });

    return NextResponse.json({ contracts });
  } catch (error: unknown) {
    console.error("User contracts error:", error);
    return NextResponse.json({ error: "Failed to load contracts" }, { status: 500 });
  }
}
