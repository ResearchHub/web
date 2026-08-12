import { headers } from 'next/headers';

import { SHARE_TOKEN_HEADER } from './constants';

/**
 * The share token for the current request, forwarded by `proxy.ts`.
 *
 * Gives every server surface on the proposal route — layout, pages, and
 * `generateMetadata` — one way to reach the token, including the layout, which
 * cannot read `searchParams`.
 *
 * @returns The token, or `null` when the request carries none.
 */
export async function getShareToken(): Promise<string | null> {
  return (await headers()).get(SHARE_TOKEN_HEADER);
}
