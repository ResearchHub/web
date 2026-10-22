'use client';

import { FC } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import {
  BaseFeedItem,
  TitleSection,
  MetadataSection,
  PrimaryActionSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemEyebrow } from '@/components/Feed/FeedItemEyebrow';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatFundingAmount } from '@/components/Funding/lib/fundingAmounts';
import { buildWorkUrl } from '@/utils/url';
import type { FeedEntry, FeedFundraiseContent } from '@/types/feed';

interface FeedItemFundraiseCompletedProps {
  entry: FeedEntry;
  href?: string;
  showActions?: boolean;
  showTooltips?: boolean;
  maxLength?: number;
  onFeedItemClick?: () => void;
}

export const FeedItemFundraiseCompleted: FC<FeedItemFundraiseCompletedProps> = ({
  entry,
  href,
  showActions = true,
  showTooltips = true,
  maxLength,
  onFeedItemClick,
}) => {
  const { showUSD } = useCurrencyPreference();
  const content = entry.content as FeedFundraiseContent;
  const author = content.createdBy;

  const proposalId = content.postId;
  const proposalSlug = content.proposalSlug || undefined;
  const title = content.proposalTitle?.trim() || 'Proposal';

  const fundingPageUrl =
    href ||
    (proposalId != null
      ? buildWorkUrl({
          id: proposalId,
          slug: proposalSlug,
          contentType: 'preregistration',
        })
      : undefined);

  const raisedLabel = formatFundingAmount(
    { usd: content.amountRaised.usd, rsc: content.amountRaised.rsc },
    showUSD
  );
  const goalRsc = content.goalAmount.rsc ?? content.amountRaised.rsc;
  const goalLabel = formatFundingAmount({ usd: content.goalAmount.usd, rsc: goalRsc }, showUSD);

  return (
    <BaseFeedItem
      entry={entry}
      href={fundingPageUrl}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText="fully funded a proposal"
      maxLength={maxLength}
      onFeedItemClick={onFeedItemClick}
      showHeader={false}
      hideReportButton={false}
    >
      <FeedItemEyebrow label="Fully funded" publishedAt={entry.timestamp} />

      <TitleSection
        title={title}
        href={fundingPageUrl}
        onClick={onFeedItemClick}
        className="text-md md:!text-md"
      />

      <MetadataSection className="mb-0 py-2">
        {author ? (
          <div className="flex items-center gap-2.5">
            <AuthorTooltip authorId={author.id !== 0 ? author.id : undefined}>
              <Avatar
                src={author.profileImage || undefined}
                alt={author.fullName}
                size="sm"
                disableTooltip
              />
            </AuthorTooltip>
            <div className="flex flex-col min-w-0">
              <Link
                href={author.profileUrl || '#'}
                className="text-sm font-medium text-gray-900 hover:underline truncate"
                onClick={(e) => e.stopPropagation()}
              >
                {author.fullName}
              </Link>
              {entry.nonprofit?.name ? (
                <span className="text-xs text-gray-500 truncate">{entry.nonprofit.name}</span>
              ) : null}
            </div>
          </div>
        ) : null}
      </MetadataSection>

      <PrimaryActionSection>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span className="text-[11px] text-gray-500 uppercase tracking-wide">Raised</span>
              <span className="font-mono font-semibold text-primary-600 text-lg">
                {raisedLabel}
              </span>
            </div>
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span className="text-[11px] text-gray-500 uppercase tracking-wide">Goal</span>
              <span className="font-mono font-semibold text-gray-900 text-lg">{goalLabel}</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium bg-green-500 text-white border border-green-400">
            <CheckCircle size={12} className="text-white" aria-hidden />
            Funded
          </span>
        </div>
      </PrimaryActionSection>
    </BaseFeedItem>
  );
};
