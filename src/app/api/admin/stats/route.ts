import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/adminAccess';

export async function GET() {
  const session = await auth();

  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const [totalHotels, totalTours, totalActivities, totalBookings, totalUsers, bookingStats] = await Promise.all([
      prisma.post.count({ where: { type: 'hotel' } }),
      prisma.post.count({ where: { type: 'tour' } }),
      prisma.post.count({ where: { type: 'activity' } }),
      prisma.booking.count(),
      prisma.user.count(),
      Promise.all([
        prisma.booking.count(),
        prisma.booking.count({ where: { status: 'confirmed' } }),
        prisma.booking.count({ where: { status: 'pending' } }),
        prisma.booking.aggregate({ _sum: { totalPrice: true } }),
      ]),
    ]);

    return NextResponse.json({
      hotels: totalHotels,
      tours: totalTours,
      activities: totalActivities,
      bookings: totalBookings,
      users: totalUsers,
      bookingStats: {
        total: bookingStats[0],
        confirmed: bookingStats[1],
        pending: bookingStats[2],
        revenue: bookingStats[3]._sum.totalPrice ?? 0,
      },
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
