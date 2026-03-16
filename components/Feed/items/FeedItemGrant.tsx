'use client';

import { FC, ReactNode } from 'react';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import {
  BaseFeedItem,
  TitleSection,
  ImageSection,
  MetadataSection,
  PrimaryActionSection,
} from '@/components/Feed/BaseFeedItem';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { isDeadlineInFuture } from '@/utils/date';
import { Highlight } from '@/components/Feed/FeedEntryItem';

interface FeedItemGrantProps {
  entry: FeedEntry;
  href?: string;
  className?: string;
  showActions?: boolean;
  showTooltips?: boolean;
  customActionText?: string;
  maxLength?: number;
  showHeader?: boolean;
  onFeedItemClick?: () => void;
  onAbstractExpanded?: () => void;
  highlights?: Highlight[];
  footer?: ReactNode;
}

export const FeedItemGrant: FC<FeedItemGrantProps> = ({
  entry,
  href,
  className,
  showActions = true,
  showTooltips = true,
  customActionText,
  maxLength,
  showHeader = true,
  onFeedItemClick,
  highlights,
  footer,
}) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const grant = entry.content as FeedGrantContent;

  const grantPageUrl =
    href ||
    buildWorkUrl({
      id: grant.id,
      slug: grant.slug,
      contentType: 'funding_request',
    });

  const imageUrl = grant.previewImage ?? undefined;

  const isPending = grant.grant?.status === 'PENDING';
  const isActive =
    grant.grant?.status === 'OPEN' &&
    (grant.grant?.endDate ? isDeadlineInFuture(grant.grant.endDate) : true);

  const applicants =
    grant.grant?.applicants?.map((applicant) => ({
      src: applicant.profileImage || '',
      alt: applicant.fullName,
      tooltip: applicant.fullName,
      authorId: applicant.id || undefined,
    })) || [];

  const budgetAmount = showUSD
    ? Math.round(grant.grant?.amount?.usd || 0)
    : Math.round(grant.grant?.amount?.rsc || 0);

  return (
    <BaseFeedItem
      entry={entry}
      href={grantPageUrl}
      className={className}
      showActions={showActions}
      showTooltips={showTooltips}
      customActionText={customActionText ?? 'opened an RFP'}
      maxLength={maxLength}
      showHeader={showHeader}
      onFeedItemClick={onFeedItemClick}
      hideReportButton={false}
      footer={footer}
      cardImageLeft={
        imageUrl ? (
          <ImageSection imageUrl={imageUrl} alt={grant.title || 'Grant image'} naturalDimensions />
        ) : undefined
      }
    >
      {imageUrl && (
        <div className="md:!hidden w-[calc(100%+2rem)] mb-5 -mx-4 -mt-4 overflow-hidden">
          <ImageSection imageUrl={imageUrl} alt={grant.title || 'Grant image'} aspectRatio="16/9" />
        </div>
      )}

      <TitleSection title={grant.title} href={grantPageUrl} onClick={onFeedItemClick} />

      {(grant.organization || grant.grant?.organization) && (
        <MetadataSection className="mb-0">
          <span className="text-sm text-gray-500">
            Offered by {grant.organization || grant.grant?.organization}
          </span>
        </MetadataSection>
      )}

      {grant.grant && (
        <PrimaryActionSection>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-6 min-w-0">
              <div className="flex flex-col leading-tight whitespace-nowrap">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Funding</span>
                <span className="font-mono font-semibold text-primary-600 text-xl">
                  {formatCurrency({
                    amount: budgetAmount,
                    showUSD,
                    exchangeRate,
                    skipConversion: true,
                    shorten: true,
                  })}
                </span>
              </div>

              {applicants.length > 0 && (
                <div className="hidden sm:flex flex-col leading-tight">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    Applicants
                  </span>
                  <AvatarStack
                    items={applicants}
                    size="xs"
                    maxItems={3}
                    spacing={-6}
                    showLabel={false}
                    disableTooltip={false}
                    showExtraCount={true}
                    totalItemsCount={applicants.length}
                    extraCountLabel="Applicants"
                  />
                </div>
              )}
            </div>

            {isActive ? (
              <Button
                variant="secondary"
                size="sm"
                className="flex-shrink-0 rounded-md text-[13px]"
                onClick={() => router.push(grantPageUrl)}
              >
                <span className="hidden sm:inline">View Details</span>
                <span className="sm:hidden">View</span>
                <ArrowRight size={14} className="ml-1" />
              </Button>
            ) : (
              <span
                className={`flex-shrink-0 text-sm ${isPending ? 'text-yellow-600' : 'text-gray-400'}`}
              >
                {isPending ? 'Pending' : 'Ended'}
              </span>
            )}
          </div>
        </PrimaryActionSection>
      )}
    </BaseFeedItem>
  );
};
