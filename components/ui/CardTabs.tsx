import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import Link from 'next/link';

export interface CardTab {
  id: string;
  amount?: string | null;
  title: string;
  subtitle?: string;
  href?: string;
  scroll?: boolean;
}

interface CardTabsProps {
  tabs: CardTab[];
  activeTab: string;
  onTabChange: (tabId: string, e?: React.MouseEvent) => void;
  disabled?: boolean;
  className?: string;
}

const CardTabItem: React.FC<{
  tab: CardTab;
  isActive: boolean;
  disabled: boolean;
  onTabChange: (id: string, e: React.MouseEvent) => void;
}> = ({ tab, isActive, disabled, onTabChange }) => {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    onTabChange(tab.id, e);
  };

  const styles = cn(
    'inline-flex flex-col rounded-lg px-3 py-1.5',
    'font-medium transition-all duration-150 select-none flex-shrink-0 cursor-pointer',
    isActive ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    disabled && 'cursor-not-allowed pointer-events-none opacity-50'
  );

  const content = (
    <>
      <span
        className={cn(
          'font-semibold font-mono text-[14px] leading-tight tabular-nums',
          !tab.amount && (isActive ? 'text-gray-400' : 'text-gray-300')
        )}
      >
        {tab.amount || '—'}
      </span>
      <span
        className={cn(
          'text-[13px] leading-snug font-medium truncate mt-0.5',
          isActive ? 'text-gray-300' : 'text-gray-500'
        )}
      >
        {tab.title}
      </span>
    </>
  );

  if (tab.href && !disabled) {
    return (
      <Link
        href={tab.href}
        scroll={tab.scroll ?? false}
        onClick={handleClick}
        className={styles}
        title={tab.title}
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
      title={tab.title}
    >
      {content}
    </button>
  );
};

export const CardTabs: React.FC<CardTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  disabled = false,
  className,
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
          <CardTabItem
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            disabled={disabled}
            onTabChange={onTabChange}
          />
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
