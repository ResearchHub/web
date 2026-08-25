import { FC } from 'react';

/** Loading shape for `ProposalWorkCard`: frosted image card, action footer, timestamp. */
export const ProposalWorkSkeleton: FC = () => (
  <div className="animate-pulse" aria-hidden>
    <div className="overflow-hidden rounded-[14px] border border-gray-200 bg-white">
      <div className="relative h-[190px] overflow-hidden bg-gray-200 sm:h-[180px]">
        <div className="absolute inset-x-0 bottom-0 bg-black/40 px-4 pb-2 pt-2">
          <div className="h-3.5 w-3/4 rounded bg-white/30" />
          <div className="mt-1.5 h-2.5 w-1/3 rounded bg-white/20" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-gray-100 px-3 py-2">
        <div className="h-6 w-20 rounded bg-gray-200" />
        <div className="flex shrink-0 items-center gap-3">
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-6 w-6 rounded-full bg-gray-200" />
          <div className="h-6 w-6 rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
    <div className="mt-3 h-3 w-14 rounded bg-gray-200" />
  </div>
);
