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
    const mainKeys = [
      'site_name', 'site_description', 'site_keywords',
      'contact_email', 'contact_phone', 'contact_address',
      'social_vk', 'social_telegram', 'social_youtube',
      'og_title', 'og_description', 'og_image',
      'footer_tagline', 'footer_copyright',
      'map_center_lat', 'map_center_lng', 'map_zoom',
    ];

    const settings = await prisma.setting.findMany({
      where: { key: { in: mainKeys } },
    });

    const map = Object.fromEntries(settings.map(s => [s.key, s.value]));

    return NextResponse.json({ settings: map });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Missing key or value' }, { status: 400 });
    }

    await prisma.setting.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
