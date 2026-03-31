'use client';

import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { Tabs } from '@/components/ui/Tabs';
import { PillTabs, PillTab } from '@/components/ui/PillTabs';
import { cn } from '@/utils/styles';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  href?: string;
  scroll?: boolean;
  separator?: boolean;
  icon?: import('lucide-react').LucideIcon;
  customAction?: () => void;
}

export type FeedSortOption = 'hot_score_v2' | 'latest';

interface SortOptionItem {
  label: string;
  value: string;
}

interface FeedTabsProps {
  activeTab: string;
  tabs: TabItem[];
  onTabChange: (tab: string, e?: React.MouseEvent) => void;
  isLoading?: boolean;
  showGearIcon?: boolean;
  onGearClick?: () => void;
  showSorting?: boolean;
  sortOption?: string;
  onSortChange?: (sort: string) => void;
  isCompact?: boolean;
  sortOptions?: SortOptionItem[];
}

const defaultSortOptions: SortOptionItem[] = [
  { label: 'Best', value: 'hot_score_v2' },
  { label: 'Latest', value: 'latest' },
];

function FeedSortDropdown({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SortOptionItem[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedLabel = options.find((o) => o.value === value)?.label;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <span ref={containerRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
      >
        <span className="font-medium text-gray-700">{selectedLabel}</span>
        {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1.5 z-50 min-w-[180px] bg-white rounded-xl border border-gray-200 shadow-lg py-1.5 animate-in fade-in slide-in-from-top-1 duration-100">
          {options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              <span
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors',
                  value === option.value ? 'border-primary-500' : 'border-gray-300'
                )}
              >
                {value === option.value && <span className="w-2 h-2 rounded-full bg-primary-500" />}
              </span>
              <span className="text-sm text-gray-800">{option.label}</span>
            </label>
          ))}
        </div>
      )}
    </span>
  );
}

const CUSTOMIZE_TAB_ID = '__customize__';

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  onTabChange,
  isLoading,
  showGearIcon = false,
  onGearClick,
  showSorting = false,
  sortOption = 'hot_score_v2',
  onSortChange,
  sortOptions = defaultSortOptions,
}) => {
  const searchParams = useSearchParams();
  const useLegacyTabs = searchParams.get('exp') === 'tabs';

  const firstSeparatorIdx = tabs.findIndex((tab) => tab.separator);
  const coreTabs = firstSeparatorIdx === -1 ? tabs : tabs.slice(0, firstSeparatorIdx);

  const pillTabs: PillTab[] = useMemo(() => {
    const base: PillTab[] = coreTabs.map((t) => ({
      id: t.id,
      label: t.label,
      href: t.href,
      scroll: t.scroll,
      separator: t.separator,
      icon: t.icon,
    }));

    if (showGearIcon && onGearClick) {
      base.push({
        id: CUSTOMIZE_TAB_ID,
        label: 'Customize',
        icon: Settings,
        separator: true,
      });
    }

    return base;
  }, [coreTabs, showGearIcon, onGearClick]);

  const handlePillTabChange = (tabId: string, e?: React.MouseEvent) => {
    if (tabId === CUSTOMIZE_TAB_ID) {
      e?.preventDefault();
      onGearClick?.();
      return;
    }
    onTabChange(tabId, e);
  };

  const tabContent = useLegacyTabs ? (
    <Tabs
      tabs={coreTabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
      disabled={isLoading}
      className="!border-b-0 h-full py-0"
    />
  ) : (
    <PillTabs
      tabs={pillTabs}
      activeTab={activeTab}
      onTabChange={handlePillTabChange}
      disabled={!!isLoading}
      size="lg"
    />
  );

  return (
    <div className="h-full">
      <div className="flex items-center justify-between gap-2 h-full">
        <div className="min-w-0 flex-1 h-full">{tabContent}</div>

        {showSorting && onSortChange && (
          <div className="flex-shrink-0 hidden sm:block">
            <FeedSortDropdown value={sortOption} onChange={onSortChange} options={sortOptions} />
          </div>
        )}
      </div>

      {showSorting && onSortChange && (
        <div className="flex justify-end sm:hidden mt-2">
          <FeedSortDropdown value={sortOption} onChange={onSortChange} options={sortOptions} />
        </div>
      )}
    </div>
  );
};
