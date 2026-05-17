import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) },
      include: {
        bookings: {
          orderBy: { createdAt: "desc" },
          include: {
            post: true,
            room: true,
          },
        },
        identityDocuments: {
          orderBy: { uploadedAt: "desc" },
        },
        contracts: {
          orderBy: { signedAt: "desc" },
          include: {
            booking: {
              include: {
                post: true,
              },
            },
          },
        },
        _count: {
          select: {
            bookings: true,
            identityDocuments: true,
            contracts: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error: unknown) {
    console.error("Fetch user error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Fetch failed" },
      { status: 500 }
    );
  }
}
