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
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
  variant?: 'underline' | 'pill';
  disabled?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
  variant = 'underline',
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLElement | null>>({});
  const moreButtonRef = useRef<HTMLButtonElement | null>(null);

  const [overflowIds, setOverflowIds] = useState<string[]>([]);

  const calculateOverflow = useCallback(() => {
    if (!containerRef.current) return;

    // Ensure refs are populated for calculation
    const allRefsReady = tabs.every((tab) => tabRefs.current[tab.id] !== undefined);
    if (!allRefsReady) {
      // Optionally, schedule a re-run shortly if refs aren't ready
      // setTimeout(calculateOverflow, 50);
      return;
    }

    const containerWidth = containerRef.current.clientWidth;

    let moreBtnWidth = 0;
    if (moreButtonRef.current && moreButtonRef.current.offsetParent !== null) {
      // Measure only if the button is actually rendered (not display: none)
      moreBtnWidth = moreButtonRef.current.getBoundingClientRect().width || 40; // Fallback estimate
    }

    let visibleWidth = 0;
    const currentVisibleIds: string[] = [];
    const currentOverflowIds: string[] = [];

    for (const tab of tabs) {
      const ref = tabRefs.current[tab.id];
      if (!ref) continue; // Skip if ref isn't available (shouldn't happen with check above)

      const styles = window.getComputedStyle(ref);
      const marginLeft = parseFloat(styles.marginLeft) || 0;
      const marginRight = parseFloat(styles.marginRight) || 0;
      const elementWidth = ref.getBoundingClientRect().width;
      const itemWidth = elementWidth + marginLeft + marginRight;

      // Check if ADDING this tab would exceed the available width
      if (visibleWidth + itemWidth <= containerWidth - moreBtnWidth) {
        visibleWidth += itemWidth;
        currentVisibleIds.push(tab.id);
      } else {
        // This tab and all subsequent tabs go into overflow
        currentOverflowIds.push(tab.id);
      }
    }

    // If the loop finished and some tabs are in overflow, assign them
    if (currentOverflowIds.length > 0) {
      // Add remaining tabs (those after the first overflowed one) to overflowIds
      const firstOverflowIndex = tabs.findIndex((t) => t.id === currentOverflowIds[0]);
      const subsequentIds = tabs.slice(firstOverflowIndex + 1).map((t) => t.id);
      const finalOverflowIds = [...new Set([...currentOverflowIds, ...subsequentIds])]; // Ensure unique IDs

      // --- Ensure active tab visibility logic (Simplified approach) ---
      if (finalOverflowIds.includes(activeTab)) {
        let potentialVisibleWidth = 0;
        const visibleTabsTryingToKeepActive: string[] = [];
        let activeTabWidth = 0;
        const activeRef = tabRefs.current[activeTab];
        if (activeRef) {
          const styles = window.getComputedStyle(activeRef);
          activeTabWidth =
            activeRef.getBoundingClientRect().width +
            (parseFloat(styles.marginLeft) || 0) +
            (parseFloat(styles.marginRight) || 0);
        }

        // Recalculate visible width trying to include the active tab
        for (const tab of tabs) {
          if (tab.id === activeTab) continue; // Skip active tab for now
          if (finalOverflowIds.includes(tab.id)) continue; // Skip already overflowed

          const ref = tabRefs.current[tab.id];
          if (!ref) continue;
          const styles = window.getComputedStyle(ref);
          const itemWidth =
            ref.getBoundingClientRect().width +
            (parseFloat(styles.marginLeft) || 0) +
            (parseFloat(styles.marginRight) || 0);

          if (potentialVisibleWidth + itemWidth + activeTabWidth <= containerWidth - moreBtnWidth) {
            potentialVisibleWidth += itemWidth;
            visibleTabsTryingToKeepActive.push(tab.id);
          } else {
            // Cannot fit this one and the active tab, break early?
            // Or let the original overflow stand? For simplicity, let original stand for now.
            // More complex logic could try removing the *last* item from visibleTabsTryingToKeepActive
            break;
          }
        }

        // Check if we successfully made space for the active tab
        if (potentialVisibleWidth + activeTabWidth <= containerWidth - moreBtnWidth) {
          // Yes, create new overflow list excluding the active tab and the ones we kept visible
          const keptVisibleIds = [...visibleTabsTryingToKeepActive, activeTab];
          const newOverflowIds = tabs
            .filter((t) => !keptVisibleIds.includes(t.id))
            .map((t) => t.id);
          setOverflowIds(newOverflowIds);
          return; // Exit with the adjusted list
        }
        // Else, could not make space, fall through to use finalOverflowIds
      }

      setOverflowIds(finalOverflowIds);
    } else {
      // No overflow detected
      setOverflowIds([]);
    }
  }, [tabs, activeTab]); // Removed refs from dependencies, calculation runs until refs are ready

  const debouncedCalculateOverflow = useRef(debounce(calculateOverflow, 100)).current; // Slightly shorter debounce

  useLayoutEffect(() => {
    // Run calculation immediately on layout effect
    calculateOverflow();
    // Setup resize listener with debounce
    // (Handled in useEffect below)
  }, [tabs, activeTab, calculateOverflow]); // Dependencies

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
        isActive ? 'bg-indigo-100 text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
      );
    }

    return cn(
      'px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center gap-1 whitespace-nowrap flex-shrink-0',
      isActive
        ? 'text-indigo-600 border-indigo-600'
        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200',
      disabled && 'opacity-50 cursor-not-allowed pointer-events-none'
    );
  };

  const wrapperStyles = cn(
    'flex items-center w-full overflow-hidden flex-nowrap relative',
    variant === 'pill' && 'rounded-lg bg-gray-100 p-1',
    variant === 'underline' && 'border-b border-gray-200',
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
          className={cn(
            'flex items-center flex-shrink-0',
            variant === 'underline' ? 'ml-6' : 'ml-1'
          )}
          style={{ marginLeft: variant === 'underline' ? '24px' : '4px' }}
        >
          <div className={cn(getTabStyles(tab, true), variant === 'underline' ? 'mr-6' : 'mr-1')} />
          <button {...commonButtonProps}>{buttonContent}</button>
        </div>
      );
    }

    return (
      <button
        {...commonButtonProps}
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
          'flex items-center flex-nowrap h-full overflow-hidden', // Added overflow-hidden here
          variant === 'pill' ? 'space-x-1' : '',
          variant === 'underline' ? 'space-x-6' : ''
        )}
      >
        {visibleTabs.map(renderTabButton)}
      </div>

      {/* Absolute positioned container for the More button */}
      <div
        className={cn(
          'absolute right-0 top-0 bottom-0 flex items-center pr-1',
          variant === 'underline' ? 'bg-white' : 'bg-gray-100',
          overflowTabs.length === 0 ? 'invisible' : 'visible'
        )}
        style={{
          background:
            variant === 'underline'
              ? 'linear-gradient(to right, transparent, white 20%, white)'
              : 'linear-gradient(to right, transparent, #f3f4f6 20%, #f3f4f6)',
        }} // Fade effect
      >
        <BaseMenu
          align="end"
          trigger={
            <button
              ref={moreButtonRef}
              className={cn(
                'p-1.5 flex items-center justify-center rounded-md flex-shrink-0', // Adjusted padding slightly
                'border border-gray-300', // Added border
                'hover:bg-gray-50', // Adjusted hover state
                activeTab &&
                  overflowIds.includes(activeTab) &&
                  'bg-indigo-100 text-indigo-600 border-indigo-200', // Active state with border
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
              className={cn(activeTab === tab.id && 'bg-indigo-50 font-medium')}
            >
              {tab.label}
            </BaseMenuItem>
          ))}
        </BaseMenu>
      </div>
    </div>
  );
};
