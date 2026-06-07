'use client';

import { Tooltip } from '@/components/ui/Tooltip';

interface SubmitProposalTooltipProps {
  children: React.ReactNode;
  /** Class applied to the trigger wrapper (e.g. to make it fill its column). */
  wrapperClassName?: string;
}

export function SubmitProposalTooltip({ children, wrapperClassName }: SubmitProposalTooltipProps) {
  return (
    <Tooltip
      content="Create new proposal or upload existing using our notebook"
      position="bottom"
      width="w-56"
      hideDelay={0}
      className="!bg-gray-900 !text-white !border-gray-900 !-mt-1"
      wrapperClassName={wrapperClassName}
    >
      {children}
    </Tooltip>
  );
}
