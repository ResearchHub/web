import { FC } from 'react';
import { SkeletonCardShell, SkeletonImageLeftColumn, SkeletonMobileImageBleed } from './shared';

/** Mirrors `FeedItemRegisteredReport`: left image, eyebrow, title, then avatar + two metadata lines. */
export const RegisteredReportSkeleton: FC = () => (
  <SkeletonCardShell>
    <div className="md:!flex md:!flex-row">
      <SkeletonImageLeftColumn />
      <div className="flex-1 min-w-0">
        <div className="p-4">
          <SkeletonMobileImageBleed />

          <div className="h-3 w-32 bg-gray-200 rounded mb-2" />

          <div className="space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>

          <div className="mt-3 flex items-center gap-2.5">
            <div className="h-10 w-10 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="flex flex-col gap-1.5 min-w-0">
              <div className="h-3.5 w-56 bg-gray-200 rounded" />
              <div className="h-3.5 w-40 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </SkeletonCardShell>
);
