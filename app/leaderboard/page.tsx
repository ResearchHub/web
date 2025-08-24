'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { LeaderboardService } from '@/services/leaderboard.service';
import { TopReviewer, TopFunder } from '@/types/leaderboard';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { Input } from '@/components/ui/form/Input';
import Link from 'next/link';
import {
  ChevronDownIcon,
  Calendar as CalendarIcon,
  ChartNoAxesColumnIncreasing,
} from 'lucide-react';
import {
  formatDate,
  getLastWeekRange,
  getLastMonthRange,
  getLastYearRange,
  DATE_FORMAT,
} from '@/lib/dateUtils';
import { parseISO, isValid, differenceInDays } from 'date-fns';
import { PageLayout } from '@/app/layouts/PageLayout';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { BaseModal as Modal } from '@/components/ui/BaseModal';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import Icon from '@/components/ui/icons/Icon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWreathLaurel } from '@fortawesome/pro-light-svg-icons';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { faMedal, faRibbon, faStar } from '@fortawesome/pro-solid-svg-icons';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

// Skeleton for the list items
const LeaderboardListSkeleton = () => (
  <div className="space-y-3 animate-pulse mt-4">
    {[...Array(10)].map((_, i) => (
      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-4">
          <div className="w-8 h-6 bg-gray-200 rounded"></div> {/* Rank */}
          <div className="w-10 h-10 bg-gray-200 rounded-full"></div> {/* Avatar (md size) */}
          <div className="h-6 bg-gray-200 rounded w-36"></div> {/* Name (base size) */}
        </div>
        <div className="h-6 bg-gray-200 rounded w-20"></div> {/* RSC/Funding (md size) */}
      </div>
    ))}
  </div>
);

// Helper to get dates from preset
const getDatesFromPreset = (preset: string): { start: Date; end: Date } => {
  switch (preset) {
    case 'lastMonth':
      return getLastMonthRange();
    case 'lastYear':
      return getLastYearRange();
    case 'lastWeek': // Default case
    default:
      return getLastWeekRange();
  }
};

// Define presets
const presetOptions = [
  { value: 'lastWeek', label: 'Last 7 Days' },
  { value: 'lastMonth', label: 'Last 30 Days' },
  // { value: 'lastYear', label: 'Last 365 Days' },
  // { value: 'custom', label: 'Custom Range' },
];

// Function to determine preset based on dates
const getPresetFromDates = (start: Date, end: Date): string => {
  const lastWeek = getLastWeekRange();
  if (
    formatDate(start) === formatDate(lastWeek.start) &&
    formatDate(end) === formatDate(lastWeek.end)
  ) {
    return 'lastWeek';
  }
  const lastMonth = getLastMonthRange();
  if (
    formatDate(start) === formatDate(lastMonth.start) &&
    formatDate(end) === formatDate(lastMonth.end)
  ) {
    return 'lastMonth';
  }
  const lastYear = getLastYearRange();
  if (
    formatDate(start) === formatDate(lastYear.start) &&
    formatDate(end) === formatDate(lastYear.end)
  ) {
    return 'lastYear';
  }
  return 'custom'; // If dates don't match a preset
};

