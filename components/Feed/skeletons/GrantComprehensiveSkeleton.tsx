import { FC } from 'react';
import {
  SkeletonGrantCardShell,
  SkeletonProposalRows,
  SkeletonProposalSectionHeader,
} from './shared';

/** Mirrors `FeedItemGrantComprehensive` on `/fund/dashboard`. */
export const GrantComprehensiveSkeleton: FC = () => (
  <SkeletonGrantCardShell>
    <div className="relative h-[260px] sm:h-[220px] bg-gray-300">
      <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-[80%]">
        <div className="h-12 w-full max-w-sm bg-white rounded-md" />
      </div>

      <div className="absolute bottom-0 inset-x-0 px-5 py-3 bg-gray-400/40 border-t border-white/[0.06]">
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-2.5">
          {[72, 56, 64, 48].map((width) => (
            <div key={width} className="space-y-1">
              <div className="h-2 w-12 bg-gray-300/80 rounded" />
              <div className="h-4 bg-gray-300/80 rounded" style={{ width }} />
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-gray-300/80 rounded-full" />
      </div>
    </div>

    <SkeletonProposalSectionHeader />
    <SkeletonProposalRows />
  </SkeletonGrantCardShell>
);
