'use client';

import { FC, useState } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  FeedItemTopSection,
} from '@/components/Feed/BaseFeedItem';
import { FeedItemBadges } from '@/components/Feed/FeedItemBadges';
import { AuthorList } from '@/components/ui/AuthorList';
import { TaxDeductibleBadge } from '@/components/ui/TaxDeductibleBadge';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Tooltip } from '@/components/ui/Tooltip';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Building, Pin, Star, ArrowRight } from 'lucide-react';
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
  const topics = post.topics || [];

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
          className="flex-shrink-0 rounded-md w-[280px] max-w-[33%] hidden md:!inline-flex"
          onClick={() => setIsContributeModalOpen(true)}
        >
          Fund this research
          <ArrowRight size={14} className="ml-1.5" />
        </Button>
      )}
      {isActive && (
        <Button
          variant="default"
          size="sm"
          className="flex-shrink-0 rounded-md md:!hidden"
          onClick={() => setIsContributeModalOpen(true)}
        >
          Fund this research
          <ArrowRight size={14} className="ml-1.5" />
        </Button>
      )}
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
        cardImage={
          imageUrl && (
            <ImageSection
              imageUrl={imageUrl}
              alt={post.title || 'Fundraise image'}
              naturalDimensions
            />
          )
        }
        calloutSection={callout || undefined}
      >
        {isPinnedFundraise && (
          <div className="absolute top-3 right-3 z-10 pointer-events-none">
            <Pin className="w-4 h-4 text-blue-600" />
          </div>
        )}

        <FeedItemTopSection
          imageSection={
            imageUrl && (
              <ImageSection
                imageUrl={imageUrl}
                alt={post.title || 'Fundraise image'}
                aspectRatio="16/9"
              />
            )
          }
          rightContent={null}
          leftContent={isNonprofit ? <TaxDeductibleBadge /> : null}
        />

        <div className="mt-[-7px]">
          <FeedItemBadges topics={topics} category={post.category} subcategory={post.subcategory} />
        </div>

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
            {post.createdDate && (
              <>
                <span className="mx-2 text-gray-500">•</span>
                <span className="text-gray-600 whitespace-nowrap text-sm">
                  {formatTimestamp(post.createdDate, false)}
                </span>
              </>
            )}
            {hasReviewScore && (
              <>
                <span className="mx-2 text-gray-500">•</span>
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
                  <span className="inline-flex items-center gap-1 text-sm text-gray-600 cursor-help">
                    <Star size={13} className="fill-amber-400 text-amber-400" />
                    {reviewScore.toFixed(1)}
                  </span>
                </Tooltip>
              </>
            )}
          </div>
        </MetadataSection>

        {post.institution && (
          <MetadataSection>
            <div className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <Building className="w-4 h-4" />
              <span>{post.institution}</span>
            </div>
          </MetadataSection>
        )}
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
