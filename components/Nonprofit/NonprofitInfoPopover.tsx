'use client';

import { NonprofitOrg } from '@/types/nonprofit';
import { ExternalLink, X } from 'lucide-react';

interface NonprofitInfoPopoverProps {
  nonprofit: NonprofitOrg;
  position: { top: number; left: number };
  onClose: (e: React.MouseEvent) => void;
}

export function NonprofitInfoPopover({ nonprofit, position, onClose }: NonprofitInfoPopoverProps) {
  // Find Base network deployment (chainId: 8453)
  const baseDeployment = nonprofit.deployments.find((deployment) => deployment.chainId === 8453);
  const endaomentId = nonprofit.endaoment_org_id || nonprofit.id;

  return (
    <div
      className="nonprofit-info-popover fixed z-50 w-80 bg-white rounded-lg shadow-xl border border-gray-200"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: 'translateY(-100%)', // Position above the element
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-base font-semibold text-gray-900">{nonprofit.name}</h3>
          <button
            className="nonprofit-popover-close text-gray-400 hover:text-gray-600 p-1"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <span className="text-gray-500">EIN:</span>
            <span className="font-medium">{nonprofit.ein}</span>

            <span className="text-gray-500">Location:</span>
            <span>
              {nonprofit.address.region}, {nonprofit.address.country}
            </span>

            <span className="text-gray-500">Category:</span>
            <span>
              {nonprofit.nteeCode} - {nonprofit.nteeDescription}
            </span>

            <span className="text-gray-500">Endaoment ID:</span>
            <span className="font-medium">{endaomentId}</span>

            {baseDeployment && (
              <>
                <span className="text-gray-500">Base Address:</span>
                <a
                  href={`https://basescan.org/address/${baseDeployment.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  {baseDeployment.address.slice(0, 8)}...{baseDeployment.address.slice(-6)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>

          {nonprofit.description && (
            <div className="pt-3 border-t border-gray-100">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Description</h4>
              <p className="text-sm text-gray-600 max-h-24 overflow-y-auto">
                {nonprofit.description}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="absolute bottom-0 right-4 transform translate-y-[8px] rotate-45 w-4 h-4 bg-white border-r border-b border-gray-200"></div>
    </div>
  );
}
