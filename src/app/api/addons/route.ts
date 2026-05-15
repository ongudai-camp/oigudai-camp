import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get("postId");

  if (!postId) {
    return NextResponse.json({ error: "postId required" }, { status: 400 });
  }

  const addons = await prisma.addon.findMany({
    where: { postId: parseInt(postId), active: true },
    orderBy: { price: "asc" },
  });

  return NextResponse.json(addons);
}
