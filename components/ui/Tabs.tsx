import { cn } from '@/utils/styles';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface Tab {
  id: string;
  label: React.ReactNode;
  highlight?: boolean;
  separator?: boolean;
  icon?: LucideIcon;
  onClick?: () => void;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'primary' | 'pill';
  disabled?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'primary',
  disabled = false,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
  }, []);

  // Check scrollability on mount and when tabs change
  useEffect(() => {
    checkScrollability();
    // Also check after a short delay to account for rendering
    const timeout = setTimeout(checkScrollability, 100);
    return () => clearTimeout(timeout);
  }, [tabs, checkScrollability]);

  // Scroll active tab into view when it changes
  useEffect(() => {
    const activeTabRef = tabRefs.current[activeTab];
    if (activeTabRef && scrollContainerRef.current) {
      activeTabRef.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest',
      });
      // Check scrollability after scroll animation
      setTimeout(checkScrollability, 300);
    }
  }, [activeTab, checkScrollability]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.6;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const getTabStyles = (tab: Tab, isSeparatorElement: boolean = false) => {
    const isActive = activeTab === tab.id;

    if (isSeparatorElement) {
      return 'h-6 w-px bg-gray-300';
    }

    if (variant === 'pill') {
      return cn(
        'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center gap-1 flex-shrink-0 whitespace-nowrap',
        isActive
          ? 'bg-primary-100 text-primary-600 shadow-sm'
          : 'text-gray-500 hover:text-gray-700',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      );
    }

    return cn(
      'px-1 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-1 whitespace-nowrap flex-shrink-0 h-full',
      variant === 'primary' && !className?.includes('py-') && 'py-3',
      isActive
        ? 'text-primary-600 border-primary-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );
  };

  const wrapperStyles = cn(
    'w-full',
    variant === 'pill' && 'rounded-lg bg-gray-100 p-1',
    disabled && 'opacity-50',
    className
  );

  const renderTabButton = (tab: Tab) => {
    const Icon = tab.icon;
    const buttonContent = (
      <>
        {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        <span className="truncate">{tab.label}</span>
      </>
    );

    const commonButtonProps = {
      key: tab.id,
      onClick: () => !disabled && onTabChange(tab.id),
      className: getTabStyles(tab),
      disabled: disabled,
      title: typeof tab.label === 'string' ? tab.label : undefined,
    };

    if (tab.separator) {
      return (
        <div
          key={`${tab.id}-wrapper`}
          ref={(el) => {
            tabRefs.current[tab.id] = el;
          }}
          className={cn('flex items-center flex-shrink-0', variant === 'primary' ? 'ml-6' : 'ml-1')}
          style={{ marginLeft: variant === 'primary' ? '24px' : '4px' }}
        >
          <div className={cn(getTabStyles(tab, true), variant === 'primary' ? 'mr-6' : 'mr-1')} />
          <button {...commonButtonProps}>{buttonContent}</button>
        </div>
      );
    }

    return (
      <button
        {...commonButtonProps}
        key={tab.id}
        ref={(el) => {
          tabRefs.current[tab.id] = el;
        }}
      >
        {buttonContent}
      </button>
    );
  };

  const gradientBg =
    variant === 'primary'
      ? 'linear-gradient(to right, transparent, white 40%)'
      : 'linear-gradient(to right, transparent, #f3f4f6 40%)';

  const gradientBgLeft =
    variant === 'primary'
      ? 'linear-gradient(to left, transparent, white 40%)'
      : 'linear-gradient(to left, transparent, #f3f4f6 40%)';

  return (
    <div className={cn(wrapperStyles, 'relative')}>
      {/* Left scroll indicator */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 z-10 flex items-center pl-0 pr-2 transition-opacity duration-200',
          canScrollLeft ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: gradientBgLeft }}
      >
        <button
          onClick={() => scroll('left')}
          className={cn(
            'p-1 rounded-full hover:bg-gray-200/80 transition-colors',
            'text-gray-500 hover:text-gray-700'
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className={cn(
          'flex items-center flex-nowrap h-full overflow-x-auto scrollbar-none',
          variant === 'pill' ? 'space-x-1' : 'space-x-6'
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {tabs.map(renderTabButton)}
      </div>

      {/* Right scroll indicator */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 z-10 flex items-center pr-0 pl-2 transition-opacity duration-200',
          canScrollRight ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{ background: gradientBg }}
      >
        <button
          onClick={() => scroll('right')}
          className={cn(
            'p-1 rounded-full hover:bg-gray-200/80 transition-colors',
            'text-gray-500 hover:text-gray-700'
          )}
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
