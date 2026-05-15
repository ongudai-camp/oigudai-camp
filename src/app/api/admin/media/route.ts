import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { isAdmin } from '@/lib/adminAccess';
import { readdir, stat, unlink } from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

interface MediaFile {
  name: string;
  url: string;
  size: number;
  modifiedAt: string;
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const files: MediaFile[] = [];
    const dir = await readdir(UPLOADS_DIR, { withFileTypes: true });

    for (const dirent of dir) {
      if (dirent.isDirectory()) continue;
      const ext = path.extname(dirent.name).toLowerCase();
      if (!['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico'].includes(ext)) continue;

      const filePath = path.join(UPLOADS_DIR, dirent.name);
      const stats = await stat(filePath);

      files.push({
        name: dirent.name,
        url: `/uploads/${dirent.name}`,
        size: stats.size,
        modifiedAt: stats.mtime.toISOString(),
      });
    }

    files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Media error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
    }

    const safeName = path.basename(filename);
    const filePath = path.join(UPLOADS_DIR, safeName);

    await unlink(filePath);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Media DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}
