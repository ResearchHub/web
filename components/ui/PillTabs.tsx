import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { cn } from '@/utils/styles';
import Link from 'next/link';

export type PillTabSize = 'xs' | 'sm' | 'md' | 'lg';
export type PillTabColorScheme = 'default' | 'indigo';

const sizeClasses: Record<PillTabSize, { pill: string; icon: string; separator: string }> = {
  xs: { pill: 'gap-1 px-2 py-0.5 text-[11px]', icon: 'w-3 h-3', separator: 'h-3.5' },
  sm: { pill: 'gap-1 px-2.5 py-1 text-xs', icon: 'w-3 h-3', separator: 'h-4' },
  md: { pill: 'gap-1.5 px-2.5 py-1 text-[13px]', icon: 'w-3.5 h-3.5', separator: 'h-5' },
  lg: { pill: 'gap-1.5 px-3 py-1.5 text-[13px]', icon: 'w-3.5 h-3.5', separator: 'h-5' },
};

export interface PillTab {
  id: string;
  label: React.ReactNode;
  href?: string;
  scroll?: boolean;
  separator?: boolean;
  icon?: LucideIcon;
}

interface PillTabsProps {
  tabs: PillTab[];
  activeTab: string;
  onTabChange: (tabId: string, e?: React.MouseEvent) => void;
  disabled?: boolean;
  size?: PillTabSize;
  colorScheme?: PillTabColorScheme;
  className?: string;
  /** When set, persists horizontal scroll position across remounts via a module-level cache. */
  scrollCacheKey?: string;
}

const _scrollCache = new Map<string, number>();

const colorSchemes: Record<PillTabColorScheme, { active: string; inactive: string }> = {
  default: {
    active: 'bg-gray-900 text-white',
    inactive: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  },
  indigo: {
    active: 'bg-indigo-200/80 text-indigo-800',
    inactive: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100',
  },
};

const PillTabItem: React.FC<{
  tab: PillTab;
  isActive: boolean;
  disabled: boolean;
  size: PillTabSize;
  scheme: PillTabColorScheme;
  onTabChange: (id: string, e: React.MouseEvent) => void;
}> = ({ tab, isActive, disabled, size, scheme, onTabChange }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onTabChange(tab.id, e);
  };

  const s = sizeClasses[size];

  const colors = colorSchemes[scheme];
  const styles = cn(
    'inline-flex items-center rounded-lg font-medium transition-all duration-150 select-none whitespace-nowrap flex-shrink-0 cursor-pointer',
    s.pill,
    isActive ? colors.active : colors.inactive,
    disabled && 'cursor-not-allowed pointer-events-none opacity-50'
  );

  const content = (
    <>
      {tab.icon && <tab.icon className={cn(s.icon, 'flex-shrink-0')} />}
      <span className="truncate">{tab.label}</span>
    </>
  );

  if (tab.href && !disabled) {
    return (
      <Link
        href={tab.href}
        scroll={tab.scroll ?? false}
        onClick={handleClick}
        className={styles}
        title={typeof tab.label === 'string' ? tab.label : undefined}
        data-pilltab-active={isActive || undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={styles}
      title={typeof tab.label === 'string' ? tab.label : undefined}
      data-pilltab-active={isActive || undefined}
    >
      {content}
    </button>
  );
};

export const PillTabs: React.FC<PillTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
  size = 'md',
  colorScheme = 'default',
  className,
  scrollCacheKey,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !scrollCacheKey) return;

    const cached = _scrollCache.get(scrollCacheKey);
    if (cached !== undefined && cached > 0) {
      container.scrollLeft = cached;
    } else {
      const activeEl = container.querySelector('[data-pilltab-active="true"]');
      if (activeEl) {
        (activeEl as HTMLElement).scrollIntoView({
          inline: 'nearest',
          block: 'nearest',
          behavior: 'instant' as ScrollBehavior,
        });
      }
    }

    checkScrollability();
  }, [scrollCacheKey, activeTab]);

  useEffect(() => {
    if (!scrollCacheKey) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      _scrollCache.set(scrollCacheKey, container.scrollLeft);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollCacheKey]);

  useEffect(() => {
    checkScrollability();
    const timeout = setTimeout(checkScrollability, 100);
    return () => clearTimeout(timeout);
  }, [tabs, checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({
      left: container.clientWidth * 0.6 * (direction === 'left' ? -1 : 1),
      behavior: 'smooth',
    });
  };

  return (
    <div className={cn('w-full relative', className)}>
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 transition-opacity duration-200',
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'linear-gradient(to left, transparent, white 40%)' }}
      >
        <button
          onClick={() => scroll('left')}
          className="p-1 rounded-full hover:bg-gray-200/80 text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex items-center gap-2 flex-nowrap overflow-x-auto scrollbar-none py-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => (
          <React.Fragment key={tab.id}>
            {tab.separator && (
              <div
                className={cn(sizeClasses[size].separator, 'w-px bg-gray-300 flex-shrink-0 mx-1')}
              />
            )}
            <PillTabItem
              tab={tab}
              isActive={activeTab === tab.id}
              disabled={disabled}
              size={size}
              scheme={colorScheme}
              onTabChange={onTabChange}
            />
          </React.Fragment>
        ))}
      </div>

      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 z-10 flex items-center pl-2 transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: 'linear-gradient(to right, transparent, white 40%)' }}
      >
        <button
          onClick={() => scroll('right')}
          className="p-1 rounded-full hover:bg-gray-200/80 text-gray-500 hover:text-gray-700"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
