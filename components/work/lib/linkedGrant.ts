import type { Work } from '@/types/work';
import { buildWorkUrl, generateSlug } from '@/utils/url';

/** The RFP a proposal answers: its name, when it has one, and its page. */
export function getLinkedGrantLink(work: Work): { title?: string; href?: string } {
  const grant = work.linkedGrant;
  const title = grant?.title || grant?.shortTitle || grant?.organization || undefined;
  const href = grant?.postId
    ? buildWorkUrl({
        id: grant.postId,
        slug: generateSlug(title || 'rfp'),
        contentType: 'funding_request',
      })
    : undefined;
  return { title, href };
}
