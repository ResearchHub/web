import { NextRequest, NextResponse } from 'next/server';

const BACKEND_UNSUBSCRIBE_PATH = '/api/email/unsubscribe/';

export const dynamic = 'force-dynamic';

function getBackendUnsubscribeUrl(request: NextRequest): URL | null {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return null;
  }

  const backendUrl = new URL(BACKEND_UNSUBSCRIBE_PATH, apiUrl);
  backendUrl.search = request.nextUrl.search;
  return backendUrl;
}

export async function POST(request: NextRequest): Promise<Response> {
  const backendUrl = getBackendUnsubscribeUrl(request);
  if (!backendUrl) {
    return NextResponse.json(
      { detail: 'Email unsubscribe service is unavailable.' },
      { status: 503 }
    );
  }

  const headers = new Headers({ Accept: 'application/json' });
  const contentType = request.headers.get('content-type');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }

  let backendResponse: Response;
  try {
    backendResponse = await fetch(backendUrl, {
      method: 'POST',
      headers,
      body: await request.arrayBuffer(),
      cache: 'no-store',
      redirect: 'manual',
    });
  } catch {
    return NextResponse.json(
      { detail: 'Email unsubscribe service is unavailable.' },
      { status: 503 }
    );
  }

  if (backendResponse.status >= 300 && backendResponse.status < 400) {
    return NextResponse.json(
      { detail: 'Email unsubscribe service returned an invalid redirect.' },
      { status: 502 }
    );
  }

  const responseHeaders = new Headers({
    'Cache-Control': 'no-store',
  });
  const responseContentType = backendResponse.headers.get('content-type');
  if (responseContentType) {
    responseHeaders.set('Content-Type', responseContentType);
  }

  return new Response(backendResponse.body, {
    status: backendResponse.status,
    headers: responseHeaders,
  });
}
