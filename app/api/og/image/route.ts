import { NextRequest } from 'next/server';
import sharp from 'sharp';
import { OG_IMAGE_CACHE_CONTROL, SHARE_IMAGE_HOSTS } from '@/lib/metadata';

export const runtime = 'nodejs';

const MAX_DIMENSION = 1200;

/**
 * Serves an uploaded image as a link-card image: a JPEG of at most 1200px, so
 * social crawlers download ~150KB instead of a multi-megabyte original.
 */
export async function GET(request: NextRequest) {
  let source: URL;
  try {
    source = new URL(request.nextUrl.searchParams.get('url') ?? '');
  } catch {
    return new Response('Invalid url', { status: 400 });
  }
  if (source.protocol !== 'https:' || !SHARE_IMAGE_HOSTS.includes(source.hostname)) {
    return new Response('Unsupported image host', { status: 400 });
  }

  const upstream = await fetch(source, { signal: AbortSignal.timeout(10_000) });
  if (!upstream.ok) {
    return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
  }

  try {
    const jpeg = await sharp(Buffer.from(await upstream.arrayBuffer()))
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: 80, mozjpeg: true })
      .toBuffer();

    return new Response(new Uint8Array(jpeg), {
      headers: { 'Content-Type': 'image/jpeg', 'Cache-Control': OG_IMAGE_CACHE_CONTROL },
    });
  } catch {
    // Not something sharp can decode; the original still works as a card.
    return Response.redirect(source, 307);
  }
}
