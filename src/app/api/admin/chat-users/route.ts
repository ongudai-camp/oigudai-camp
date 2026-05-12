import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/adminAccess";

export async function GET(_request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get all users who have chatted
    const usersWithChats = await prisma.user.findMany({
      where: {
        chatMessages: {
          some: {},
        },
      },
      include: {
        chatMessages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: {
        chatMessages: {
          _count: "desc",
        },
      },
    });

    // Format response
    const formattedUsers = usersWithChats.map((user) => ({
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      lastMessage: user.chatMessages[0]?.content || "Нет сообщений",
      lastMessageTime: user.chatMessages[0]?.createdAt || new Date(),
    }));

    return NextResponse.json({ users: formattedUsers });
  } catch (error: unknown) {
    console.error("Chat users error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to load chat users" },
      { status: 500 }
    );
  }
}
