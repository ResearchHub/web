'use client';

import { NonprofitOrg } from '@/types/nonprofit';
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/utils/styles';

interface NonprofitDisplayProps {
  nonprofit: NonprofitOrg;
  departmentLabName?: string;
  className?: string;
}

export function NonprofitDisplay({
  nonprofit,
  departmentLabName,
  className,
}: NonprofitDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const baseDeployment = nonprofit.deployments.find((deployment) => deployment.chainId === 8453);

  return (
    <div className={cn('rounded-md overflow-hidden bg-gray-50', className)}>
      {/* Basic Info */}
      <div className="p-3 flex justify-between items-start">
        <div className="flex-1 pr-2">
          <h4 className="text-sm font-medium text-gray-800">{nonprofit.name}</h4>
          <p className="text-xs text-gray-500 mt-0.5">EIN: {nonprofit.ein}</p>
          {departmentLabName && (
            <p className="text-xs text-gray-500 mt-1">Note: {departmentLabName}</p>
          )}
        </div>
        <button
          className={cn(
            'p-1.5 rounded-full text-gray-400 transition-colors',
            isExpanded
              ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              : 'hover:bg-gray-200 hover:text-gray-600'
          )}
          onClick={() => setIsExpanded(!isExpanded)}
          type="button"
          aria-expanded={isExpanded}
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-xs">
            {nonprofit.address.region && (
              <>
                <span className="text-gray-500 font-medium">Location:</span>
                <span className="text-gray-700">
                  {nonprofit.address.region}, {nonprofit.address.country}
                </span>
              </>
            )}

            {nonprofit.nteeCode && (
              <>
                <span className="text-gray-500 font-medium">Category:</span>
                <span className="text-gray-700">
                  {nonprofit.nteeCode} - {nonprofit.nteeDescription}
                </span>
              </>
            )}

            {baseDeployment && (
              <>
                <span className="text-gray-500 font-medium">Base Address:</span>
                <a
                  href={`https://basescan.org/address/${baseDeployment.address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 transition-colors"
                >
                  {baseDeployment.address.slice(0, 8)}...{baseDeployment.address.slice(-6)}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </>
            )}
          </div>

          {nonprofit.description && (
            <div className="text-xs">
              <h4 className="text-gray-500 font-medium mb-1">About</h4>
              <p className="text-gray-700 leading-relaxed">{nonprofit.description}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
