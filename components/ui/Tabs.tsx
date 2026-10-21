import { cn } from '@/utils/styles';
import { ChevronLeft, ChevronRight, type LucideIcon, type LucideProps } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { CountBadge } from '@/components/ui/CountBadge';

type TabsVariant = 'primary' | 'pill' | 'segmented';

/** A Font Awesome icon in the shape a tab's `icon` takes. */
export function fontAwesomeTabIcon(icon: IconDefinition): LucideIcon {
  return function FontAwesomeTabIcon({ className }: LucideProps) {
    return <FontAwesomeIcon icon={icon} className={className} />;
  } as LucideIcon;
}

/** A tab's count: grey on the segmented control, the tab's colour on an active underlined one. */
function countBadgeClass(variant: TabsVariant, isActive: boolean) {
  if (variant === 'segmented') return 'bg-gray-200';
  if (variant === 'primary') {
    return cn(
      'rounded-full px-2',
      isActive ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
    );
  }
  return undefined;
}

interface Tab {
  id: string;
  label: React.ReactNode;
  /** Shown in a small badge after the label. */
  count?: number | string;
  href?: string;
  scroll?: boolean;
  highlight?: boolean;
  separator?: boolean;
  icon?: LucideIcon;
  activeIcon?: LucideIcon;
  iconClassName?: string;
  activeClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string, e?: React.MouseEvent) => void;
  className?: string;
  /**
   * `primary` underlines the active tab, `pill` rings it, and `segmented` sets
   * the tabs side by side in one grey control, the active one raised in white,
   * with their labels and counts but not their icons.
   */
  variant?: TabsVariant;
  disabled?: boolean;
  /** Rendered at the right end of the tab row, outside the scrollable strip. */
  rightContent?: React.ReactNode;
  /** Underlined tabs set closer together, for a narrow column. */
  compact?: boolean;
}

const TabItem: React.FC<{
  tab: Tab;
  isActive: boolean;
  disabled: boolean;
  variant: TabsVariant;
  onTabChange: (id: string, e: React.MouseEvent) => void;
}> = ({ tab, isActive, disabled, variant, onTabChange }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    tab.onClick?.(e);
    if (!e.defaultPrevented) {
      onTabChange(tab.id, e);
    }
  };

  const styles = cn(
    'text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer transition-all duration-150',
    variant === 'primary' && [
      'border-b-2 py-3 h-full',
      isActive
        ? tab.activeClassName || 'text-primary-600 border-b-primary-600'
        : 'text-gray-800 border-transparent hover:text-gray-700 hover:border-gray-200',
    ],
    variant === 'pill' && [
      'px-4 py-2 rounded-full',
      isActive
        ? 'border border-gray-300 bg-white text-gray-900 shadow-sm'
        : 'text-gray-500 hover:text-gray-700',
    ],
    // Each tab grows to share the control's width, but never narrower than its
    // label, so a row with more tabs than fit scrolls instead of squeezing them.
    variant === 'segmented' && [
      'h-[38px] flex-1 justify-center rounded-lg px-3',
      isActive
        ? 'bg-white text-gray-900 shadow-[0_1px_2px_rgba(17,24,39,0.12)]'
        : 'text-gray-600 hover:text-gray-900',
    ],
    disabled && 'cursor-not-allowed pointer-events-none'
  );

  // The segmented control shows labels and counts only.
  const Icon =
    variant === 'segmented' ? undefined : isActive && tab.activeIcon ? tab.activeIcon : tab.icon;

  const content = (
    <>
      {Icon && <Icon className={cn('w-4 h-4 flex-shrink-0', tab.iconClassName)} />}
      <span className="truncate">{tab.label}</span>
      {tab.count != null && (
        <CountBadge count={tab.count} className={countBadgeClass(variant, isActive)} />
      )}
    </>
  );

  const commonProps = {
    onClick: handleClick,
    className: styles,
    title: typeof tab.label === 'string' ? tab.label : undefined,
  };

  if (tab.href && !disabled) {
    return (
      <Link href={tab.href} scroll={tab.scroll ?? false} {...commonProps}>
        {content}
      </Link>
    );
  }

  return (
    <button disabled={disabled} type="button" {...commonProps}>
      {content}
    </button>
  );
};

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'primary',
  disabled = false,
  rightContent,
  compact = false,
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

  const isPrimary = variant === 'primary';
  const gradient = isPrimary ? 'white' : '#f3f4f6';

  return (
    <div className={cn('w-full relative', isPrimary && 'border-b border-gray-200', className)}>
      {/* The scroll strip gets its own relative box so the fade/arrow overlays
          stay pinned to it rather than to the row, which may also hold
          rightContent on its right edge. */}
      <div className="flex h-full items-center gap-3">
        <div className="relative h-full min-w-0 flex-1">
          <div
            className={cn(
              'absolute left-0 top-0 bottom-0 z-10 flex items-center pr-2 transition-opacity duration-200',
              canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
            )}
            style={{ background: `linear-gradient(to left, transparent, ${gradient} 40%)` }}
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
            className={cn(
              'flex items-center flex-nowrap h-full overflow-x-auto scrollbar-none',
              isPrimary && (compact ? 'space-x-6 -mb-px' : 'space-x-8 -mb-px'),
              variant === 'pill' && 'gap-2',
              variant === 'segmented' && 'gap-0.5 rounded-[10px] bg-gray-100 p-[3px]'
            )}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {tabs.map((tab) => (
              <React.Fragment key={tab.id}>
                {tab.separator && (
                  <div
                    className={cn(
                      'h-6 w-px bg-gray-300 flex-shrink-0',
                      isPrimary ? 'ml-6 mr-6' : 'ml-1 mr-1'
                    )}
                  />
                )}
                <TabItem
                  tab={tab}
                  isActive={activeTab === tab.id}
                  disabled={disabled}
                  variant={variant}
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
            style={{ background: `linear-gradient(to right, transparent, ${gradient} 40%)` }}
          >
            <button
              onClick={() => scroll('right')}
              className="p-1 rounded-full hover:bg-gray-200/80 text-gray-500 hover:text-gray-700"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
      </div>
    </div>
  );
};
