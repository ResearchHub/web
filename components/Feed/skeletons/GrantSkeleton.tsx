import { FC } from 'react';
import {
  SkeletonGrantApplyFooter,
  SkeletonGrantCardShell,
  SkeletonProposalRows,
  SkeletonProposalSectionHeader,
} from './shared';

/** Mirrors `FeedItemGrantWithApplicants` on `/fund` (public grant cards). */
export const GrantSkeleton: FC = () => (
  <SkeletonGrantCardShell>
    <div className="relative h-[200px] sm:h-[160px] bg-gray-300">
      <div className="absolute bottom-0 inset-x-0 px-5 py-2.5 bg-gray-400/40 border-t border-white/[0.06]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <div className="min-w-0 space-y-1.5">
            <div className="h-2 w-28 bg-gray-300/80 rounded" />
            <div className="h-5 w-48 max-w-full bg-gray-300/80 rounded" />
          </div>
          <div className="flex gap-5 flex-shrink-0">
            {[56, 32, 40].map((width) => (
              <div key={width} className="space-y-1 sm:text-right">
                <div className="h-2 w-16 bg-gray-300/80 rounded" />
                <div className="h-4 bg-gray-300/80 rounded" style={{ width }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    <SkeletonProposalSectionHeader />
    <SkeletonProposalRows count={1} />
    <SkeletonGrantApplyFooter />
  </SkeletonGrantCardShell>
);
