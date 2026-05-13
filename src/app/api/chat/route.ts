import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { handleChatMessage, isRuleBotEnabled } from "@/lib/chatbot";

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

    const requestingUserId = parseInt(session.user.id);
    const admin = session.user.role === "admin" || session.user.role === "superadmin";

    if (!admin && requestingUserId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages });
  } catch (error: unknown) {
    console.error("Chat GET error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load messages" },
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

    const requestingUserId = parseInt(session.user.id);
    const admin = session.user.role === "admin" || session.user.role === "superadmin";

    let messageUserId = userId;
    if (admin && targetUserId) {
      messageUserId = targetUserId;
    } else if (!admin) {
      messageUserId = requestingUserId;
    }

    const message = await prisma.chatMessage.create({
      data: {
        userId: messageUserId,
        content,
        isFromUser: isFromUser !== undefined ? isFromUser : !admin,
        isAiGenerated: false,
      },
    });

    const botEnabled = isRuleBotEnabled();

    if (botEnabled && !admin) {
      const recentAdminMessages = await prisma.chatMessage.findFirst({
        where: {
          userId: messageUserId,
          isFromUser: false,
          isAiGenerated: false,
          createdAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
        },
      });

      if (!recentAdminMessages) {
        const reply = await handleChatMessage(content, messageUserId);
        if (reply) {
          const aiMessage = await prisma.chatMessage.create({
            data: {
              userId: messageUserId,
              content: reply,
              isFromUser: false,
              isAiGenerated: true,
            },
          });
          return NextResponse.json({ success: true, message, aiMessage });
        }
      }
    }

    return NextResponse.json({ success: true, message });
  } catch (error: unknown) {
    console.error("Chat POST error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to send message" },
      { status: 500 }
    );
  }
}
