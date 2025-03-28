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

  useEffect(() => {
    if (!infoNonprofit && !showEndaomentInfo) return;

    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsidePopover =
        (event.target as Element)?.closest('.nonprofit-info-popover') ||
        (event.target as Element)?.closest('.endaoment-info-popover');
      const isClickingInfoButton = (event.target as Element)
        ?.closest('button')
        ?.querySelector('.lucide-info');
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

  const handleNonprofitInfoClick = (
    nonprofit: NonprofitOrg,
    e: React.MouseEvent<HTMLButtonElement>
  ) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    let left = rect.left + rect.width / 2 - 160;

    if (left < 20) {
      left = 20;
    } else if (left + 320 > viewportWidth - 20) {
      left = viewportWidth - 320 - 20;
    }

    let top = rect.top - 10;
    let transform = 'translateY(-100%)';

    if (rect.top < 400) {
      top = rect.bottom + 10;
      transform = 'none';
    }

    setInfoNonprofit(nonprofit);
    setShowEndaomentInfo(false);
    setInfoPosition({ top, left });

    setTimeout(() => {
      const popover = document.querySelector('.nonprofit-info-popover');
      if (popover) {
        (popover as HTMLElement).style.transform = transform;
      }
    }, 0);
  };

  const handleEndaomentInfoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    e.preventDefault();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let left = rect.left + rect.width / 2 - 192;
    const viewportWidth = window.innerWidth;

    if (left < 20) {
      left = 20;
    } else if (left + 384 > viewportWidth - 20) {
      left = viewportWidth - 384 - 20;
    }

    let top = rect.top - 10;
    let arrowPosition = rect.left - left + rect.width / 2;

    if (arrowPosition < 40) arrowPosition = 40;
    if (arrowPosition > 384 - 40) arrowPosition = 384 - 40;

    setShowEndaomentInfo(true);
    setInfoNonprofit(null);
    setEndaomentInfoPosition({
      top,
      left,
      arrowPosition,
    });
  };

  const handleCloseInfo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInfoNonprofit(null);
  };

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
