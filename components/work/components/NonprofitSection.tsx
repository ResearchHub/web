'use client';

import { Building, HelpCircle } from 'lucide-react';
import {
  NonprofitDisplay,
  NonprofitInfoPopover,
  EndaomentInfoPopover,
} from '@/components/Nonprofit';
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
  const [showEndaomentInfo, setShowEndaomentInfo] = useState(false);
  const [endaomentInfoPosition, setEndaomentInfoPosition] = useState({
    top: 0,
    left: 0,
    arrowPosition: 0,
  });

  const { nonprofit, departmentLabName, isLoading, fetchNonprofitData } =
    useNonprofitByFundraiseId();

  useEffect(() => {
    fetchNonprofitData(fundraiseId);
    setIsMounted(true);
  }, [fundraiseId, fetchNonprofitData]);

  // Handle click outside to close the info popovers
  useEffect(() => {
    if (!infoNonprofit && !showEndaomentInfo) return;

    const handleClickOutside = (event: MouseEvent) => {
      // Don't close if we're clicking inside a nonprofit-info-popover element
      const isClickInsidePopover =
        (event.target as Element)?.closest('.nonprofit-info-popover') ||
        (event.target as Element)?.closest('.endaoment-info-popover');
      // Don't close if we're clicking an info button
      const isClickingInfoButton = (event.target as Element)
        ?.closest('button')
        ?.querySelector('.lucide-info');
      // Don't close when clicking the popover X button
      const isClickingX = (event.target as Element)?.closest('.nonprofit-popover-close');

      if (
        (infoNonprofit || showEndaomentInfo) &&
        !isClickInsidePopover &&
        !isClickingX &&
        !isClickingInfoButton
      ) {
        setInfoNonprofit(null);
        setShowEndaomentInfo(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [infoNonprofit, showEndaomentInfo]);

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
    setShowEndaomentInfo(false);
    setInfoPosition({ top, left });

    // Update the transform style directly on the element after render
    setTimeout(() => {
      const popover = document.querySelector('.nonprofit-info-popover');
      if (popover) {
        (popover as HTMLElement).style.transform = transform;
      }
    }, 0);
  };

  // Handle endaoment info click with positioning
  const handleEndaomentInfoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    // Get the position of the clicked element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Calculate position similar to nonprofit info
    let left = rect.left + rect.width / 2 - 192; // 192 is half the popover width (384px)
    const viewportWidth = window.innerWidth;

    // Ensure the popover stays within horizontal bounds
    if (left < 20) {
      left = 20;
    } else if (left + 384 > viewportWidth - 20) {
      left = viewportWidth - 384 - 20;
    }

    // Calculate vertical position
    let top = rect.top - 10;

    // Calculate the correct horizontal position to place the arrow
    // The button is centered in the top bar, so we want the arrow to point at it
    let arrowPosition = rect.left - left + rect.width / 2;

    // Make sure arrow position is reasonable (not too close to edges)
    if (arrowPosition < 40) arrowPosition = 40;
    if (arrowPosition > 384 - 40) arrowPosition = 384 - 40;

    // Set position and show popover
    setShowEndaomentInfo(true);
    setInfoNonprofit(null);
    setEndaomentInfoPosition({
      top,
      left,
      arrowPosition,
    });
  };

  // Handle closing the info popover
  const handleCloseInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInfoNonprofit(null);
  };

  // Handle closing the endaoment info popover
  const handleCloseEndaomentInfo = () => {
    setShowEndaomentInfo(false);
  };

  return (
    <section className={className}>
      <div className="flex items-center space-x-2 mb-4">
        <Building className="h-5 w-5 text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Associated Nonprofit</h2>
        <button className="text-gray-400 hover:text-gray-600" onClick={handleEndaomentInfoClick}>
          <HelpCircle className="h-4 w-4" />
        </button>
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

      {/* Endaoment info popover with alternate text about tax deductions */}
      {showEndaomentInfo &&
        isMounted &&
        createPortal(
          <EndaomentInfoPopover
            position={endaomentInfoPosition}
            onClose={handleCloseEndaomentInfo}
            useAlternateText={true}
          />,
          document.body
        )}
    </section>
  );
}
