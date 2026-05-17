import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const year = parseInt(searchParams.get("year") || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get("month") || String(new Date().getMonth() + 1));
  const type = searchParams.get("type") || null;
  const postId = searchParams.get("postId") ? parseInt(searchParams.get("postId")!) : null;
  
  // New filters
  const q = searchParams.get("q") || "";
  const minPrice = searchParams.get("minPrice") ? parseInt(searchParams.get("minPrice")!) : null;
  const maxPrice = searchParams.get("maxPrice") ? parseInt(searchParams.get("maxPrice")!) : null;
  const guests = searchParams.get("guests") ? parseInt(searchParams.get("guests")!) : 1;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  const postWhere: any = { status: "publish" };
  if (type) postWhere.type = type;
  if (postId) postWhere.id = postId;
  
  if (q) {
    postWhere.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (minPrice !== null || maxPrice !== null) {
    postWhere.price = {};
    if (minPrice !== null) postWhere.price.gte = minPrice;
    if (maxPrice !== null) postWhere.price.lte = maxPrice;
  }

  if (type === "hotel" && guests > 1) {
    postWhere.rooms = {
      some: {
        guests: { gte: guests }
      }
    };
  }

  const posts = await prisma.post.findMany({
    where: postWhere,
    select: {
      id: true,
      title: true,
      type: true,
      slug: true,
      price: true,
      featuredImage: true,
      rating: true,
      reviewCount: true,
      rooms: {
        select: { id: true, title: true, price: true, guests: true },
      },
    },
  });

  const availabilityRecords = await prisma.availability.findMany({
    where: {
      postId: postId ? postId : postWhere.id ? undefined : { not: undefined },
      date: { gte: startDate, lte: endDate },
      ...(postId ? {} : { post: { status: "publish" } }),
    },
    include: {
      post: { select: { id: true, title: true, type: true, slug: true, featuredImage: true } },
      room: { select: { id: true, title: true, price: true } },
    },
    orderBy: { date: "asc" },
  });

  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ["confirmed", "pending"] },
      postId: postId ? postId : { not: undefined },
      ...(type ? { post: { type } } : {}),
      OR: [
        { checkIn: { lte: endDate } },
        { checkOut: { gte: startDate } },
      ],
    },
    include: {
      post: { select: { id: true, title: true, type: true, slug: true } },
      room: { select: { id: true, title: true } },
    },
  });

  const datesMap = new Map<string, {
    availabilities: typeof availabilityRecords;
    bookings: typeof bookings;
  }>();

  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    datesMap.set(dateStr, { availabilities: [], bookings: [] });
  }

  for (const rec of availabilityRecords) {
    const dateStr = rec.date.toISOString().split("T")[0];
    if (datesMap.has(dateStr)) {
      datesMap.get(dateStr)!.availabilities.push(rec);
    }
  }

  for (const booking of bookings) {
    const checkIn = booking.checkIn.toISOString().split("T")[0];
    const checkOut = booking.checkOut
      ? booking.checkOut.toISOString().split("T")[0]
      : checkIn;

    for (const [dateStr] of datesMap) {
      if (dateStr >= checkIn && dateStr < checkOut) {
        datesMap.get(dateStr)!.bookings.push(booking);
      }
    }
  }

  const today = new Date().toISOString().split("T")[0];

  const dates: Record<string, {
    status: string;
    properties: Record<string, Array<{
      id: number;
      title: string;
      type: string;
      slug: string;
      image: string | null;
      status: string;
      price: number | null;
      roomCount: number;
    }>>;
    totalAvailable: number;
    totalBooked: number;
    minPrice: number | null;
  }> = {};

  let totalDatesAvailable = 0;
  let totalDatesLimited = 0;
  let totalDatesFull = 0;

  for (const [dateStr, data] of datesMap) {
    const isPast = dateStr < today;
    if (isPast) {
      dates[dateStr] = {
        status: "past",
        properties: { hotels: [], tours: [], activities: [] },
        totalAvailable: 0,
        totalBooked: 0,
        minPrice: null,
      };
      continue;
    }

    const bookedPostIds = new Set(data.bookings.map(b => b.postId));
    const availPostIds = new Set(data.availabilities.map(a => a.postId));
    const allPostIds = new Set([...bookedPostIds, ...availPostIds]);

    const propertiesMap = new Map<string, {
      id: number;
      title: string;
      type: string;
      slug: string;
      image: string | null;
      status: string;
      price: number | null;
      roomCount: number;
    }>();

    for (const post of posts) {
      propertiesMap.set(`${post.type}-${post.id}`, {
        id: post.id,
        title: post.title,
        type: post.type,
        slug: post.slug,
        image: post.featuredImage,
        status: "available",
        price: post.price,
        roomCount: post.rooms.length,
      });
    }

    for (const avail of data.availabilities) {
      if (!avail.post) continue;
      const key = `${avail.post.type}-${avail.post.id}`;
      if (propertiesMap.has(key)) {
        const prop = propertiesMap.get(key)!;
        if (avail.status === "booked" || avail.status === "blocked") {
          prop.status = "booked";
        }
        if (avail.price !== null && (prop.price === null || avail.price < prop.price)) {
          prop.price = avail.price;
        }
      } else {
        propertiesMap.set(key, {
          id: avail.post.id,
          title: avail.post.title,
          type: avail.post.type,
          slug: avail.post.slug,
          image: avail.post.featuredImage,
          status: avail.status === "booked" || avail.status === "blocked" ? "booked" : "available",
          price: avail.price,
          roomCount: 0,
        });
      }
    }

    for (const booking of data.bookings) {
      const key = `${booking.post.type}-${booking.post.id}`;
      if (propertiesMap.has(key)) {
        const prop = propertiesMap.get(key)!;
        if (!data.availabilities.some(a => a.postId === booking.postId && a.status === "available")) {
          prop.status = "booked";
        }
      } else {
        propertiesMap.set(key, {
          id: booking.post.id,
          title: booking.post.title,
          type: booking.post.type,
          slug: booking.post.slug,
          image: null,
          status: "booked",
          price: null,
          roomCount: 0,
        });
      }
    }

    const grouped: Record<string, typeof propertiesMap extends Map<string, infer V> ? V[] : never[]> = {
      hotels: [],
      tours: [],
      activities: [],
    };

    let availableCount = 0;
    let bookedCount = 0;
    let minPrice: number | null = null;

    for (const prop of propertiesMap.values()) {
      const groupKey = prop.type === "hotel" ? "hotels" : prop.type === "tour" ? "tours" : "activities";
      grouped[groupKey].push(prop);
      if (prop.status === "booked") bookedCount++;
      else availableCount++;
      if (prop.price !== null && (minPrice === null || prop.price < minPrice)) {
        minPrice = prop.price;
      }
    }

    const dateStatus = bookedCount === 0 ? "available" : availableCount === 0 ? "full" : "limited";
    if (dateStatus === "available") totalDatesAvailable++;
    else if (dateStatus === "limited") totalDatesLimited++;
    else if (dateStatus === "full") totalDatesFull++;

    dates[dateStr] = {
      status: dateStatus,
      properties: grouped as any,
      totalAvailable: availableCount,
      totalBooked: bookedCount,
      minPrice,
    };
  }

  return NextResponse.json({
    year,
    month,
    dates,
    summary: {
      totalProperties: posts.length,
      availableDates: totalDatesAvailable,
      limitedDates: totalDatesLimited,
      fullDates: totalDatesFull,
    },
  });
}
