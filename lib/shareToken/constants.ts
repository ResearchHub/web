/**
 * Query parameter carrying a proposal share token, mirroring the backend's
 * `SHARE_TOKEN_PARAM` in `unified_document_share_link_service.py`.
 */
export const SHARE_TOKEN_PARAM = 'st';

/**
 * Request header `proxy.ts` forwards the token on.
 *
 * Next.js layouts never receive `searchParams`, and the proposal layout is what
 * decides whether the page 404s, so the token reaches server components through
 * a header instead of the URL.
 */
export const SHARE_TOKEN_HEADER = 'x-share-token';
