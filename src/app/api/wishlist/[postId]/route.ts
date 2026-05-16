import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const postId = parseInt(params.postId);

    await prisma.wishlist.delete({
      where: {
        userId_postId: {
          userId,
          postId
        }
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Wishlist DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
