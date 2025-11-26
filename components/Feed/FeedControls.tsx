import React, { useState, useEffect } from 'react';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown, TrendingUp, Clock, Calendar, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';

interface FeedControlsProps {
  sortBy: string;
  timePeriod: string;
  showCustomize: boolean;
  activeFilterCount: number;
  onSortChange: (sort: string) => void;
  onTimePeriodChange: (period: string) => void;
  onToggleCustomize: () => void;
}

interface TimePeriodOption {
  value: string;
  label: string;
  shortLabel?: string;
}

const SORT_OPTIONS = [
  { value: 'best', label: 'For you', icon: Sparkles },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'trending-v2', label: 'Trending V2', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
];

const TIME_PERIOD_OPTIONS: TimePeriodOption[] = [
  { value: 'LAST_24H', label: 'Last 24 hours', shortLabel: '24h' },
  { value: 'LAST_3_DAYS', label: 'Last 3 days', shortLabel: '3 days' },
  { value: 'LAST_WEEK', label: 'Last week', shortLabel: 'This week' },
  { value: 'LAST_MONTH', label: 'Last month', shortLabel: 'This month' },
  { value: 'LAST_3_MONTHS', label: 'Last 3 months', shortLabel: '3 months' },
  { value: 'LAST_YEAR', label: 'Last year', shortLabel: 'This year' },
  { value: 'ALL_TIME', label: 'All time', shortLabel: 'All time' },
];

export function FeedControls({
  sortBy,
  timePeriod,
  showCustomize,
  activeFilterCount,
  onSortChange,
  onTimePeriodChange,
  onToggleCustomize,
}: FeedControlsProps) {
  const currentTimePeriod = TIME_PERIOD_OPTIONS.find((opt) => opt.value === timePeriod);
  const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        {/* Sort Pills - Desktop */}
        {!isMobile && (
          <div className="inline-flex items-center gap-2">
            {SORT_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={cn(
                  'px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap',
                  sortBy === option.value
                    ? 'bg-rhBlue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}

        {/* Sort Dropdown - Mobile */}
        {isMobile && (
          <Dropdown
            trigger={
              <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-rhBlue-600 rounded-full hover:bg-rhBlue-700 transition-colors">
                {currentSortOption?.icon && <currentSortOption.icon className="w-4 h-4" />}
                <span>{currentSortOption?.label}</span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </button>
            }
            anchor="bottom start"
          >
            {SORT_OPTIONS.map((option) => (
              <DropdownItem
                key={option.value}
                onClick={() => onSortChange(option.value)}
                className={sortBy === option.value ? 'bg-rhBlue-50 text-rhBlue-600' : ''}
              >
                <option.icon className="w-4 h-4 mr-2" />
                {option.label}
              </DropdownItem>
            ))}
          </Dropdown>
        )}

        {/* Time Period Dropdown - always visible */}
        <Dropdown
          trigger={
            <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
              <span className="hidden sm:!inline">{currentTimePeriod?.label}</span>
              <span className="sm:!hidden">
                {currentTimePeriod?.shortLabel || currentTimePeriod?.label}
              </span>
              <ChevronDown className="w-4 h-4 ml-1" />
            </button>
          }
          anchor="bottom start"
        >
          {TIME_PERIOD_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => onTimePeriodChange(option.value)}
              className={timePeriod === option.value ? 'bg-rhBlue-50 text-rhBlue-600' : ''}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      {/* Customize Results Button */}
      <button
        onClick={onToggleCustomize}
        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all duration-200"
      >
        <Settings className={cn('w-5 h-5', showCustomize && 'animate-spin-slow')} />
        <span>Customize</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-rhBlue-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>
    </div>
  );
}
