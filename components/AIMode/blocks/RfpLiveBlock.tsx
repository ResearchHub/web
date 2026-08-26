'use client';

import { ArrowUpRight, CircleCheck } from 'lucide-react';
import { GRANT } from '../lib/grantData';

interface RfpLiveBlockProps {
  readonly href: string;
  readonly title: string;
}

/**
 * The "your RFP is live" confirmation. The grant lives on production, so this
 * opens in a new tab: the funder sees the real page and the conversation is
 * still on screen behind it.
 */
export const RfpLiveBlock = ({ href, title }: RfpLiveBlockProps) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group mt-4 flex max-w-[520px] items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:border-emerald-300 hover:bg-emerald-100/70"
    >
      <CircleCheck className="h-8 w-8 shrink-0 text-emerald-600" />
      <div className="min-w-0 flex-1">
        <div className="text-[15px] font-semibold text-gray-900">{title}</div>
        <div className="text-sm text-gray-600">
          Live · ${GRANT.amountUsd.toLocaleString('en-US')} · accepting proposals
        </div>
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-emerald-500 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
    </a>
  );
};
