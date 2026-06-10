'use client';

import { ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { Tooltip } from '@/components/ui/Tooltip';

interface SubmitProposalTooltipProps {
  children: ReactNode;
  /** When true, adds a private-visibility breakdown to the tooltip. */
  isPrivate?: boolean;
  wrapperClassName?: string;
}

export function SubmitProposalTooltip({
  children,
  isPrivate,
  wrapperClassName,
}: SubmitProposalTooltipProps) {
  const content = (
    <div className="text-left space-y-3">
      <p className="text-sm text-white leading-snug">
        Create new proposal or upload existing using our notebook
      </p>
      {isPrivate && (
        <>
          <div className="border-t border-gray-700" />
          <div>
            <p className="text-sm text-white leading-snug mb-2">
              Your proposal will only be available:
            </p>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2 text-sm text-white">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Funder</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white">
                <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Peer-reviewers</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white">
                <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span>Community</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white">
                <X className="h-3.5 w-3.5 text-red-400 shrink-0" />
                <span>Discoverable</span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );

  return (
    <Tooltip
      content={content}
      position="bottom"
      width="w-60"
      hideDelay={0}
      className="bg-gray-900 text-white border-gray-900 text-left"
      wrapperClassName={wrapperClassName}
    >
      {children}
    </Tooltip>
  );
}
