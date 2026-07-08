import { FC } from 'react';
import {
  SkeletonCardImageMobile,
  SkeletonCardImageRight,
  SkeletonCardShell,
  SkeletonDescriptionLines,
  SkeletonFeedItemActionsFooter,
  SkeletonFeedItemHeader,
  SkeletonTopicBadges,
} from './shared';

interface PaperPostSkeletonProps {
  hideActions?: boolean;
  /** Author/timestamp row above the card (post-style header). */
  showHeader?: boolean;
  showImage?: boolean;
}

export const PaperPostSkeleton: FC<PaperPostSkeletonProps> = ({
  hideActions = false,
  showHeader = true,
  showImage = true,
}) => (
  <div>
    {showHeader && <SkeletonFeedItemHeader />}

    <SkeletonCardShell>
      <div className="p-4">
        <div className="flex gap-4 md:!flex-row flex-col">
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-1" />
            <div className="h-4 bg-gray-200 rounded w-56 mb-3" />

            <SkeletonDescriptionLines />

            <SkeletonTopicBadges />
          </div>

          {showImage && <SkeletonCardImageRight />}
        </div>
      </div>

      {!hideActions && <SkeletonFeedItemActionsFooter />}
    </SkeletonCardShell>
  </div>
);
