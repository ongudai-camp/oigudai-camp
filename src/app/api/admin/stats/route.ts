import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

export async function GET() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalHotels, totalTours, totalActivities, totalBookings, totalUsers] = await Promise.all([
      prisma.post.count({ where: { type: 'hotel' } }),
      prisma.post.count({ where: { type: 'tour' } }),
      prisma.post.count({ where: { type: 'activity' } }),
      prisma.booking.count(),
      prisma.user.count(),
    ]);

    return NextResponse.json({
      hotels: totalHotels,
      tours: totalTours,
      activities: totalActivities,
      bookings: totalBookings,
      users: totalUsers,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
