import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.postMeta.findMany({
      where: { key: "category" },
      select: { value: true },
      distinct: ["value"],
    });

    return NextResponse.json(categories.map((c) => c.value).filter(Boolean));
  } catch (error) {
    console.error("API Categories Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
