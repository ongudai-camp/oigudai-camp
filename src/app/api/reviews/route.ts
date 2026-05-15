import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { postId, rating, cleanliness, location, staff, value, facilities, title, content } = body;

    if (!postId || !rating) {
      return NextResponse.json({ error: "postId and rating required" }, { status: 400 });
    }

    // Check user has a completed booking for this post
    const completedBooking = await prisma.booking.findFirst({
      where: {
        userId: parseInt(session.user.id),
        postId: parseInt(postId),
        status: "completed",
      },
    });

    // Check existing review
    const existing = await prisma.review.findFirst({
      where: {
        userId: parseInt(session.user.id),
        postId: parseInt(postId),
      },
    });

    if (existing) {
      return NextResponse.json({ error: "You already reviewed this property" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        postId: parseInt(postId),
        userId: parseInt(session.user.id),
        rating: parseInt(rating),
        cleanliness: cleanliness ? parseInt(cleanliness) : null,
        location: location ? parseInt(location) : null,
        staff: staff ? parseInt(staff) : null,
        value: value ? parseInt(value) : null,
        facilities: facilities ? parseInt(facilities) : null,
        title: title || null,
        content: content || null,
        status: "pending",
        verified: !!completedBooking,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const reviews = await prisma.review.findMany({
    where: { postId: parseInt(postId), status: "approved" },
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, image: true } } },
  });

  return NextResponse.json(reviews);
}
