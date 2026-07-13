import { FC } from 'react';
import {
  SkeletonAuthorRow,
  SkeletonCardImageMobile,
  SkeletonCardImageRight,
  SkeletonCardShell,
  SkeletonTopicBadges,
} from './shared';

export const BountySkeleton: FC = () => (
  <SkeletonCardShell>
    <div className="p-4">
      <div className="flex gap-4 md:!flex-row flex-col">
        <div className="flex-1 min-w-0">
          <SkeletonCardImageMobile />

          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-48 mb-1" />
          <SkeletonAuthorRow />

          <div className="mt-3 rounded-lg bg-gray-50/90 border border-gray-100 px-4 py-3.5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-6 min-w-0">
                <div className="flex flex-col gap-1.5 leading-tight">
                  <div className="h-3 w-16 bg-gray-200 rounded" />
                  <div className="h-6 w-20 bg-gray-200 rounded" />
                </div>
                <div className="hidden sm:flex flex-col gap-1.5">
                  <div className="h-3 w-12 bg-gray-200 rounded" />
                  <div className="h-4 w-16 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="h-8 w-16 bg-gray-200 rounded-lg" />
                <div className="h-8 w-20 bg-gray-200 rounded-md" />
              </div>
            </div>
          </div>

          <SkeletonTopicBadges />
        </div>

        <SkeletonCardImageRight />
      </div>
    </div>
  </SkeletonCardShell>
);
