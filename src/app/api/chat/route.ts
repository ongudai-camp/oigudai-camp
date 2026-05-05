import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const userId = parseInt(searchParams.get("userId") || "0");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // If admin, can view any user's chat
    // If regular user, can only view their own chat
    const requestingUserId = parseInt((session.user as any).id);
    const isAdmin = (session.user as any).role === "admin";

    if (!isAdmin && requestingUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId, content, isFromUser, targetUserId } = body;

    if (!content) {
      return NextResponse.json({ error: "Message content required" }, { status: 400 });
    }

    const requestingUserId = parseInt((session.user as any).id);
    const isAdmin = (session.user as any).role === "admin";

    // Determine who the message is for
    let messageUserId = userId;
    if (isAdmin && targetUserId) {
      // Admin is sending message to a user
      messageUserId = targetUserId;
    } else if (!isAdmin) {
      // Regular user sending message
      messageUserId = requestingUserId;
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: messageUserId,
        content,
        isFromUser: isFromUser !== undefined ? isFromUser : !isAdmin,
      },
    });

    // TODO: Send notification to admin (email, push, etc.)

    return NextResponse.json({ success: true, message });
  } catch (error: any) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send message" },
      { status: 500 }
    );
  }
}
