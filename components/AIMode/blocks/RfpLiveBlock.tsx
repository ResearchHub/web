'use client';

import { CircleCheck } from 'lucide-react';
import { GRANT } from '../lib/grantData';

interface RfpLiveBlockProps {
  readonly title: string;
}

/**
 * The "your RFP is live" confirmation. There is no grant behind it in this run,
 * so it reports rather than links — an arrow that goes nowhere is a worse beat
 * than no arrow.
 */
export const RfpLiveBlock = ({ title }: RfpLiveBlockProps) => {
  return (
    <div className="mt-4 flex max-w-[520px] items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
      <CircleCheck className="h-8 w-8 shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">
          Live · ${GRANT.amountUsd.toLocaleString('en-US')} · accepting proposals
        </div>
      </div>
    </div>
  );
};
