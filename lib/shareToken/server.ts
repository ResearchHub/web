import { headers } from 'next/headers';

import { SHARE_TOKEN_HEADER } from './constants';

/** Reads the share token forwarded by `proxy.ts`. Layouts cannot read `searchParams`. */
export async function getShareToken(): Promise<string | null> {
  return (await headers()).get(SHARE_TOKEN_HEADER);
}
