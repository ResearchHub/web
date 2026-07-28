'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight, Star } from 'lucide-react';
import { FeedEntry, FeedPostContent } from '@/types/feed';
import {
  BaseFeedItem,
  ImageSection,
  MetadataSection,
  PrimaryActionSection,
  TitleSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemEyebrow } from '@/components/Feed/FeedItemEyebrow';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { buttonVariants } from '@/components/ui/Button';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import { buildJournalV2FeedItemViewModel } from '@/components/Journal/lib/journalV2FeedItem';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/styles';

interface FeedItemRegisteredReportProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  maxLength?: number;
  showBountyInfo?: boolean;
  onFeedItemClick?: () => void;
}

const StatLabel: FC<{ children: ReactNode }> = ({ children }) => (
  <span className="text-xs text-gray-500 uppercase tracking-wide">{children}</span>
);

export const FeedItemRegisteredReport: FC<FeedItemRegisteredReportProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  maxLength,
  showBountyInfo,
  onFeedItemClick,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const viewModel = buildJournalV2FeedItemViewModel(entry);
  if (!viewModel) return null;

  const post = entry.content as FeedPostContent;
  const reportUrl = href ?? viewModel.href;
  const imageUrl = viewModel.imageUrl;
  const primaryAuthor = post.authors?.[0];
  const coAuthors = (post.authors ?? []).slice(1);
  const reviewSummary = viewModel.reviewSummary;
  const fundraise = post.fundraise;

  const amountFunded = fundraise
    ? formatCurrency({
        amount: Math.round(showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc),
        showUSD,
        exchangeRate,
        skipConversion: true,
        shorten: true,
      })
    : undefined;

  return (
    <BaseFeedItem
      entry={entry}
      href={reportUrl}
      showActions={showActions}
      showTooltips={showTooltips}
      showHeader={false}
      maxLength={maxLength}
      showBountyInfo={showBountyInfo}
      onFeedItemClick={onFeedItemClick}
      cardImageLeft={
        imageUrl ? (
          <ImageSection
            imageUrl={imageUrl}
            fullSizeImageUrl={imageUrl}
            alt={post.title || 'Registered report image'}
            naturalDimensions
            previewOnClick={false}
            className="transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : undefined
      }
    >
      {imageUrl && (
        <div className="md:!hidden w-[calc(100%+2rem)] mb-5 -mx-4 -mt-4 overflow-hidden">
          <ImageSection
            imageUrl={imageUrl}
            fullSizeImageUrl={imageUrl}
            alt={post.title || 'Registered report image'}
            aspectRatio="16/9"
            previewOnClick={true}
          />
        </div>
      )}

      <FeedItemEyebrow label={viewModel.currentStageLabel} publishedAt={entry.timestamp} />

      <TitleSection
        title={post.title}
        href={reportUrl}
        onClick={onFeedItemClick}
        className="text-md md:!text-md"
      />

      <MetadataSection className="mb-0 py-2">
        {primaryAuthor ? (
          <div className="flex items-center gap-2.5">
            <AuthorTooltip authorId={primaryAuthor.id !== 0 ? primaryAuthor.id : undefined}>
              <Avatar
                src={primaryAuthor.profileImage || undefined}
                alt={primaryAuthor.fullName}
                size="sm"
                disableTooltip
              />
            </AuthorTooltip>
            <div className="flex min-w-0 flex-col">
              <div className="flex items-center gap-2">
                <Link
                  href={primaryAuthor.profileUrl || '#'}
                  className="truncate text-sm font-medium text-gray-900 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {primaryAuthor.fullName}
                </Link>
                {coAuthors.length > 0 && (
                  <AvatarStack
                    items={coAuthors.map((author) => ({
                      src: author.profileImage || '',
                      alt: author.fullName,
                      tooltip: author.fullName,
                      authorId: author.id || undefined,
                    }))}
                    size="xxs"
                    maxItems={3}
                    spacing={-6}
                    showLabel={false}
                    showExtraCount
                    totalItemsCount={coAuthors.length}
                    extraCountLabel="Authors"
                  />
                )}
              </div>
              {post.institution && (
                <span className="truncate text-xs text-gray-500">{post.institution}</span>
              )}
            </div>
          </div>
        ) : (
          post.institution && <span className="text-sm text-gray-500">{post.institution}</span>
        )}
      </MetadataSection>

      <PrimaryActionSection>
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
          <div className="flex min-w-0 items-start gap-6">
            <div className="flex flex-col whitespace-nowrap leading-tight">
              <StatLabel>Peer Review</StatLabel>
              {reviewSummary ? (
                <Tooltip
                  content={
                    <PeerReviewTooltip
                      reviews={reviewSummary.reviews}
                      averageScore={reviewSummary.average}
                      href={viewModel.proposalHref ?? reportUrl}
                    />
                  }
                  position="top"
                  width="w-[320px]"
                >
                  <span className="inline-flex cursor-help items-baseline gap-1 text-xl font-semibold text-gray-900">
                    <Star size={18} className="self-center fill-amber-400 text-amber-400" />
                    {reviewSummary.average.toFixed(1)}
                    <span className="text-sm font-normal text-gray-400">/5</span>
                  </span>
                </Tooltip>
              ) : (
                <span className="text-xl font-semibold text-gray-400">—</span>
              )}
            </div>

            {amountFunded && (
              <div className="flex flex-col whitespace-nowrap leading-tight">
                <StatLabel>Funded</StatLabel>
                <span className="font-mono text-xl font-semibold text-gray-900">
                  {amountFunded}
                </span>
              </div>
            )}
          </div>

          <Link
            href={reportUrl}
            onClick={onFeedItemClick}
            className={cn(
              buttonVariants({ variant: 'dark', size: 'sm' }),
              'flex-shrink-0 gap-1 no-underline'
            )}
          >
            Read report
            <ArrowRight size={14} />
          </Link>
        </div>
      </PrimaryActionSection>
    </BaseFeedItem>
  );
};
