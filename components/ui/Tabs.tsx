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
  onClick?: (e: React.MouseEvent) => void;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string, e?: React.MouseEvent) => void;
  className?: string;
  variant?: 'primary' | 'pill' | 'pill-standalone';
  disabled?: boolean;
}

const TabItem: React.FC<{
  tab: Tab;
  isActive: boolean;
  disabled: boolean;
  variant: 'primary' | 'pill' | 'pill-standalone';
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

  const getVariantStyles = () => {
    if (variant === 'pill') {
      return [
        'px-4 py-2 rounded-lg',
        isActive
          ? 'bg-primary-100 text-primary-600 shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
      ];
    }
    if (variant === 'pill-standalone') {
      return [
        'px-4 py-2 rounded-lg border',
        isActive
          ? 'bg-primary-50 text-primary-600 border-primary-200'
          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50',
      ];
    }
    // primary (default)
    return [
      'px-1 border-b-2 py-3',
      isActive
        ? 'text-primary-600 border-primary-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200',
    ];
  };

  const styles = cn(
    'text-sm font-medium flex items-center gap-1 whitespace-nowrap flex-shrink-0 h-full cursor-pointer',
    getVariantStyles(),
    disabled && 'cursor-not-allowed pointer-events-none'
  );

  const content = (
    <>
      {tab.icon && <tab.icon className="w-4 h-4 flex-shrink-0" />}
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
  disabled = false,
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
  const isPillStandalone = variant === 'pill-standalone';
  const gradient = isPrimary || isPillStandalone ? 'white' : '#f3f4f6';

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
          variant === 'pill'
            ? 'space-x-1 bg-gray-100 p-1 rounded-lg'
            : variant === 'pill-standalone'
              ? 'space-x-2'
              : 'space-x-6'
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
  );
};
