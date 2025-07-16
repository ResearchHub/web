import React from 'react';
import { Button } from '@/components/ui/Button';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { ChevronDown, TrendingUp, Clock, Calendar, Settings, Sparkles } from 'lucide-react';

interface FeedControlsProps {
  sortBy: string;
  timePeriod: string;
  showCustomize: boolean;
  activeFilterCount: number;
  onSortChange: (sort: string) => void;
  onTimePeriodChange: (period: string) => void;
  onToggleCustomize: () => void;
}

const SORT_OPTIONS = [
  { value: 'best', label: 'Best', icon: Sparkles },
  { value: 'trending', label: 'Trending', icon: TrendingUp },
  { value: 'newest', label: 'Newest', icon: Clock },
];

const TIME_PERIOD_OPTIONS = [
  { value: 'LAST_24H', label: 'Last 24 hours' },
  { value: 'LAST_3_DAYS', label: 'Last 3 days' },
  { value: 'LAST_WEEK', label: 'Last week' },
  { value: 'LAST_MONTH', label: 'Last month' },
  { value: 'LAST_3_MONTHS', label: 'Last 3 months' },
  { value: 'LAST_YEAR', label: 'Last year' },
  { value: 'ALL_TIME', label: 'All time' },
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
  const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);
  const currentTimePeriod = TIME_PERIOD_OPTIONS.find((opt) => opt.value === timePeriod);

  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex gap-3 items-center">
        {/* Sort Dropdown */}
        <Dropdown
          trigger={
            <Button variant="default" className="flex items-center gap-2">
              {currentSortOption?.icon && <currentSortOption.icon className="w-4 h-4" />}
              {currentSortOption?.label}
              <ChevronDown className="w-4 h-4" />
            </Button>
          }
        >
          {SORT_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={sortBy === option.value ? 'bg-gray-100' : ''}
            >
              <option.icon className="w-4 h-4 mr-2" />
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>

        {/* Time Period Dropdown */}
        <Dropdown
          trigger={
            <Button variant="outlined" className="flex items-center gap-2 whitespace-nowrap">
              <Calendar className="w-4 h-4" />
              {currentTimePeriod?.label}
              <ChevronDown className="w-4 h-4" />
            </Button>
          }
        >
          {TIME_PERIOD_OPTIONS.map((option) => (
            <DropdownItem
              key={option.value}
              onClick={() => onTimePeriodChange(option.value)}
              className={timePeriod === option.value ? 'bg-gray-100' : ''}
            >
              {option.label}
            </DropdownItem>
          ))}
        </Dropdown>
      </div>

      {/* Customize Results Button */}
      <Button
        variant={showCustomize ? 'default' : 'outlined'}
        onClick={onToggleCustomize}
        className="flex items-center gap-2"
      >
        <Settings className={`w-4 h-4 ${showCustomize ? 'animate-spin-slow' : ''}`} />
        Customize Results
        {activeFilterCount > 0 ? (
          <span className="ml-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        ) : (
          <span className="ml-1 text-xs text-gray-500">(All)</span>
        )}
      </Button>
    </div>
  );
}
