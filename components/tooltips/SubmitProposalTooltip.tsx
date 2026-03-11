'use client';

import { Tooltip } from '@/components/ui/Tooltip';

interface SubmitProposalTooltipProps {
  children: React.ReactNode;
}

export function SubmitProposalTooltip({ children }: SubmitProposalTooltipProps) {
  return (
    <Tooltip
      content="Create new proposal or upload existing using our notebook"
      position="bottom"
      width="w-56"
      hideDelay={0}
      className="!bg-gray-900 !text-white !border-gray-900 !-mt-1"
    >
      {children}
    </Tooltip>
  );
}
