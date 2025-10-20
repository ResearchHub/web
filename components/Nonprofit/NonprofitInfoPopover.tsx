'use client';

import { NonprofitOrg } from '@/types/nonprofit';
import { ExternalLink, X } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { CHAIN_IDS } from '@/constants/chains';

interface NonprofitInfoPopoverProps {
  nonprofit: NonprofitOrg;
  position: { top: number; left: number };
  onClose: (e: React.MouseEvent) => void;
}

export function NonprofitInfoPopover({ nonprofit, position, onClose }: NonprofitInfoPopoverProps) {
  const baseDeployment = nonprofit.deployments.find(
    (deployment) => deployment.chainId === CHAIN_IDS.BASE
  );
  const endaomentId = nonprofit.endaomentOrgId;
  const [isBelow, setIsBelow] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Detect if popover is positioned below the info button
  useEffect(() => {
    if (popoverRef.current) {
      const computedStyle = window.getComputedStyle(popoverRef.current);
      const transform = computedStyle.transform;
      setIsBelow(transform === 'none' || !transform.includes('translateY(-100%)'));
    }
  }, []);

  return (
    <div
      ref={popoverRef}
      className="nonprofit-info-popover fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200 max-h-[60vh] flex flex-col"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="overflow-y-auto">
        <div className="p-4">
          <div className="flex justify-between items-start sticky top-0 bg-white z-10">
            <h3 className="text-base font-semibold text-gray-900 flex-1 mr-2">{nonprofit.name}</h3>
            <Button
              className="nonprofit-popover-close text-gray-400 hover:text-gray-600"
              onClick={onClose}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          {nonprofit.ein && (
            <a
              href={`https://app.endaoment.org/orgs/${nonprofit.ein.substring(0, 2)}-${nonprofit.ein.substring(2)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary-600 hover:underline flex items-center gap-1 mb-2 block"
              onClick={(e) => e.stopPropagation()}
            >
              View on Endaoment
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          )}

          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              {nonprofit.ein && (
                <>
                  <span className="text-gray-500">EIN:</span>
                  <span className="font-medium">
                    {nonprofit.ein.substring(0, 2) + '-' + nonprofit.ein.substring(2)}
                  </span>
                </>
              )}

              <span className="text-gray-500">Location:</span>
              <span>
                {nonprofit.address.region}, {nonprofit.address.country}
              </span>

              <span className="text-gray-500">Category:</span>
              <span className="break-words">
                {nonprofit.nteeCode} - {nonprofit.nteeDescription}
              </span>

              <span className="text-gray-500">Endaoment ID:</span>
              <span className="font-medium break-words">{endaomentId}</span>

              {baseDeployment && (
                <>
                  <span className="text-gray-500">Base Address:</span>
                  <a
                    href={`https://basescan.org/address/${baseDeployment.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline flex items-center gap-1 break-all"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {baseDeployment.address.slice(0, 8)}...{baseDeployment.address.slice(-6)}
                    <ExternalLink className="h-3 w-3 flex-shrink-0" />
                  </a>
                </>
              )}
            </div>

            {nonprofit.description && (
              <div className="pt-3 border-t border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
                <p className="text-sm text-gray-600">{nonprofit.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {isBelow ? (
        // Arrow on top (when popover is below)
        <div className="absolute top-0 right-4 transform translate-y-[-8px] rotate-45 w-4 h-4 bg-white border-l border-t border-gray-200"></div>
      ) : (
        // Arrow on bottom (when popover is above)
        <div className="absolute bottom-0 right-4 transform translate-y-[8px] rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
      )}
    </div>
  );
}
