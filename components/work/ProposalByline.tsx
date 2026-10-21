'use client';

import Link from 'next/link';
import { Landmark, Lock, Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorList } from '@/components/ui/AuthorList';
import { Tooltip } from '@/components/ui/Tooltip';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { useFundraiseSummary } from '@/components/Funding/lib/useFundraiseSummary';
import { useShowProposalTab } from '@/components/work/lib/workTabs';
import { useWorkInstitution, type WorkInstitution } from '@/components/work/WorkInstitutionContext';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import {
  BYLINE_BOX_CLASS,
  BYLINE_CHIP_CLASS,
  BYLINE_LINK_CHIP_CLASS,
} from '@/components/work/lib/bylineChip';
import { getLinkedGrantLink } from '@/components/work/lib/linkedGrant';
import { getWorkReviewScore } from '@/components/work/lib/reviewScore';
import { toAuthorListAuthors } from '@/components/work/lib/workAuthors';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Fundraise } from '@/types/funding';
import type { Work } from '@/types/work';
import { formatTimestamp } from '@/utils/date';
import { pluralizeSuffix } from '@/utils/stringUtils';
import { cn } from '@/utils/styles';

/** Who can read a proposal sent to an RFP privately. */
const PRIVATE_NOTE = 'Only the funder and vetted reviewers can read this proposal.';

/**
 * Over a proposal's Proposal tab: who proposes it, with the lead author's
 * face, each name opening its profile card on hover, and under the names the
 * nonprofit the money goes to. Then chips for what it has raised (where the
 * funding card is hidden), its review score, when it was posted, the RFP it
 * answers, whether it went in privately, and its DOI. Each chip opens what it
 * is about: the score the Reviews tab, the date the Updates tab, the RFP and
 * the DOI their pages. The other tabs open straight on their content.
 */
export function ProposalByline({ work, metadata }: { work: Work; metadata: WorkMetadata }) {
  const showTab = useShowProposalTab(work);
  const { activeTab } = useWorkTab();
  const institution = useWorkInstitution();

  const lead = work.authors[0]?.authorProfile;
  // One author's headline; with co-authors it would read as theirs too.
  const headline = work.authors.length === 1 ? lead?.headline : undefined;
  const reviewScore = getWorkReviewScore(work, metadata);
  const reviewCount = work.peerReviews?.length ?? 0;
  const postedDate = work.publishedDate || work.createdDate;

  const { title: grantTitle, href: grantHref } = getLinkedGrantLink(work);
  const fundraise = metadata.fundraising;

  if (activeTab !== 'paper') return null;

  return (
    <div className={BYLINE_BOX_CLASS}>
      {lead && (
        <div className="flex items-center gap-3">
          <Avatar src={lead.profileImage} alt={lead.fullName} size="md" authorId={lead.id} />
          <div className="min-w-0">
            <AuthorList
              authors={toAuthorListAuthors(work.authors, { profileCards: true })}
              size="base"
              className="font-semibold text-gray-900"
              delimiterClassName="text-gray-400"
              delimiter="·"
              showAbbreviatedInMobile
              mobileExpandable
            />
            {(institution || headline) && (
              <p className="flex min-w-0 items-center gap-1 text-[13px] text-gray-500">
                {institution && <InstitutionName institution={institution} />}
                {headline && (
                  <span className="min-w-0 truncate">
                    {institution && '· '}
                    {headline}
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {fundraise && <ProposalAmountChip fundraise={fundraise} />}
        {reviewScore !== undefined && (
          <button
            type="button"
            onClick={() => showTab('reviews')}
            className={cn(
              BYLINE_LINK_CHIP_CLASS,
              'bg-amber-100 font-semibold text-amber-800 hover:bg-amber-200'
            )}
          >
            <Star className="h-3 w-3 fill-current" aria-hidden="true" />
            {reviewScore.toFixed(1)}
            {reviewCount > 0 && ` · ${reviewCount} review${pluralizeSuffix(reviewCount)}`}
          </button>
        )}
        {postedDate && (
          // What has happened since it was posted is on the Updates tab.
          // Formatted in the server's time zone first; the browser's can read a day apart.
          <button
            type="button"
            suppressHydrationWarning
            onClick={() => showTab('updates')}
            className={BYLINE_LINK_CHIP_CLASS}
          >
            Posted {formatTimestamp(postedDate, false)}
          </button>
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
          // Who can read it, on hover or, on a touch screen, a tap.
          <Tooltip content={PRIVATE_NOTE} position="bottom" width="w-60">
            <button
              type="button"
              className={cn(
                BYLINE_LINK_CHIP_CLASS,
                'bg-amber-50 text-amber-800 hover:bg-amber-100'
              )}
            >
              <Lock className="h-3 w-3" aria-hidden="true" />
              Submitted privately
              <span className="sr-only">: {PRIVATE_NOTE}</span>
            </button>
          </Tooltip>
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

/**
 * What the fundraise has raised, as the first chip where the funding card is
 * hidden (phones and tablets), as an RFP's byline leads with its award. It
 * stays once the fundraise has ended. While open it shows raised of the goal
 * and opens the Fund panel; after, what it raised, and it opens the sidebar
 * drawer, whose funding card has the rest. It follows the RSC or USD choice,
 * as the card and the action bar do.
 */
function ProposalAmountChip({ fundraise }: { fundraise: Fundraise }) {
  const summary = useFundraiseSummary(fundraise);
  const { openFundPanel } = useFundPanel();
  const { setMobileSidebarOpen } = useWorkTab();

  return (
    <button
      type="button"
      onClick={summary.isActive ? openFundPanel : () => setMobileSidebarOpen(true)}
      aria-haspopup="dialog"
      className={cn(
        BYLINE_LINK_CHIP_CLASS,
        'lg:hidden',
        // Green while it raises and once it met its goal; gray when it ended short.
        (summary.isActive || summary.isCompleted) &&
          'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
      )}
    >
      <span className="font-mono font-semibold">{summary.raised}</span>
      {summary.isActive ? `of ${summary.goal}` : 'raised'}
    </button>
  );
}

/**
 * The nonprofit a proposal's money goes to, beside its authors: a landmark and
 * its name, linking to its page on Endaoment, which takes the donations. It
 * keeps its width over the headline after it, and truncates only on its own.
 */
function InstitutionName({ institution }: { institution: WorkInstitution }) {
  const content = (
    <>
      <Landmark className="h-3 w-3 shrink-0" aria-hidden="true" />
      <span className="sr-only">Nonprofit recipient: </span>
      <span className="truncate">{institution.name}</span>
    </>
  );
  const className = 'flex min-w-0 max-w-full shrink-0 items-center gap-1 text-gray-600';

  if (!institution.href) return <span className={className}>{content}</span>;
  return (
    <a
      href={institution.href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(className, 'hover:text-gray-900 hover:underline')}
    >
      {content}
    </a>
  );
}
