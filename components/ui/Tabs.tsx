import { cn } from '@/utils/styles';
import { LucideIcon, MoreHorizontal } from 'lucide-react';
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { debounce } from 'lodash';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);
  const tabMeasurements = useRef<
    Record<string, { width: number; marginLeft: number; marginRight: number }>
  >({});

  const [overflowIds, setOverflowIds] = useState<string[]>([]);

  const calculateOverflow = useCallback(() => {
    if (!containerRef.current) {
      return;
    }

    const containerWidth = containerRef.current.clientWidth;

    // Estimate More button width (conservative estimate)
    const estimatedMoreBtnWidth = 40;

    // First, measure all tabs if we have refs available
    const availableRefs = tabs.filter((tab) => tabRefs.current[tab.id]);

    if (availableRefs.length > 0) {
      // Update measurements for available tabs
      availableRefs.forEach((tab) => {
        const ref = tabRefs.current[tab.id];
        if (ref) {
          const styles = window.getComputedStyle(ref);
          const width = ref.getBoundingClientRect().width;
          const marginLeft = parseFloat(styles.marginLeft) || 0;
          const marginRight = parseFloat(styles.marginRight) || 0;

          tabMeasurements.current[tab.id] = { width, marginLeft, marginRight };
        }
      });
    }

    // Use stored measurements for calculation, fallback to refs if available
    let visibleWidth = 0;
    const currentVisibleIds: string[] = [];
    const currentOverflowIds: string[] = [];

    for (const tab of tabs) {
      let itemWidth = 0;

      // Try to get measurement from stored data first
      if (tabMeasurements.current[tab.id]) {
        const measurement = tabMeasurements.current[tab.id];
        itemWidth = measurement.width + measurement.marginLeft + measurement.marginRight;
      } else {
        // Fallback to ref measurement if available
        const ref = tabRefs.current[tab.id];
        if (ref) {
          const styles = window.getComputedStyle(ref);
          const width = ref.getBoundingClientRect().width;
          const marginLeft = parseFloat(styles.marginLeft) || 0;
          const marginRight = parseFloat(styles.marginRight) || 0;
          itemWidth = width + marginLeft + marginRight;

          // Store the measurement for future use
          tabMeasurements.current[tab.id] = { width, marginLeft, marginRight };
        } else {
          continue;
        }
      }

      // Check if adding this tab would exceed the available width
      if (visibleWidth + itemWidth <= containerWidth - estimatedMoreBtnWidth) {
        visibleWidth += itemWidth;
        currentVisibleIds.push(tab.id);
      } else {
        // This tab and all subsequent tabs go into overflow
        currentOverflowIds.push(tab.id);
      }
    }

    // If we have overflow tabs, ensure the active tab is visible if possible
    if (currentOverflowIds.length > 0) {
      // Add remaining tabs to overflow
      const firstOverflowIndex = tabs.findIndex((t) => t.id === currentOverflowIds[0]);
      const subsequentIds = tabs.slice(firstOverflowIndex + 1).map((t) => t.id);
      const finalOverflowIds = [...new Set([...currentOverflowIds, ...subsequentIds])];

      // If active tab is in overflow, try to make it visible
      if (finalOverflowIds.includes(activeTab)) {
        const activeMeasurement = tabMeasurements.current[activeTab];
        if (activeMeasurement) {
          const activeTabWidth =
            activeMeasurement.width + activeMeasurement.marginLeft + activeMeasurement.marginRight;

          // Try to fit the active tab by removing tabs from the end of visible list
          let adjustedVisibleIds = [...currentVisibleIds];
          let adjustedVisibleWidth = visibleWidth;

          // Remove tabs from the end until we can fit the active tab
          while (adjustedVisibleIds.length > 0) {
            const lastVisibleTab = adjustedVisibleIds[adjustedVisibleIds.length - 1];
            const lastTabMeasurement = tabMeasurements.current[lastVisibleTab];

            if (lastTabMeasurement) {
              const lastTabWidth =
                lastTabMeasurement.width +
                lastTabMeasurement.marginLeft +
                lastTabMeasurement.marginRight;

              // Check if removing this tab and adding the active tab would fit
              const newWidth = adjustedVisibleWidth - lastTabWidth + activeTabWidth;
              if (newWidth <= containerWidth - estimatedMoreBtnWidth) {
                // Success! Remove the last tab and add the active tab
                adjustedVisibleIds.pop();
                adjustedVisibleIds.push(activeTab);
                const newOverflowIds = tabs
                  .filter((t) => !adjustedVisibleIds.includes(t.id))
                  .map((t) => t.id);
                setOverflowIds(newOverflowIds);
                return;
              }

              // Remove this tab and continue
              adjustedVisibleIds.pop();
              adjustedVisibleWidth -= lastTabWidth;
            } else {
              break;
            }
          }
        }
      }

      setOverflowIds(finalOverflowIds);
    } else {
      // No overflow detected
      setOverflowIds([]);
    }
  }, [tabs, activeTab]);

  const debouncedCalculateOverflow = useRef(debounce(calculateOverflow, 100)).current;

  useLayoutEffect(() => {
    // Run calculation immediately on layout effect
    calculateOverflow();
  }, [tabs, activeTab, calculateOverflow]);

  useEffect(() => {
    // Effect for resize handling
    if (typeof window === 'undefined') return;

    const handleResize = () => debouncedCalculateOverflow();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      debouncedCalculateOverflow.cancel();
    };
  }, [debouncedCalculateOverflow]);

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
      'px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap flex-shrink-0',
      isActive
        ? 'text-primary-600 border-primary-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );
  };

  const wrapperStyles = cn(
    'flex items-center w-full overflow-hidden flex-nowrap relative',
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

  // Filter tabs based on the calculated state
  const visibleTabs = tabs.filter((t) => !overflowIds.includes(t.id));
  const overflowTabs = tabs.filter((t) => overflowIds.includes(t.id));

  return (
    <div className={wrapperStyles} ref={containerRef}>
      {/* Container for visible tabs */}
      <div
        className={cn(
          'flex items-center flex-nowrap h-full overflow-hidden',
          variant === 'pill' ? 'space-x-1' : '',
          variant === 'primary' ? 'space-x-6' : ''
        )}
      >
        {visibleTabs.map(renderTabButton)}
      </div>

      {/* Absolute positioned container for the More button */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 flex items-center pr-1',
          variant === 'primary' ? 'bg-white' : 'bg-gray-100',
          overflowTabs.length === 0 ? 'invisible' : 'visible'
        )}
        style={{
          background:
            variant === 'primary'
              ? 'linear-gradient(to right, transparent, white 20%, white)'
              : 'linear-gradient(to right, transparent, #f3f4f6 20%, #f3f4f6)',
        }}
      >
        <BaseMenu
          align="end"
          trigger={
            <button
              ref={moreButtonRef}
              className={cn(
                'p-1.5 flex items-center justify-center rounded-md flex-shrink-0',
                'border border-gray-300',
                'hover:bg-gray-50',
                activeTab &&
                  overflowIds.includes(activeTab) &&
                  'bg-primary-100 text-primary-600 border-primary-200',
                overflowTabs.length > 0 ? 'text-gray-700' : 'text-transparent pointer-events-none'
              )}
              aria-label="More tabs"
              tabIndex={overflowTabs.length === 0 ? -1 : 0}
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          }
        >
          {overflowTabs.map((tab) => (
            <BaseMenuItem
              key={tab.id}
              onSelect={() => {
                onTabChange(tab.id);
              }}
              className={cn(activeTab === tab.id && 'bg-primary-50 font-medium')}
            >
              {tab.label}
            </BaseMenuItem>
          ))}
        </BaseMenu>
      </div>
    </div>
  );
};
