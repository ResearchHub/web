'use client';

import { useState } from 'react';
import { EditorFilters, OrderByOption } from '@/types/editor';
import { Button } from '@/components/ui/Button';
import { Grid, ChevronDown } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Select, SelectOption } from '@/components/ui/Select';
import { useHubs } from '@/hooks/useHubs';
import { Hub } from '@/types/hub';

interface EditorsDashboardNavbarProps {
  currentFilters: EditorFilters;
  headerLabel: string;
  onFilterChange: (filters: EditorFilters) => void;
}

const orderByOptions: OrderByOption[] = [
  { value: 'desc', label: 'Descending' },
  { value: 'asc', label: 'Ascending' },
];

export function EditorsDashboardNavbar({
  currentFilters,
  headerLabel,
  onFilterChange,
}: EditorsDashboardNavbarProps) {
  const [isHubModalOpen, setIsHubModalOpen] = useState(false);
  const { hubs, isLoading: hubsLoading } = useHubs();

  const handleHubSelect = (hub: Hub | null) => {
    onFilterChange({ ...currentFilters, selectedHub: hub });
    setIsHubModalOpen(false);
  };

  const handleDateRangeChange = (startDate: Date, endDate: Date) => {
    onFilterChange({
      ...currentFilters,
      timeframe: { startDate, endDate },
    });
  };

  const handleOrderByChange = (option: SelectOption) => {
    onFilterChange({
      ...currentFilters,
      orderBy: { value: option.value as 'desc' | 'asc', label: option.label },
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center">
          <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900">{headerLabel}</h1>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Hub Selector */}
          <div className="relative">
            <Button
              variant="outlined"
              onClick={() => setIsHubModalOpen(true)}
              className="min-w-[140px] justify-between"
              disabled={hubsLoading}
            >
              <div className="flex items-center space-x-2">
                <Grid className="h-4 w-4" />
                <span>{currentFilters.selectedHub?.name || 'All Hubs'}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {isHubModalOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <div className="p-2">
                  <div className="space-y-1">
                    <button
                      onClick={() => handleHubSelect(null)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                    >
                      All Hubs
                    </button>
                    {hubs.map((hub) => (
                      <button
                        key={hub.id}
                        onClick={() => handleHubSelect(hub)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        {hub.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Date Range Picker */}
          <DateRangePicker
            startDate={currentFilters.timeframe.startDate}
            endDate={currentFilters.timeframe.endDate}
            onDateRangeChange={handleDateRangeChange}
            className="min-w-[200px]"
          />

          {/* Order By Selector */}
          <Select
            value={currentFilters.orderBy}
            onValueChange={handleOrderByChange}
            options={orderByOptions}
            placeholder="Sort by"
            className="min-w-[140px]"
          />
        </div>
      </div>
    </div>
  );
}
