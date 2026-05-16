import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ wishlist: [] });
    }

    const userId = parseInt(session.user.id);
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        post: {
          include: {
            reviews: {
              select: {
                rating: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({ wishlist });
  } catch (error: any) {
    console.error("Wishlist GET error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id);
    const { postId } = await request.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const item = await prisma.wishlist.upsert({
      where: {
        userId_postId: {
          userId,
          postId: parseInt(postId)
        }
      },
      create: {
        userId,
        postId: parseInt(postId)
      },
      update: {}
    });

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error("Wishlist POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
