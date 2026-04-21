import { NextRequest, NextResponse } from 'next/server';
import { LinkPreviewService, InvalidUrlError } from '@/services/linkPreview.service';

export const runtime = 'edge';
export const revalidate = 86400;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  if (!url) return NextResponse.json({ error: 'url required' }, { status: 400 });

  let result;
  try {
    result = await LinkPreviewService.get(url);
  } catch (err) {
    if (err instanceof InvalidUrlError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }

  if (result.isFallback) {
    return NextResponse.json(result.data, {
      headers: { 'cache-control': 'public, max-age=3600' },
    });
  }

  return NextResponse.json(result.data, {
    headers: { 'cache-control': 'public, max-age=86400, s-maxage=86400' },
  });
}
