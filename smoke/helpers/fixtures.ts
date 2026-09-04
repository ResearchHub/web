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
 *
 * "Post id" is in the names deliberately. A grant and a proposal each own two
 * different numbers: the post that carries the document, and the grant or
 * fundraise record hanging off it. Only the post id appears in a URL, and the
 * two are easy to confuse when reading a payload — `proposal.spec.ts` asserts
 * on a `grant_id` that is the record, not the post.
 *
 * Neither has to be owned by the smoke account, and no spec writes to either
 * beyond leaving a comment. What the grant does have to be is OPEN, since
 * `proposal.spec.ts` reaches its flow through the "Submit Proposal" button
 * that only an open RFP renders.
 *
 * The specs that edit a title deliberately do not use these. Editing means
 * reopening the notebook note behind the post, which lives in the personal
 * notebook of whoever drafted it and cannot be shared, so those specs publish
 * their own content first rather than depending on who owns a fixture.
 */
export function grantPostId(): string {
  return requiredEnv('SMOKE_GRANT_POST_ID');
}

export function proposalPostId(): string {
  return requiredEnv('SMOKE_PROPOSAL_POST_ID');
}
