import { requiredEnv } from './env';

/**
 * Content the suite navigates to, addressed by id.
 *
 * Ids rather than full URLs because `/grant/<id>` and `/proposal/<id>` both
 * redirect to the canonical slug, so a renamed title cannot break a spec. Note
 * that the grant redirect is a 307 while the proposal's is performed in the
 * browser — the proposal layout streams, so Next inlines the redirect instead
 * of sending a status. Both are transparent to Playwright; only a bare
 * request-level check would notice.
 */
export function grantId(): string {
  return requiredEnv('SMOKE_GRANT_ID');
}

export function proposalId(): string {
  return requiredEnv('SMOKE_PROPOSAL_ID');
}
