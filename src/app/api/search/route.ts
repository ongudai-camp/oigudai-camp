import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") || "";
  const type = searchParams.get("type") || "";
  const priceMin = searchParams.get("priceMin") ? parseFloat(searchParams.get("priceMin")!) : 0;
  const priceMax = searchParams.get("priceMax") ? parseFloat(searchParams.get("priceMax")!) : Infinity;
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const guests = searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : 1;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = { status: "publish" };

  if (query) {
    where.title = { contains: query };
  }

  if (type && ["hotel", "tour", "activity"].includes(type)) {
    where.type = type;
  }

  if (guests > 1) {
    // For hotels, filter posts that have rooms with enough capacity
    if (type === "hotel" || !type) {
      where.rooms = { some: { guests: { gte: guests } } };
    }
  }

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        rooms: { select: { id: true, title: true, price: true, salePrice: true, guests: true } },
        meta: true,
        reviews: { where: { status: "approved" }, select: { rating: true } },
      },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  const results = posts.map((post) => {
    const avgRating = post.reviews.length > 0
      ? post.reviews.reduce((sum, r) => sum + r.rating, 0) / post.reviews.length
      : 0;
    const minRoomPrice = post.rooms.length > 0
      ? Math.min(...post.rooms.map((r) => r.salePrice || r.price))
      : post.price;

    let available = true;

    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      type: post.type,
      excerpt: post.excerpt,
      featuredImage: post.featuredImage,
      price: post.salePrice || post.price,
      minRoomPrice: post.type === "hotel" ? minRoomPrice : null,
      currency: post.currency,
      rating: avgRating,
      reviewCount: post.reviews.length,
      address: post.address,
      latitude: post.latitude,
      longitude: post.longitude,
      rooms: post.rooms,
      available,
    };
  });

  return NextResponse.json({
    results,
    pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}
