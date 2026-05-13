import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/adminAccess';

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = Math.min(Math.max(parseInt(searchParams.get('days') || '30'), 1), 365);

  try {
    const [bookingsByDay, usersByDay] = await Promise.all([
      prisma.$queryRaw<Array<{ date: string; count: number; revenue: number }>>`
        SELECT DATE(createdAt) as date,
               CAST(COUNT(*) AS INTEGER) as count,
               CAST(COALESCE(SUM(totalPrice), 0) AS REAL) as revenue
        FROM Booking
        WHERE createdAt >= DATE('now', '-' || ${days} || ' days')
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
      prisma.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT DATE(createdAt) as date,
               CAST(COUNT(*) AS INTEGER) as count
        FROM User
        WHERE createdAt >= DATE('now', '-' || ${days} || ' days')
        GROUP BY DATE(createdAt)
        ORDER BY date ASC
      `,
    ]);

    return NextResponse.json({ bookingsByDay, usersByDay });
  } catch (error) {
    console.error('Timeseries stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
