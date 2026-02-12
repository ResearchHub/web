'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDownIcon, ChartNoAxesColumnIncreasing } from 'lucide-react';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import type { LeaderboardPeriod } from '@/services/leaderboard.service';
import { useCurrentUserLeaderboard } from '@/hooks/useLeaderboard';
import { TopPeerReviewers } from './TopPeerReviewers';
import { TopFunders } from './TopFunders';

export type { LeaderboardPeriod } from '@/services/leaderboard.service';

const PERIOD_OPTIONS: { value: LeaderboardPeriod; label: string }[] = [
  { value: '7_days', label: 'Last 7 Days' },
  { value: '30_days', label: 'Last 30 Days' },
  { value: '6_months', label: 'Last 6 Months' },
  { value: '1_year', label: 'Last Year' },
  { value: 'all_time', label: 'All Time' },
];

const DEFAULT_PERIOD: LeaderboardPeriod = 'all_time';

function getValidPeriod(value: string | null): LeaderboardPeriod {
  const valid: LeaderboardPeriod[] = ['7_days', '30_days', '6_months', '1_year', 'all_time'];
  if (value && valid.includes(value as LeaderboardPeriod)) {
    return value as LeaderboardPeriod;
  }
  return DEFAULT_PERIOD;
}

export type LeaderboardTab = 'reviewers' | 'funders';

interface LeaderboardContentProps {
  defaultTab: LeaderboardTab;
}

function getInitialPeriod(searchParams: URLSearchParams): LeaderboardPeriod {
  return getValidPeriod(searchParams.get('period'));
}

function getPageFromSearchParams(searchParams: URLSearchParams): number {
  const p = searchParams.get('page');
  if (p == null || p === '') return 1;
  const n = parseInt(p, 10);
  return Number.isFinite(n) && n >= 1 ? n : 1;
}

export function LeaderboardContent({ defaultTab }: LeaderboardContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [period, setPeriod] = useState<LeaderboardPeriod>(() => getInitialPeriod(searchParams));

  const page = getPageFromSearchParams(searchParams);

  const {
    reviewer: currentUserReviewer,
    funder: currentUserFunder,
    isLoading: currentUserLoading,
  } = useCurrentUserLeaderboard(period);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    params.set('page', String(page));
    const newUrl = `${pathname}?${params.toString()}`;
    if (
      typeof window !== 'undefined' &&
      window.location.pathname + window.location.search !== newUrl
    ) {
      router.replace(newUrl, { scroll: false });
    }
  }, [period, page, pathname, router, searchParams]);

  const handlePeriodSelection = useCallback(
    (value: string) => {
      setPeriod(getValidPeriod(value));
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', getValidPeriod(value));
      params.set('page', '1');
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('page', String(newPage));
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  const selectedPeriodLabel =
    PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? PERIOD_OPTIONS[0].label;

  const leaderboardTabs = [
    { id: 'funders', label: 'Top Funders', href: '/leaderboard/funders' },
    { id: 'reviewers', label: 'Top Reviewers', href: '/leaderboard/reviewers' },
  ];

  const buildTabHref = (basePath: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('period', period);
    params.set('page', '1'); // Tab switch always resets to page 1
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  const tabsWithHref = leaderboardTabs.map((tab) => ({
    ...tab,
    href: buildTabHref(tab.href!),
  }));

  return (
    <div className="px-0 py-0">
      <MainPageHeader
        icon={<ChartNoAxesColumnIncreasing size={28} color="#3971ff" />}
        title="Leaderboard"
        subtitle="See top contributors in the ResearchHub community"
        showTitle={false}
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:!flex-row md:!items-center md:!justify-between mb-4 gap-4 md:!border-b border-gray-200">
          <Tabs
            tabs={tabsWithHref}
            activeTab={defaultTab}
            onTabChange={() => {}}
            className="flex-grow"
            variant="primary"
          />

          <div className="flex-shrink-0">
            <Dropdown
              trigger={
                <Button variant="outlined" className="w-full sm:w-auto justify-between h-8">
                  <span>{selectedPeriodLabel}</span>
                  <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              }
              anchor="bottom end"
            >
              {PERIOD_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => handlePeriodSelection(option.value)}
                  className={period === option.value ? 'bg-gray-100' : ''}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </Dropdown>
          </div>
        </div>
      </div>

      <div className="mt-4 max-w-4xl mx-auto">
        {defaultTab === 'reviewers' ? (
          <TopPeerReviewers
            period={period}
            page={page}
            onPageChange={handlePageChange}
            currentUser={currentUserLoading ? null : currentUserReviewer}
          />
        ) : (
          <TopFunders
            period={period}
            page={page}
            onPageChange={handlePageChange}
            currentUser={currentUserLoading ? null : currentUserFunder}
          />
        )}
      </div>
    </div>
  );
}
