import { cn } from '@/utils/styles';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Tab {
  id: string;
  label: React.ReactNode;
  href?: string;
  scroll?: boolean;
  highlight?: boolean;
  separator?: boolean;
  icon?: LucideIcon;
  /** An emoji rendered in place of a lucide icon (Airbnb-style). */
  emoji?: string;
  iconClassName?: string;
  activeClassName?: string;
  onClick?: (e: React.MouseEvent) => void;
}

/** 'sm' trims the label, icon and row height a step below the default. */
export type TabSize = 'sm' | 'md';

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string, e?: React.MouseEvent) => void;
  className?: string;
  variant?: 'primary' | 'pill';
  size?: TabSize;
  disabled?: boolean;
  /** Center the tab items within the bar instead of left-aligning them. */
  centered?: boolean;
}

const TabItem: React.FC<{
  tab: Tab;
  isActive: boolean;
  disabled: boolean;
  variant: 'primary' | 'pill';
  size: TabSize;
  onTabChange: (id: string, e: React.MouseEvent) => void;
}> = ({ tab, isActive, disabled, variant, size, onTabChange }) => {
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

  const isSmall = size === 'sm';
  const isPill = variant === 'pill';
  const iconClass = isPill
    ? isSmall
      ? 'w-3.5 h-3.5'
      : 'w-4 h-4'
    : isSmall
      ? 'w-[18px] h-[18px]'
      : 'w-5 h-5';
  const emojiClass = isPill
    ? isSmall
      ? 'text-[16px]'
      : 'text-[18px]'
    : isSmall
      ? 'text-[22px]'
      : 'text-[26px]';

  const styles = cn(
    'font-semibold flex items-center whitespace-nowrap flex-shrink-0 cursor-pointer transition-all duration-150',
    isSmall ? 'gap-1.5' : 'gap-2',
    isPill
      ? [
          'px-4 rounded-full',
          isSmall ? 'text-[13px] py-1.5' : 'text-sm py-2',
          isActive
            ? 'border border-gray-300 bg-white text-gray-900 shadow-sm'
            : 'text-gray-500 hover:text-gray-700',
        ]
      : [
          'border-b-4 h-full',
          isSmall ? 'text-[15px] py-3' : 'text-base py-3.5',
          isActive
            ? tab.activeClassName || 'text-primary-600 border-b-primary-600'
            : 'text-gray-800 border-transparent hover:text-gray-700 hover:border-gray-200',
        ],
    disabled && 'cursor-not-allowed pointer-events-none'
  );

  const content = (
    <>
      {tab.emoji ? (
        <span
          className={cn('leading-none flex-shrink-0', emojiClass, tab.iconClassName)}
          aria-hidden="true"
        >
          {tab.emoji}
        </span>
      ) : (
        tab.icon && <tab.icon className={cn('flex-shrink-0', iconClass, tab.iconClassName)} />
      )}
      <span className="truncate">{tab.label}</span>
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
  size = 'md',
  disabled = false,
  centered = false,
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
    <div className={cn('w-full relative', className)}>
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
          centered && 'justify-center',
          variant === 'pill' ? 'gap-2' : cn('-mb-px', size === 'sm' ? 'space-x-6' : 'space-x-8')
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
              size={size}
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
  );
};
