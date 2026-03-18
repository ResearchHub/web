'use client';

import { FC, useState } from 'react';
import { FeedPostContent, FeedEntry } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  PrimaryActionSection,
} from '@/components/Feed/BaseFeedItem';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { FeedItemFundingBadges } from '@/components/Feed/FeedItemFundingBadges';
import { Pin, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { formatCurrency } from '@/utils/currency';
import { isDeadlineInFuture } from '@/utils/date';
import Link from 'next/link';

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
  const isNonprofit =
    entry.raw?.is_nonprofit === true && post.contentType === 'PREREGISTRATION' && post.fundraise;

  const primaryAuthor = post.authors?.[0];

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
      authorId: c.authorProfile.id || undefined,
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
        hideReportButton={false}
        cardImageLeft={
          imageUrl ? (
            <>
              <ImageSection
                imageUrl={imageUrl}
                alt={post.title || 'Fundraise image'}
                naturalDimensions
              />
              <div className="absolute top-2 left-2">
                <FeedItemFundingBadges
                  reviewScore={entry.metrics?.reviewScore}
                  reviews={post.reviews}
                  href={fundingPageUrl}
                  isNonprofit={!!isNonprofit}
                  fundraiseStatus={fundraise?.status}
                  variant="overlay"
                />
              </div>
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

        <TitleSection
          title={post.title}
          href={fundingPageUrl}
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
              <div className="flex flex-col min-w-0">
                <Link
                  href={primaryAuthor.profileUrl || '#'}
                  className="text-sm font-medium text-gray-900 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {primaryAuthor.fullName}
                </Link>
                <span className="text-xs text-gray-500 truncate">
                  {entry.nonprofit?.name || post.institution}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-500">
              {entry.nonprofit?.name || post.institution}
            </span>
          )}
        </MetadataSection>

        {hasFundraise && fundraise && (
          <PrimaryActionSection>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-sm leading-tight whitespace-nowrap">
                  <span className="font-mono font-semibold text-gray-900">
                    {formatCurrency({
                      amount:
                        fundraise.status === 'COMPLETED'
                          ? Math.round(
                              showUSD ? fundraise.goalAmount.usd : fundraise.amountRaised.rsc
                            )
                          : Math.round(
                              showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc
                            ),
                      showUSD,
                      exchangeRate,
                      skipConversion: true,
                      shorten: true,
                    })}
                  </span>
                  <span className="text-gray-500 mx-1">raised of</span>
                  <span className="font-mono font-semibold text-gray-900">
                    {formatCurrency({
                      amount:
                        fundraise.status === 'COMPLETED'
                          ? Math.round(
                              showUSD ? fundraise.goalAmount.usd : fundraise.amountRaised.rsc
                            )
                          : Math.round(
                              showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc
                            ),
                      showUSD,
                      exchangeRate,
                      skipConversion: true,
                      shorten: true,
                    })}
                  </span>
                  <span className="text-gray-500 ml-1">goal</span>
                </div>

                {contributors.length > 0 && (
                  <div className="hidden sm:block">
                    <AvatarStack
                      items={contributors}
                      size="sm"
                      maxItems={3}
                      spacing={-8}
                      showLabel={false}
                      disableTooltip={false}
                      showExtraCount={true}
                      totalItemsCount={fundraise.contributors.numContributors}
                      extraCountLabel="Backers"
                    />
                  </div>
                )}
              </div>

              {isActive ? (
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-shrink-0 rounded-md text-[13px]"
                  onClick={() => setIsContributeModalOpen(true)}
                >
                  <span className="hidden sm:inline">Fund Proposal</span>
                  <span className="sm:hidden">Fund</span>
                  <ArrowRight size={14} className="ml-1" />
                </Button>
              ) : (
                <span className="flex-shrink-0 text-sm text-gray-400">Ended</span>
              )}
            </div>
          </PrimaryActionSection>
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
