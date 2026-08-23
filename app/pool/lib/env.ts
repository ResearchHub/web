export type PoolEnv = 'production' | 'staging' | 'development';

/**
 * Which backend every pool campaign runs against. Hardcoded rather than derived
 * so a campaign can be pointed at another environment while debugging.
 *
 * MUST be 'production' when merging, and note this is a single switch shared by
 * every campaign — you cannot point one at dev data and another at prod.
 * Shipping a non-production value is caught at runtime by the origin check in
 * `resolveCampaign`: funding is disabled rather than routed at fundraise IDs
 * belonging to another environment, where they resolve to real but unrelated
 * fundraises.
 */
export const ENV_ACTIVE: PoolEnv = 'production';

/**
 * A property of the environment, not of any campaign. Fundraise IDs are small
 * integers that collide across environments, so this is what tells us whether
 * a campaign's IDs belong to the backend we'd post a contribution to.
 */
export const API_ORIGINS: Record<PoolEnv, string> = {
  production: 'https://api.researchhub.com',
  staging: 'https://api.staging.researchhub.com',
  development: 'http://localhost:8000',
};

export const ACTIVE_API_ORIGIN = API_ORIGINS[ENV_ACTIVE];

/**
 * Lets a modal open against a backend that doesn't own the campaign's fundraise
 * IDs.
 *
 * True only under `next dev`, never in a deployed build, so the guard still
 * holds everywhere real money moves. Locally the contribution posts to a dev
 * database, where hitting an unrelated fundraise costs nothing — whereas being
 * unable to open the modal at all makes the flow untestable.
 */
export const ALLOW_MISMATCHED_ORIGIN = process.env.NODE_ENV === 'development';

export function normalizeOrigin(url: string | undefined): string {
  return (url ?? '').trim().replace(/\/+$/, '').toLowerCase();
}
