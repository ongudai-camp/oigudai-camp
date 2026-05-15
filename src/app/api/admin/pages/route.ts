import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/adminAccess';

const PAGE_SLUGS = ['about', 'terms', 'privacy-policy'];
const LOCALES = ['ru', 'en', 'kk'];

interface PageContent {
  [key: string]: string | Record<string, string>;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const keys = PAGE_SLUGS.flatMap(slug =>
      LOCALES.map(locale => `page_${slug}_${locale}`)
    );

    const settings = await prisma.setting.findMany({
      where: { key: { in: keys } },
    });

    const settingMap = new Map(settings.map(s => [s.key, s.value]));

    const pages = PAGE_SLUGS.map(slug => {
      const contentByLocale: Record<string, PageContent | null> = {};
      for (const locale of LOCALES) {
        const val = settingMap.get(`page_${slug}_${locale}`);
        contentByLocale[locale] = val ? JSON.parse(val) : null;
      }
      return { slug, content: contentByLocale };
    });

    return NextResponse.json({ pages });
  } catch (error) {
    console.error('Pages error:', error);
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
    const { slug, locale, content } = body;

    if (!slug || !locale || !content) {
      return NextResponse.json({ error: 'Missing required fields: slug, locale, content' }, { status: 400 });
    }

    if (!PAGE_SLUGS.includes(slug)) {
      return NextResponse.json({ error: `Invalid slug: ${slug}` }, { status: 400 });
    }

    if (!LOCALES.includes(locale)) {
      return NextResponse.json({ error: `Invalid locale: ${locale}` }, { status: 400 });
    }

    const key = `page_${slug}_${locale}`;
    const value = JSON.stringify(content);

    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pages PUT error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
