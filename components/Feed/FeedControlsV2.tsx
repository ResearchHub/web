import React from 'react';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown, TrendingUp, Clock, Calendar, Settings, Sparkles } from 'lucide-react';
import { cn } from '@/utils/styles';

interface FeedControlsV2Props {
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
  { value: 'best', label: 'Best', icon: Sparkles },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
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

export function FeedControlsV2({
  sortBy,
  timePeriod,
  showCustomize,
  activeFilterCount,
  onSortChange,
  onTimePeriodChange,
  onToggleCustomize,
}: FeedControlsV2Props) {
  const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  const currentTimePeriod = TIME_PERIOD_OPTIONS.find((opt) => opt.value === timePeriod);
  const showTimePeriod = sortBy === 'trending' || sortBy === 'newest';

  return (
    <div className="flex justify-between items-center mb-6 border-b border-gray-200 relative">
      <div className="flex items-center">
        {/* Sort Tab-like Dropdown */}
        <Dropdown
          trigger={
            <div
              className={cn(
                'flex items-center gap-2 px-4 pb-3 pt-3 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer whitespace-nowrap',
                'text-rhBlue-500 border-rhBlue-500 hover:bg-gray-50',
                '-mb-[1px]' // This ensures the border sits directly on the dividing line
              )}
            >
              {currentSortOption?.icon && (
                <currentSortOption.icon className="w-4 h-4 flex-shrink-0" />
              )}
              {currentSortOption?.label}
              <ChevronDown className="w-4 h-4 ml-1" />
            </div>
          }
          anchor="bottom start"
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={sortBy === option.value ? 'bg-rhBlue-50 text-rhBlue-600' : ''}
            >
              <option.icon
                className={cn('w-4 h-4 mr-2', sortBy === option.value && 'text-rhBlue-500')}
              />
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Time Period Tab-like Dropdown - only shown for trending/newest */}
        {showTimePeriod && (
          <Dropdown
            trigger={
              <div
                className={cn(
                  'flex items-center gap-2 px-4 pb-3 pt-3 text-sm font-medium border-b-2 transition-colors duration-200 cursor-pointer whitespace-nowrap',
                  'text-gray-700 border-transparent hover:text-gray-900 hover:border-gray-200',
                  '-mb-[1px]' // This ensures the border sits directly on the dividing line
                )}
              >
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="hidden sm:inline">{currentTimePeriod?.label}</span>
                <span className="sm:hidden">
                  {currentTimePeriod?.shortLabel || currentTimePeriod?.label}
                </span>
                <ChevronDown className="w-4 h-4 ml-1" />
              </div>
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
        )}
      </div>

      {/* Customize Results Button */}
      <Button
        variant="outlined"
        onClick={onToggleCustomize}
        className="flex items-center gap-2 -mt-[6px]"
      >
        <Settings className={cn('w-4 h-4', showCustomize && 'animate-spin-slow')} />
        <span>Filters</span>
        {activeFilterCount > 0 && (
          <span className="ml-1 bg-rhBlue-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>
    </div>
  );
}
