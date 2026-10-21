'use client';

import Link from 'next/link';
import { Lock, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorList } from '@/components/ui/AuthorList';
import { useShowProposalTab } from '@/components/work/lib/workTabs';
import { BYLINE_CHIP_CLASS, BYLINE_LINK_CHIP_CLASS } from '@/components/work/lib/bylineChip';
import { getLinkedGrantLink } from '@/components/work/lib/linkedGrant';
import { getWorkReviewScore } from '@/components/work/lib/reviewScore';
import { toAuthorListAuthors } from '@/components/work/lib/workAuthors';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';
import { formatTimestamp } from '@/utils/date';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

/**
 * Under a proposal's cover: who proposes it, with the lead author's face, then
 * chips for its review score, when it was posted, the RFP it answers, whether
 * it went in privately, and its DOI.
 */
export function ProposalByline({ work, metadata }: { work: Work; metadata: WorkMetadata }) {
  const showTab = useShowProposalTab(work);

  const lead = work.authors[0]?.authorProfile;
  const reviewScore = getWorkReviewScore(work, metadata);
  const reviewCount = work.peerReviews?.length ?? 0;
  const postedDate = work.publishedDate || work.createdDate;

  const { title: grantTitle, href: grantHref } = getLinkedGrantLink(work);

  return (
    <div>
      {lead && (
        <div className="flex items-center gap-3">
          <Avatar src={lead.profileImage} alt={lead.fullName} size="md" authorId={lead.id} />
          <div className="min-w-0">
            <AuthorList
              authors={toAuthorListAuthors(work.authors)}
              size="base"
              className="font-semibold text-gray-900"
              delimiterClassName="text-gray-400"
              delimiter="·"
              showAbbreviatedInMobile
              mobileExpandable
            />
            {/* One author's headline; with co-authors it would read as theirs too. */}
            {work.authors.length === 1 && lead.headline && (
              <p className="truncate text-[13px] text-gray-500">{lead.headline}</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {reviewScore !== undefined && (
          <button
            type="button"
            onClick={() => showTab('reviews')}
            className={cn(
              BYLINE_CHIP_CLASS,
              'bg-amber-100 font-semibold text-amber-800 hover:bg-amber-200'
            )}
          >
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            {reviewScore.toFixed(1)}
            {reviewCount > 0 && ` · ${reviewCount} review${pluralizeSuffix(reviewCount)}`}
          </button>
        )}
        {postedDate && (
          // Formatted in the server's time zone first; the browser's can read a day apart.
          <span suppressHydrationWarning className={BYLINE_CHIP_CLASS}>
            Posted {formatTimestamp(postedDate, false)}
          </span>
        )}
        {grantTitle &&
          (grantHref ? (
            <Link href={grantHref} className={BYLINE_LINK_CHIP_CLASS}>
              <span className="truncate">{grantTitle}</span>
            </Link>
          ) : (
            <span className={BYLINE_CHIP_CLASS}>
              <span className="truncate">{grantTitle}</span>
            </span>
          ))}
        {work.isPublic === false && (
          <span className={cn(BYLINE_CHIP_CLASS, 'bg-amber-50 text-amber-800')}>
            <Lock className="h-3 w-3" aria-hidden="true" />
            Submitted privately
          </span>
        )}
        {work.doi && (
          <a
            href={`https://doi.org/${work.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className={BYLINE_LINK_CHIP_CLASS}
          >
            DOI
          </a>
        )}
      </div>
    </div>
  );
}