// Custom Date Range Modal Component
const CustomDateRangeModal = ({
  isOpen,
  onClose,
  initialStartDate,
  initialEndDate,
  onApply,
}: {
  isOpen: boolean;
  onClose: () => void;
  initialStartDate?: Date;
  initialEndDate?: Date;
  onApply: (start: Date, end: Date) => void;
}) => {
  const [modalStartDate, setModalStartDate] = useState<Date | undefined>(initialStartDate);
  const [modalEndDate, setModalEndDate] = useState<Date | undefined>(initialEndDate);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sync internal state if initial props change while modal is open
    setModalStartDate(initialStartDate);
    setModalEndDate(initialEndDate);
  }, [initialStartDate, initialEndDate, isOpen]);

  const handleApplyClick = () => {
    if (modalStartDate && modalEndDate && isValid(modalStartDate) && isValid(modalEndDate)) {
      if (differenceInDays(modalEndDate, modalStartDate) < 0) {
        setError('End date cannot be before start date.');
        return;
      }
      setError(null);
      onApply(modalStartDate, modalEndDate);
      onClose();
    } else {
      setError('Please select valid start and end dates.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          Select Custom Date Range
        </h3>
        <Input
          type="date"
          label="Start Date"
          value={modalStartDate ? formatDate(modalStartDate) : ''}
          max={modalEndDate ? formatDate(modalEndDate) : undefined}
          onChange={(e) => {
            const newDate = parseISO(e.target.value);
            if (isValid(newDate)) setModalStartDate(newDate);
            else setModalStartDate(undefined); // Handle invalid input
            setError(null); // Clear error on change
          }}
        />
        <Input
          type="date"
          label="End Date"
          value={modalEndDate ? formatDate(modalEndDate) : ''}
          min={modalStartDate ? formatDate(modalStartDate) : undefined}
          onChange={(e) => {
            const newDate = parseISO(e.target.value);
            if (isValid(newDate)) setModalEndDate(newDate);
            else setModalEndDate(undefined); // Handle invalid input
            setError(null); // Clear error on change
          }}
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApplyClick}>Apply</Button>
        </div>
      </div>
    </Modal>
  );
};

function LeaderboardPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showUSD } = useCurrencyPreference();

  const initialTab = searchParams.get('tab') || 'reviewers';
  const initialFromDateStr = searchParams.get('from_date');
  const initialToDateStr = searchParams.get('to_date');

  let initialStartDate: Date;
  let initialEndDate: Date;
  let initialPreset: string;

  // Try to parse dates from URL
  try {
    let parsedStart = initialFromDateStr ? parseISO(initialFromDateStr) : null;
    let parsedEnd = initialToDateStr ? parseISO(initialToDateStr) : null;

    // Validate parsed dates
    if (
      parsedStart &&
      parsedEnd &&
      isValid(parsedStart) &&
      isValid(parsedEnd) &&
      differenceInDays(parsedEnd, parsedStart) >= 0
    ) {
      initialStartDate = parsedStart;
      initialEndDate = parsedEnd;
      initialPreset = getPresetFromDates(initialStartDate, initialEndDate);
    } else {
      // Invalid or missing dates in URL, fallback to default preset
      throw new Error('Invalid or missing dates in URL');
    }
  } catch (e) {
    // Fallback to default preset if URL parsing fails
    // console.warn('Falling back to default date range:', e);
    const defaultPreset = 'lastWeek';
    const presetDates = getDatesFromPreset(defaultPreset);
    initialStartDate = presetDates.start;
    initialEndDate = presetDates.end;
    initialPreset = defaultPreset;
  }

  const [activeTab, setActiveTab] = useState(initialTab);
  const [preset, setPreset] = useState(initialPreset);
  const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);

  const [reviewers, setReviewers] = useState<TopReviewer[]>([]);
  const [funders, setFunders] = useState<TopFunder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);

  const [drawerStartDate, setDrawerStartDate] = useState<Date | undefined>(initialStartDate);
  const [drawerEndDate, setDrawerEndDate] = useState<Date | undefined>(initialEndDate);
  const [isDrawerCustom, setIsDrawerCustom] = useState(initialPreset === 'custom');

  // Helper to render rank with icon
  const renderRank = (rank: number) => {
    if (rank === 1) {
      return (
        <div className="relative w-8 h-6 flex items-center justify-center">
          {' '}
          {/* Adjusted width for larger cards */}
          <FontAwesomeIcon icon={faWreathLaurel} className="text-yellow-500 text-2xl absolute" />
          <span className="relative text-gray-700 text-xs font-bold z-10">1</span>
        </div>
      );
    }
    return <span className="font-semibold text-base w-8 text-center text-gray-500">{rank}</span>;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!startDate || !endDate) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', activeTab);
    params.set('from_date', formatDate(startDate));
    params.set('to_date', formatDate(endDate));

    const newPath = `/leaderboard?${params.toString()}`;
    if (window.location.pathname + window.location.search !== newPath) {
      router.replace(newPath, { scroll: false });
    }
  }, [activeTab, startDate, endDate, router, searchParams]);

  useEffect(() => {
    if (!startDate || !endDate) {
      setIsLoading(false);
      setError('Invalid date range selected.');
      setReviewers([]);
      setFunders([]);
      return;
    }

    const currentPreset = getPresetFromDates(startDate, endDate);
    setPreset(currentPreset);

    setDrawerStartDate(startDate);
    setDrawerEndDate(endDate);
    setIsDrawerCustom(currentPreset === 'custom');

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const startStr = formatDate(startDate);
      const endStr = formatDate(endDate);

      try {
        if (activeTab === 'reviewers') {
          const data = await LeaderboardService.fetchReviewers(startStr, endStr);
          // Filter out reviewers with 0 RSC
          setReviewers(data.filter((reviewer) => reviewer.earnedRsc > 0));
          setFunders([]);
        } else {
          const data = await LeaderboardService.fetchFunders(startStr, endStr);
          // Filter out funders with 0 RSC
          setFunders(data.filter((funder) => funder.totalFunding > 0));
          setReviewers([]);
        }
      } catch (err) {
        console.error(`Failed to fetch ${activeTab}:`, err);
        setError(`Failed to load ${activeTab} data.`);
        setReviewers([]);
        setFunders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate, activeTab]);

  const handlePresetSelection = useCallback(
    (value: string) => {
      if (value === 'custom') {
        if (isMobile) {
          setIsDrawerCustom(true);
        } else {
          setIsDateModalOpen(true);
        }
      } else {
        const { start, end } = getDatesFromPreset(value);
        setStartDate(start);
        setEndDate(end);
        setPreset(value);
        if (isMobile) {
          setIsDateDrawerOpen(false);
        }
      }
    },
    [isMobile]
  );

  const handleApplyCustomDates = useCallback((newStart: Date, newEnd: Date) => {
    setStartDate(newStart);
    setEndDate(newEnd);
    setPreset('custom');
    setIsDateModalOpen(false);
  }, []);

  const handleApplyDrawerCustomDates = useCallback(() => {
    if (drawerStartDate && drawerEndDate && isValid(drawerStartDate) && isValid(drawerEndDate)) {
      if (differenceInDays(drawerEndDate, drawerStartDate) >= 0) {
        setStartDate(drawerStartDate);
        setEndDate(drawerEndDate);
        setPreset('custom');
        setIsDateDrawerOpen(false);
      } else {
        console.error('End date cannot be before start date in drawer.');
      }
    }
  }, [drawerStartDate, drawerEndDate]);

  const leaderboardTabs = [
    { id: 'reviewers', label: 'Top Reviewers' },
    { id: 'funders', label: 'Top Funders' },
  ];

  const currentEffectivePreset =
    startDate && endDate ? getPresetFromDates(startDate, endDate) : preset;
  const selectedPresetLabel =
    presetOptions.find((p) => p.value === currentEffectivePreset)?.label || 'Select Range';

  const dateDrawerContent = (
    <div className="p-4 space-y-4">
      <h3 className="text-lg font-medium mb-4">Select Date Range</h3>
      {presetOptions.map(
        (option) =>
          option.value !== 'custom' && (
            <Button
              key={option.value}
              variant={
                currentEffectivePreset === option.value && !isDrawerCustom ? 'default' : 'outlined'
              }
              onClick={() => handlePresetSelection(option.value)}
              className="w-full justify-start"
            >
              {option.label}
            </Button>
          )
      )}
      {/* <Button
        variant={isDrawerCustom ? 'default' : 'outlined'}
        onClick={() => {
          setIsDrawerCustom(true);
          if (!isDrawerCustom) {
            setDrawerStartDate(startDate);
            setDrawerEndDate(endDate);
          }
        }}
        className="w-full justify-start"
      >
        Custom Range
      </Button> */}

      {isDrawerCustom && (
        <div className="space-y-3 pt-3 border-t mt-3">
          <Input
            type="date"
            label="Start Date"
            value={drawerStartDate ? formatDate(drawerStartDate) : ''}
            max={drawerEndDate ? formatDate(drawerEndDate) : undefined}
            onChange={(e) => {
              const newDate = parseISO(e.target.value);
              if (isValid(newDate)) setDrawerStartDate(newDate);
              else setDrawerStartDate(undefined);
            }}
            wrapperClassName="flex-1"
          />
          <Input
            type="date"
            label="End Date"
            value={drawerEndDate ? formatDate(drawerEndDate) : ''}
            min={drawerStartDate ? formatDate(drawerStartDate) : undefined}
            onChange={(e) => {
              const newDate = parseISO(e.target.value);
              if (isValid(newDate)) setDrawerEndDate(newDate);
              else setDrawerEndDate(undefined);
            }}
            wrapperClassName="flex-1"
          />
          <Button onClick={handleApplyDrawerCustomDates} className="w-full mt-2">
            Apply Custom Range
          </Button>
        </div>
      )}
      <Button
        variant="ghost"
        onClick={() => setIsDateDrawerOpen(false)}
        className="w-full mt-4 text-gray-600"
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <div className="px-0 py-0">
      <MainPageHeader
        icon={<ChartNoAxesColumnIncreasing size={28} />}
        title="Leaderboard"
        subtitle="See top earners on ResearchHub for a given period."
      />

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:!flex-row md:!items-center md:!justify-between mb-4 gap-4 md:!border-b border-gray-200">
          <Tabs
            tabs={leaderboardTabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="flex-grow"
            variant="primary"
          />

          <div className="flex-shrink-0">
            {isMobile ? (
              <Button
                variant="outlined"
                onClick={() => setIsDateDrawerOpen(true)}
                className="w-full justify-between"
              >
                <span>{selectedPresetLabel}</span>
                <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            ) : (
              <Dropdown
                trigger={
                  <Button variant="outlined" className="w-full sm:w-auto justify-between h-8">
                    <span>{selectedPresetLabel}</span>
                    <ChevronDownIcon className="ml-2 h-4 w-4 opacity-50" />
                  </Button>
                }
                anchor="bottom end"
              >
                {presetOptions.map((option) => (
                  <DropdownItem
                    key={option.value}
                    onClick={() => handlePresetSelection(option.value)}
                    className={currentEffectivePreset === option.value ? 'bg-gray-100' : ''}
                  >
                    {option.label}
                  </DropdownItem>
                ))}
              </Dropdown>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 max-w-4xl mx-auto">
        {isLoading ? (
          <LeaderboardListSkeleton />
        ) : error ? (
          <p className="text-center text-red-600 py-4">{error}</p>
        ) : activeTab === 'reviewers' ? (
          reviewers.length > 0 ? (
            <div className="space-y-2">
              {reviewers.map((reviewer, index) => {
                const rank = index + 1;
                const authorId = reviewer.authorProfile?.id;
                return (
                  <div
                    key={reviewer.id}
                    onClick={() =>
                      reviewer.authorProfile?.id &&
                      navigateToAuthorProfile(reviewer.authorProfile.id)
                    }
                    className="flex items-center justify-between hover:bg-gray-100 p-4 rounded-lg border cursor-pointer"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      {renderRank(rank)}
                      {authorId ? (
                        <AuthorTooltip authorId={authorId}>
                          <Avatar
                            src={reviewer.authorProfile.profileImage}
                            alt={reviewer.authorProfile.fullName}
                            size="md"
                            authorId={authorId}
                          />
                        </AuthorTooltip>
                      ) : (
                        <Avatar
                          src={reviewer.authorProfile.profileImage}
                          alt={reviewer.authorProfile.fullName}
                          size="md"
                        />
                      )}
                      <div className="flex flex-col min-w-0">
                        {authorId ? (
                          <AuthorTooltip authorId={authorId}>
                            <span className="text-base font-medium text-gray-900 truncate">
                              {reviewer.authorProfile.fullName}
                            </span>
                          </AuthorTooltip>
                        ) : (
                          <span className="text-base font-medium text-gray-900 truncate">
                            {reviewer.authorProfile.fullName}
                          </span>
                        )}
                        {reviewer.authorProfile.headline && (
                          <span className="text-sm text-gray-500 line-clamp-2">
                            {reviewer.authorProfile.headline}
                          </span>
                        )}
                        <div className="block sm:!hidden">
                          <CurrencyBadge
                            amount={reviewer.earnedRsc}
                            variant="text"
                            size="md"
                            label={showUSD ? 'USD Earned' : 'RSC Earned'}
                            currency={showUSD ? 'USD' : 'RSC'}
                            textColor="text-gray-700"
                            currencyLabelColor="text-gray-500"
                            showIcon={true}
                            showText={false}
                            className="px-0"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:!block">
                      <CurrencyBadge
                        amount={reviewer.earnedRsc}
                        variant="text"
                        size="md"
                        label={showUSD ? 'USD Earned' : 'RSC Earned'}
                        currency={showUSD ? 'USD' : 'RSC'}
                        textColor="text-gray-700"
                        currencyLabelColor="text-gray-500"
                        showIcon={true}
                        showText={false}
                        className="whitespace-nowrap"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-4">No reviewers found for this period.</p>
          )
        ) : funders.length > 0 ? (
          <div className="space-y-2">
            {funders.map((funder, index) => {
              const rank = index + 1;
              const authorId = funder.authorProfile?.id;
              return (
                <div
                  key={funder.id}
                  onClick={() =>
                    funder.authorProfile?.id && navigateToAuthorProfile(funder.authorProfile.id)
                  }
                  className="flex items-center justify-between hover:bg-gray-100 p-4 rounded-lg border cursor-pointer"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {renderRank(rank)}
                    {authorId ? (
                      <AuthorTooltip authorId={authorId}>
                        <Avatar
                          src={funder.authorProfile.profileImage}
                          alt={funder.authorProfile.fullName}
                          size="md"
                          authorId={authorId}
                        />
                      </AuthorTooltip>
                    ) : (
                      <Avatar
                        src={funder.authorProfile.profileImage}
                        alt={funder.authorProfile.fullName}
                        size="md"
                      />
                    )}
                    <div className="flex flex-col min-w-0">
                      {authorId ? (
                        <AuthorTooltip authorId={authorId}>
                          <span className="text-base font-medium text-gray-900 truncate">
                            {funder.authorProfile.fullName}
                          </span>
                        </AuthorTooltip>
                      ) : (
                        <span className="text-base font-medium text-gray-900 truncate">
                          {funder.authorProfile.fullName}
                        </span>
                      )}
                      {funder.authorProfile.headline && (
                        <span className="text-sm text-gray-500 line-clamp-2">
                          {funder.authorProfile.headline}
                        </span>
                      )}
                      <div className="block sm:!hidden">
                        <CurrencyBadge
                          amount={funder.totalFunding}
                          variant="text"
                          size="md"
                          label={showUSD ? 'USD Funded' : 'RSC Funded'}
                          currency={showUSD ? 'USD' : 'RSC'}
                          textColor="text-gray-700"
                          currencyLabelColor="text-gray-500"
                          showIcon={true}
                          showText={false}
                          className="px-0"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="hidden sm:!block">
                    <CurrencyBadge
                      amount={funder.totalFunding}
                      variant="text"
                      size="md"
                      label={showUSD ? 'USD Funded' : 'RSC Funded'}
                      currency={showUSD ? 'USD' : 'RSC'}
                      textColor="text-gray-700"
                      currencyLabelColor="text-gray-500"
                      showIcon={true}
                      showText={false}
                      className="whitespace-nowrap"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">No funders found for this period.</p>
        )}
      </div>

      {!isMobile && (
        <CustomDateRangeModal
          isOpen={isDateModalOpen}
          onClose={() => setIsDateModalOpen(false)}
          initialStartDate={startDate}
          initialEndDate={endDate}
          onApply={handleApplyCustomDates}
        />
      )}

      {isMobile && (
        <SwipeableDrawer
          isOpen={isDateDrawerOpen}
          onClose={() => setIsDateDrawerOpen(false)}
          showCloseButton={false}
          height="auto"
          className="max-h-[80vh]"
        >
          {dateDrawerContent}
        </SwipeableDrawer>
      )}
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <PageLayout rightSidebar={true}>
      <Suspense
        fallback={
          <div className="px-0 py-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <ChartNoAxesColumnIncreasing size={28} />
              ResearchHub Leaderboard
            </h1>
            <p className="text-gray-600 mb-6">
              See the most active contributors on ResearchHub for the selected time period.
            </p>
            <LeaderboardListSkeleton />
          </div>
        }
      >
        <LeaderboardPageContent />
      </Suspense>
    </PageLayout>
  );
}
