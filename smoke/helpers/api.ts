import type { Page } from '@playwright/test';

/**
 * The Django API is on a different origin to the app, and ApiClient sends
 * `Content-Type: application/json`, which is not CORS-safelisted. That means
 * every POST is preceded by a preflight the browser will not skip, and a
 * fulfilled response is discarded unless it authorises the app's origin.
 */
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': '*',
};

/** A request captured by {@link mockApiPost}, for asserting what was sent. */
export interface CapturedRequest {
  body: Record<string, unknown>;
}

/**
 * Intercepts POSTs to an API path and answers them without reaching Django.
 *
 * For endpoints whose side effects are unacceptable in a suite that runs
 * against a shared environment on every pull request: registering would leave
 * behind an account nothing can verify, and a password reset would mail a real
 * inbox and risk tripping rate limits. The outgoing request is still recorded,
 * so the payload the frontend builds stays covered even though the response is
 * fabricated.
 *
 * Matches on pathname alone, so it holds wherever NEXT_PUBLIC_API_URL points.
 * The returned array is appended to as requests arrive.
 */
export async function mockApiPost(
  page: Page,
  pathname: string,
  response: { status?: number; body?: unknown } = {}
): Promise<CapturedRequest[]> {
  const captured: CapturedRequest[] = [];

  await page.route(
    (url) => url.pathname === pathname,
    async (route) => {
      if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: CORS_HEADERS });
        return;
      }

      captured.push({ body: route.request().postDataJSON() });
      await route.fulfill({
        status: response.status ?? 200,
        headers: { ...CORS_HEADERS, 'content-type': 'application/json' },
        body: JSON.stringify(response.body ?? {}),
      });
    }
  );

  return captured;
}
