'use client';

import { FC, useState } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
} from '@/components/Feed/BaseFeedItem';
import { AuthorList } from '@/components/ui/AuthorList';
import { TaxDeductibleBadge } from '@/components/ui/TaxDeductibleBadge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { GrantBadge } from '@/components/ui/GrantBadge';
import { Pin, Star, ArrowRight } from 'lucide-react';
import { formatTimestamp } from '@/utils/date';
import { useRouter } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { formatCurrency } from '@/utils/currency';
import { isDeadlineInFuture } from '@/utils/date';

interface FeedItemFundraiseProps {
  entry: FeedEntry;
  href?: string;
  showTooltips?: boolean;
  showActions?: boolean;
  showHeader?: boolean;
  maxLength?: number;
  customActionText?: string;
  isPinnedFundraise?: boolean;
  onFeedItemClick?: () => void;
  showBountyInfo?: boolean;
}

/**
 * Component for rendering a fundraise feed item using BaseFeedItem
 */
export const FeedItemFundraise: FC<FeedItemFundraiseProps> = ({
  entry,
  href,
  showTooltips = true,
  showActions = true,
  showHeader = true,
  maxLength,
  customActionText,
  isPinnedFundraise = false,
  onFeedItemClick,
  showBountyInfo,
}) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { showShareModal } = useShareModalContext();
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  const post = entry.content as FeedPostContent;
  const hasFundraise = post.contentType === 'PREREGISTRATION' && post.fundraise;
  const grants = entry.associatedGrants ?? [];

  const isNonprofit =
    entry.raw?.is_nonprofit === true && post.contentType === 'PREREGISTRATION' && post.fundraise;

  const authors =
    post.authors?.map((author) => ({
      name: author.fullName,
      verified: author.user?.isVerified,
      authorUrl: author.profileUrl,
    })) || [];

  const fundingPageUrl =
    href ||
    buildWorkUrl({
      id: post.id,
      slug: post.slug,
      contentType: 'preregistration',
    });

  const imageUrl = post.previewImage ?? undefined;

  const fundraise = post.fundraise;
  const isActive =
    fundraise &&
    fundraise.status === 'OPEN' &&
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true);

  const contributors =
    fundraise?.contributors?.topContributors?.map((c) => ({
      src: c.authorProfile.profileImage || '',
      alt: c.authorProfile.fullName,
      tooltip: c.authorProfile.fullName,
    })) || [];

  const handleContributeSuccess = () => {
    setIsContributeModalOpen(false);
    showShareModal({
      url: window.location.href,
      docTitle: post.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  const reviewScore = entry.metrics?.reviewScore;
  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  const callout = hasFundraise && fundraise && (
    <div
      className="mt-3 rounded-lg bg-gray-50 border border-gray-200 px-4 py-3.5 cursor-default"
      onMouseDown={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="font-mono text-sm leading-tight whitespace-nowrap">
            <span className="font-semibold text-blue-600">
              {formatCurrency({
                amount: showUSD
                  ? Math.round(fundraise.amountRaised.usd)
                  : Math.round(fundraise.amountRaised.rsc),
                showUSD,
                exchangeRate,
                skipConversion: true,
                shorten: true,
              })}
            </span>
            <span className="text-gray-500 mx-1">raised of</span>
            <span className="font-semibold text-blue-600">
              {formatCurrency({
                amount: showUSD
                  ? Math.round(fundraise.goalAmount.usd)
                  : Math.round(fundraise.goalAmount.rsc),
                showUSD,
                exchangeRate,
                skipConversion: true,
                shorten: true,
              })}
            </span>
            <span className="text-gray-500 ml-1">goal</span>
          </div>

          {contributors.length > 0 && (
            <AvatarStack
              items={contributors}
              size="xxs"
              maxItems={3}
              spacing={-6}
              showLabel={false}
              disableTooltip={false}
              showExtraCount={true}
              totalItemsCount={fundraise.contributors.numContributors}
              extraCountLabel="Backers"
            />
          )}
        </div>

        {isActive && (
          <Button
            variant="default"
            size="sm"
            className="flex-shrink-0 rounded-md text-[13px]"
            onClick={() => setIsContributeModalOpen(true)}
          >
            Fund Research
            <ArrowRight size={14} className="ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <BaseFeedItem
        entry={entry}
        href={fundingPageUrl}
        showActions={showActions}
        showTooltips={showTooltips}
        customActionText={
          customActionText ?? (hasFundraise ? `is seeking funding` : 'published a post')
        }
        maxLength={maxLength}
        onFeedItemClick={onFeedItemClick}
        showBountyInfo={showBountyInfo}
        showHeader={false}
        hideReportButton={true}
        cardImageLeft={
          imageUrl ? (
            <>
              <ImageSection
                imageUrl={imageUrl}
                alt={post.title || 'Fundraise image'}
                naturalDimensions
              />
              {isNonprofit && (
                <span
                  style={{
                    position: 'absolute',
                    top: 7,
                    left: 7,
                  }}
                >
                  <TaxDeductibleBadge />
                </span>
              )}
              {hasReviewScore && (
                <Tooltip
                  content={
                    <PeerReviewTooltip
                      reviews={post.reviews ?? []}
                      averageScore={reviewScore}
                      href={fundingPageUrl}
                    />
                  }
                  position="top"
                  width="w-[320px]"
                >
                  <span
                    className="cursor-help"
                    style={{
                      position: 'absolute',
                      bottom: 7,
                      left: 7,
                      background: 'rgba(0, 0, 0, 0.45)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: 12,
                      padding: '2px 7px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                    }}
                  >
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span className="text-xs font-medium text-white">{reviewScore.toFixed(1)}</span>
                  </span>
                </Tooltip>
              )}
            </>
          ) : undefined
        }
      >
        {isPinnedFundraise && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <Pin className="w-4 h-4 text-blue-600" />
          </div>
        )}

        {/* Mobile image */}
        {imageUrl && (
          <div className="md:!hidden w-[calc(100%+2rem)] mb-5 -mx-4 -mt-4 overflow-hidden">
            <ImageSection
              imageUrl={imageUrl}
              alt={post.title || 'Fundraise image'}
              aspectRatio="16/9"
            />
          </div>
        )}

        {grants.length > 0 && (
          <div className="mt-[-7px] flex flex-wrap items-center gap-3">
            {grants.map((grant) => (
              <GrantBadge
                key={grant.id}
                grant={grant}
                hideIcon
                className="text-[13px] font-normal text-gray-500 hover:text-gray-700 gap-1"
              />
            ))}
          </div>
        )}

        <TitleSection title={post.title} href={fundingPageUrl} onClick={onFeedItemClick} />

        <MetadataSection className="mb-0">
          <div className="flex items-center flex-wrap text-sm">
            {authors.length > 0 && (
              <AuthorList
                authors={authors}
                size="base"
                className="text-gray-500 font-normal text-sm"
                delimiter=","
                delimiterClassName="ml-0"
                showAbbreviatedInMobile={true}
                hideExpandButton={true}
              />
            )}
            <span className="mx-1.5 text-gray-400">/</span>
            <span className="text-gray-500 whitespace-nowrap text-sm">
              {post.institution || 'George Church Lab'}
            </span>
            {post.createdDate && (
              <>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-600 whitespace-nowrap text-sm">
                  {formatTimestamp(post.createdDate, false)}
                </span>
              </>
            )}
          </div>
        </MetadataSection>

        {callout}
      </BaseFeedItem>

      {hasFundraise && fundraise && (
        <ContributeToFundraiseModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={fundraise}
          proposalTitle={post.title}
        />
      )}
    </>
  );
};
