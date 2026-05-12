import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const locale = searchParams.get('locale') || 'ru';
  const limit = parseInt(searchParams.get('limit') || '10');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: 'publish',
    locale,
  };

  if (type) {
    where.type = type;
  }

  try {
    const posts = await prisma.post.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('API Posts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
