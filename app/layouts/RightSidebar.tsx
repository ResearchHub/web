'use client';

import { memo, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Building, Users } from 'lucide-react';
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

  const visibleGrants = grants.slice(0, 3);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <SidebarHeader
        title="Available Funding"
        action={<ViewAllLink href="/fund" />}
        className="px-4 pt-4 pb-2"
      />

      {isLoading ? (
        <SidebarSectionSkeleton />
      ) : (
        <div className="divide-y divide-gray-100">
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
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
                    {grant.shortTitle || content.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                    {grant.organization && (
                      <span className="flex items-center gap-1 truncate">
                        <Building size={12} className="flex-shrink-0" />
                        <span className="truncate">{grant.organization}</span>
                      </span>
                    )}
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
                  </div>
                </div>
                {content.previewImage && (
                  <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={content.previewImage}
                      alt={grant.shortTitle || content.title}
                      fill
                      className="object-cover"
                      sizes="56px"
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <SidebarHeader
        title="Needs Funding"
        action={<ViewAllLink href="/fund" />}
        className="px-4 pt-4 pb-2"
      />

      {isSidebarLoading ? (
        <SidebarSectionSkeleton />
      ) : (
        <div className="divide-y divide-gray-100">
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
                className="block px-4 py-3 hover:bg-gray-50 transition-colors"
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
                    <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={content.previewImage}
                        alt={content.title}
                        fill
                        className="object-cover"
                        sizes="56px"
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
    <div className="space-y-4">
      <PersonalizeFeedBanner variant={isFollowingPage ? 'logged-in' : 'logged-out'} />

      <AvailableFundingSection />
      <NeedsFundingSection />
    </div>
  );
};

export const RightSidebar = memo(SidebarComponent);
RightSidebar.displayName = 'RightSidebar';
