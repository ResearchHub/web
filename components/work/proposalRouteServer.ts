import { cache } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getShareToken } from '@/lib/shareToken/server';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { MetadataService, type WorkMetadata } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import type { Work } from '@/types/work';

type ProposalTab = 'reviews' | 'bounties' | 'conversation' | 'updates';

function proposalUrl(id: string, slug: string, tab?: ProposalTab): string {
  return tab ? `/proposal/${id}/${slug}/${tab}` : `/proposal/${id}/${slug}`;
}

/**
 * Fetches a proposal, passing along a share token when the request carries one.
 *
 * Cached per request so the layout and the page it wraps share a single fetch.
 */
export const getProposalOrNotFound = cache(async (id: string): Promise<Work> => {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PostService.get(id, { shareToken: await getShareToken() });
  } catch {
    notFound();
  }
});

/** Document metadata for a proposal, share-token aware and cached per request. */
export const getProposalMetadata = cache(
  async (unifiedDocumentId: string): Promise<WorkMetadata> =>
    MetadataService.get(unifiedDocumentId, { shareToken: await getShareToken() })
);

export async function getProposalContent(work: Work): Promise<string | undefined> {
  if (!work.contentUrl) return undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return undefined;
  }
}

/**
 * Page metadata for a proposal tab.
 *
 * A tokenized URL points at a proposal that is private to everyone else, so it
 * is withheld from search indexes — otherwise a crawler reaching a 30-day link
 * would turn it into permanent exposure. The canonical URL is built from the
 * route params and never carries the token.
 */
export async function buildProposalMetadata({
  id,
  slug,
  tab,
  titleSuffix,
}: {
  id: string;
  slug: string;
  tab?: ProposalTab;
  titleSuffix?: string;
}): Promise<Metadata> {
  const [work, shareToken] = await Promise.all([getProposalOrNotFound(id), getShareToken()]);

  return {
    ...getWorkMetadata({ work, url: proposalUrl(id, slug, tab), titleSuffix }),
    ...(shareToken ? { robots: { index: false, follow: false } } : {}),
  };
}
