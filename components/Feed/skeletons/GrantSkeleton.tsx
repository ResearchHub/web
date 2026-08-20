import { FC } from 'react';
import {
  SkeletonGrantApplyFooter,
  SkeletonGrantCardShell,
  SkeletonProposalRows,
  SkeletonProposalSectionHeader,
} from './shared';

interface GrantSkeletonProps {
  showApplyCta?: boolean;
}

/** Mirrors `FeedItemGrantWithApplicants` on `/fund` and `/my-funding`. */
export const GrantSkeleton: FC<GrantSkeletonProps> = ({ showApplyCta = true }) => (
  <SkeletonGrantCardShell>
    <div className="relative h-[160px] bg-gray-300">
      <div className="absolute bottom-0 inset-x-0 px-5 py-2.5 bg-gray-400/40 border-t border-white/[0.06]">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <div className="h-2 w-28 bg-gray-300/80 rounded" />
            <div className="h-5 w-48 max-w-full bg-gray-300/80 rounded" />
          </div>
          <div className="flex-shrink-0 self-stretch flex flex-col space-y-1 text-right">
            <div className="h-2 w-16 bg-gray-300/80 rounded" />
            <div className="flex-1 flex items-center justify-end">
              <div className="h-4 w-14 bg-gray-300/80 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <SkeletonProposalSectionHeader />
    <SkeletonProposalRows count={1} flushAskColumn />
    {showApplyCta && <SkeletonGrantApplyFooter />}
  </SkeletonGrantCardShell>
);
