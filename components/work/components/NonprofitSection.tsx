'use client';

import { Building, HelpCircle } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';
import { NonprofitDisplay, NonprofitInfoPopover } from '@/components/Nonprofit';
import { NonprofitSkeleton } from '@/components/skeletons/NonprofitSkeleton';
import { ID } from '@/types/root';
import { useNonprofitByFundraiseId } from '@/hooks/useNonprofitByFundraiseId';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { NonprofitOrg } from '@/types/nonprofit';

interface NonprofitSectionProps {
  fundraiseId: ID;
  className?: string;
}

/**
 * Component to display nonprofit information associated with a fundraise
 */
export function NonprofitSection({ fundraiseId, className }: NonprofitSectionProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [infoNonprofit, setInfoNonprofit] = useState<NonprofitOrg | null>(null);
  const [infoPosition, setInfoPosition] = useState({ top: 0, left: 0 });

  const { nonprofit, departmentLabName, isLoading, fetchNonprofitData } =
    useNonprofitByFundraiseId();

  useEffect(() => {
    fetchNonprofitData(fundraiseId);
    setIsMounted(true);
  }, [fundraiseId, fetchNonprofitData]);

  // Handle click outside to close the info popover
  useEffect(() => {
    if (!infoNonprofit) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if we're clicking inside a nonprofit-info-popover element
      const isClickInsidePopover = (event.target as Element)?.closest('.nonprofit-info-popover');
      // Don't close if we're clicking an info button
      const isClickingInfoButton = (event.target as Element)
        ?.closest('button')
        ?.querySelector('.lucide-info');
      // Don't close when clicking the popover X button
      const isClickingX = (event.target as Element)?.closest('.nonprofit-popover-close');

      if (infoNonprofit && !isClickInsidePopover && !isClickingX && !isClickingInfoButton) {
        setInfoNonprofit(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [infoNonprofit]);

  if (!nonprofit && !isLoading && isMounted) {
    return null;
  }

  // Handle nonprofit info click with positioning
  const handleNonprofitInfoClick = (
    nonprofit: NonprofitOrg,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();

    // Get the position of the clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate the ideal horizontal position (centered on button)
    let left = rect.left + rect.width / 2 - 160; // 160 is half the popover width (320px)

    // Ensure the popover stays within horizontal bounds
    if (left < 20) {
      left = 20; // Keep at least 20px from left edge
    } else if (left + 320 > viewportWidth - 20) {
      left = viewportWidth - 320 - 20; // Keep at least 20px from right edge
    }

    // Calculate the ideal vertical position (above the button)
    // If there's not enough room above, position it below
    let top = rect.top - 10;
    let transform = 'translateY(-100%)';

    // If the top position would place the popover outside the viewport
    // (assuming max height of 80vh / ~400-500px), position below instead
    if (rect.top < 400) {
      top = rect.bottom + 10;
      transform = 'none';
    }

    // Set position with the calculated values
    setInfoNonprofit(nonprofit);
    setInfoPosition({ top, left });

    // Update the transform style directly on the element after render
    setTimeout(() => {
      const popover = document.querySelector('.nonprofit-info-popover');
      if (popover) {
        (popover as HTMLElement).style.transform = transform;
      }
    }, 0);
  };

  // Handle closing the info popover
  const handleCloseInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInfoNonprofit(null);
  };

  return (
    <section className={className}>
      <div className="flex items-center space-x-2 mb-4">
        <Building className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Associated Nonprofit</h2>
        <Tooltip
          content={
            <div className="max-w-xs">
              <p>
                Donations are processed through this nonprofit foundation, making your contributions
                ({'>'} $1000) tax-deductible while supporting the researcher&apos;s work.
              </p>
            </div>
          }
          width="w-80"
        >
          <button className="text-gray-400 hover:text-gray-600">
            <HelpCircle className="h-4 w-4" />
          </button>
        </Tooltip>
      </div>

      {isLoading || !isMounted ? (
        <NonprofitSkeleton showHeader={false} />
      ) : (
        nonprofit && (
          <div className="mt-2">
            <NonprofitDisplay
              nonprofit={nonprofit}
              note={departmentLabName || ''}
              onNoteChange={() => {}}
              onInfoClick={(e) => handleNonprofitInfoClick(nonprofit, e)}
              onClear={() => {}}
              isInfoOpen={infoNonprofit?.id === nonprofit.id}
              readOnly={true}
              allowClear={false}
            />
          </div>
        )
      )}

      {/* Info popover for nonprofit details */}
      {infoNonprofit &&
        isMounted &&
        createPortal(
          <NonprofitInfoPopover
            nonprofit={infoNonprofit}
            position={infoPosition}
            onClose={handleCloseInfo}
          />,
          document.body
        )}
    </section>
  );
}
