'use client';

import { memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRightLong } from '@fortawesome/pro-solid-svg-icons';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { Avatar } from '@/components/ui/Avatar';
import { FundraiseProgressBar } from '@/components/Funding/FundraiseProgressBar';
import { useGrants } from '@/contexts/GrantContext';
import { useFundraises } from '@/contexts/FundraiseContext';
import { FeedGrantContent, FeedPostContent } from '@/types/feed';
import { buildWorkUrl } from '@/utils/url';
import { PersonalizeFeedBanner } from './components/PersonalizeFeedBanner';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

const ViewAllLink = ({ href }: { href: string }) => (
  <Link
    href={href}
    className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
  >
    View all
    <FontAwesomeIcon icon={faArrowRightLong} fontSize={12} />
  </Link>
);

const SidebarSectionSkeleton = ({ rows = 3 }: { rows?: number }) => (
  <div className="space-y-3 animate-pulse px-4">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="space-y-2 py-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    ))}
  </div>
);

const AvailableFundingSection = () => {
  const { grants, fetchGrants, isLoading } = useGrants();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  if (!isLoading && grants.length === 0) return null;

  const sortedGrants = [...grants].sort((a, b) => {
    const aContent = a.content as FeedGrantContent;
    const bContent = b.content as FeedGrantContent;
    const aName = (aContent.grant.shortTitle || aContent.title).toLowerCase();
    const bName = (bContent.grant.shortTitle || bContent.title).toLowerCase();
    const aIsGigabrain = aName.includes('gigabrain');
    const bIsGigabrain = bName.includes('gigabrain');
    if (aIsGigabrain && !bIsGigabrain) return -1;
    if (!aIsGigabrain && bIsGigabrain) return 1;
    return 0;
  });
  const visibleGrants = sortedGrants.slice(0, 3);

  return (
    <div>
      <SidebarHeader
        title="Funding Opportunities"
        action={<ViewAllLink href="/fund" />}
        className="pb-2"
      />

      {isLoading ? (
        <SidebarSectionSkeleton />
      ) : (
        <div className="space-y-1">
          {visibleGrants.map((entry) => {
            const content = entry.content as FeedGrantContent;
            const grant = content.grant;
            const href = buildWorkUrl({
              id: content.id,
              contentType: 'funding_request',
              slug: content.slug,
            });
            const amount = showUSD ? grant.amount.usd : grant.amount.rsc;

            return (
              <Link
                key={entry.id}
                href={href}
                className="flex items-center gap-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors px-1"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                    {grant.shortTitle || content.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    <span className="truncate">
                      {grant.organization || content.createdBy?.fullName}
                    </span>
                    {grant.applicants?.length > 0 && (
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Users size={12} />
                        {grant.applicants.length}
                      </span>
                    )}
                  </div>
                  <div className="mt-1.5 text-sm font-semibold font-mono text-gray-900">
                    {formatCurrency({
                      amount,
                      showUSD,
                      exchangeRate,
                      shorten: true,
                      skipConversion: true,
                    })}
                    <span className="text-xs font-sans font-normal text-gray-500 ml-1">
                      available
                    </span>
                  </div>
                </div>
                {content.previewImage && (
                  <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={content.previewImage}
                      alt={grant.shortTitle || content.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const NeedsFundingSection = () => {
  const { sidebarFundraises, isSidebarLoading, fetchSidebarFundraises } = useFundraises();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  useEffect(() => {
    fetchSidebarFundraises();
  }, [fetchSidebarFundraises]);

  if (!isSidebarLoading && sidebarFundraises.length === 0) return null;

  const visibleFundraises = sidebarFundraises.slice(0, 3);

  return (
    <div>
      <SidebarHeader
        title="Proposals"
        action={<ViewAllLink href="/fund/proposals" />}
        className="pb-2"
      />

      {isSidebarLoading ? (
        <SidebarSectionSkeleton />
      ) : (
        <div className="space-y-1">
          {visibleFundraises.map((entry) => {
            const content = entry.content as FeedPostContent;
            const fundraise = content.fundraise;
            if (!fundraise) return null;

            const author = fundraise.createdBy?.authorProfile;
            const href = buildWorkUrl({
              id: content.id,
              contentType: 'preregistration',
              slug: content.slug,
            });

            const goalAmount = showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc;
            const raisedAmount = showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc;

            return (
              <Link
                key={entry.id}
                href={href}
                className="block py-2.5 rounded-lg hover:bg-gray-100 transition-colors px-1"
              >
                <div className="flex gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                      {content.title}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Avatar
                        src={author?.profileImage}
                        alt={author?.fullName || 'Author'}
                        size={16}
                      />
                      <span className="text-xs text-gray-500 truncate">{author?.fullName}</span>
                    </div>
                  </div>
                  {content.previewImage && (
                    <div className="relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={content.previewImage}
                        alt={content.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 min-w-0">
                    <FundraiseProgressBar
                      raisedAmount={raisedAmount}
                      goalAmount={goalAmount}
                      height="h-1"
                    />
                  </div>
                  <div className="flex-shrink-0 flex items-baseline gap-0.5 text-[11px] font-mono">
                    <span className="font-bold text-gray-900">
                      {formatCurrency({
                        amount: raisedAmount,
                        showUSD,
                        exchangeRate,
                        shorten: true,
                        skipConversion: true,
                      })}
                    </span>
                    <span className="text-gray-300">/</span>
                    <span className="text-gray-500">
                      {formatCurrency({
                        amount: goalAmount,
                        showUSD,
                        exchangeRate,
                        shorten: true,
                        skipConversion: true,
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SidebarComponent = () => {
  const pathname = usePathname();
  const isFollowingPage = pathname === '/following';

  return (
    <div className="space-y-8">
      <PersonalizeFeedBanner variant={isFollowingPage ? 'logged-in' : 'logged-out'} />

      <AvailableFundingSection />
      <NeedsFundingSection />
    </div>
  );
};

export const RightSidebar = memo(SidebarComponent);
RightSidebar.displayName = 'RightSidebar';
