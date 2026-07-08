import { FC, ReactNode } from 'react';
import { cn } from '@/utils/styles';

export const skeletonPulse = 'bg-gray-200 animate-pulse rounded';

export const SkeletonCardShell: FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div
    className={cn(
      'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden animate-pulse',
      className
    )}
  >
    {children}
  </div>
);

export const SkeletonFeedItemHeader: FC<{ actionWidth?: string; className?: string }> = ({
  actionWidth = 'w-20',
  className,
}) => (
  <div className={cn('flex items-center gap-3 animate-pulse mb-3', className)}>
    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="flex flex-wrap items-center gap-x-1.5 min-w-0">
      <div className="h-3.5 w-24 bg-gray-200 rounded" />
      <div className={cn('h-3.5 bg-gray-200 rounded', actionWidth)} />
      <div className="h-1 w-1 bg-gray-300 rounded-full flex-shrink-0" />
      <div className="h-3.5 w-12 bg-gray-200 rounded" />
    </div>
  </div>
);

/** Hashtag-style topic / hub badges — matches `FeedItemTopicBadges`. */
export const SkeletonTopicBadges: FC = () => (
  <div className="flex gap-3 pt-3 overflow-hidden">
    <div className="h-4 w-20 bg-gray-200 rounded flex-shrink-0" />
    <div className="h-4 w-24 bg-gray-200 rounded flex-shrink-0" />
    <div className="h-4 w-16 bg-gray-200 rounded flex-shrink-0" />
  </div>
);

/** Desktop preview image on the right — matches paper/post `cardImage` column. */
export const SkeletonCardImageRight: FC = () => (
  <div className="hidden md:!block flex-shrink-0 w-[280px] max-w-[33%]">
    <div className="rounded-lg border border-gray-200 bg-gray-200 aspect-[4/3] w-full" />
  </div>
);

/** Mobile preview image above title — matches `FeedItemTopSection` mobile image. */
export const SkeletonCardImageMobile: FC = () => (
  <div className="md:!hidden mb-4 rounded-lg border border-gray-200 bg-gray-200 aspect-video w-full" />
);

/** Abstract / description preview — matches `FeedItemAbstractSection` line count. */
export const SkeletonDescriptionLines: FC = () => (
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 rounded w-full" />
    <div className="h-4 bg-gray-200 rounded w-full" />
    <div className="h-4 bg-gray-200 rounded w-5/6" />
  </div>
);

/** Vote pill + comment button — matches default `FeedItemActions` row. */
export const SkeletonFeedItemActionsFooter: FC = () => (
  <div className="bg-gray-50 px-3 py-1.5 flex items-center justify-between gap-2">
    <div className="flex items-center gap-2">
      <div className="h-8 w-[5.5rem] rounded-full bg-gray-200 ring-1 ring-gray-200/80 flex-shrink-0" />
      <div className="h-8 w-14 rounded-full bg-gray-200 flex-shrink-0" />
    </div>
    <div className="h-5 w-5 bg-gray-200 rounded flex-shrink-0" />
  </div>
);

/** @deprecated Use `SkeletonFeedItemActionsFooter` */
export const SkeletonActionsFooter: FC = () => <SkeletonFeedItemActionsFooter />;

/** @deprecated Use `SkeletonFeedItemActionsFooter` */
export const SkeletonVoteCommentActionsFooter: FC = () => <SkeletonFeedItemActionsFooter />;

export const SkeletonPrimaryActionPanel: FC<{ buttonWidth?: string }> = ({
  buttonWidth = 'w-24',
}) => (
  <div className="mt-3 rounded-lg bg-gray-50/90 border border-gray-100 px-4 py-3.5">
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-start gap-6 min-w-0">
        <div className="flex flex-col gap-1.5 leading-tight">
          <div className="h-3 w-16 bg-gray-200 rounded" />
          <div className="h-6 w-20 bg-gray-200 rounded" />
        </div>
        <div className="hidden sm:flex flex-col gap-1.5">
          <div className="h-3 w-20 bg-gray-200 rounded" />
          <div className="flex -space-x-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
            ))}
          </div>
        </div>
      </div>
      <div className={cn('h-8 bg-gray-200 rounded-md flex-shrink-0', buttonWidth)} />
    </div>
  </div>
);

export const SkeletonImageLeftColumn: FC = () => (
  <div className="hidden md:!block flex-shrink-0 w-[210px] p-4 pr-2">
    <div className="rounded-xl bg-gray-200 w-full aspect-[4/3]" />
  </div>
);

export const SkeletonMobileImageBleed: FC = () => (
  <div className="md:!hidden w-[calc(100%+2rem)] mb-5 -mx-4 -mt-4 h-40 bg-gray-200" />
);

export const SkeletonAuthorRow: FC = () => (
  <div className="flex items-center gap-2.5 py-2">
    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0" />
    <div className="flex flex-col gap-1 min-w-0">
      <div className="h-3.5 w-28 bg-gray-200 rounded" />
      <div className="h-3 w-36 bg-gray-200 rounded" />
    </div>
  </div>
);

export const SkeletonGrantCardShell: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-[14px] overflow-hidden border border-gray-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] animate-pulse">
    {children}
  </div>
);

export const SkeletonProposalSectionHeader: FC = () => (
  <div className="px-5 py-2 border-b border-gray-100 bg-gray-50/80">
    <div className="h-3 w-32 bg-gray-200 rounded" />
  </div>
);

export const SkeletonProposalRows: FC<{ count?: number }> = ({ count = 3 }) => (
  <div>
    {Array.from({ length: count }, (_, i) => (
      <div
        key={i}
        className={cn(
          'grid grid-cols-[75px_1fr] items-center gap-3 px-5 py-2.5',
          i < count - 1 && 'border-b border-gray-100'
        )}
      >
        <div className="text-center py-1 px-0.5 border-r border-gray-200 space-y-1">
          <div className="h-4 w-12 bg-gray-200 rounded mx-auto" />
          <div className="h-2 w-14 bg-gray-200 rounded mx-auto" />
        </div>
        <div className="min-w-0 space-y-1.5">
          <div className="h-3.5 bg-gray-200 rounded w-4/5" />
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
            <div className="h-3 w-24 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded hidden sm:block" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const SkeletonGrantApplyFooter: FC = () => (
  <div className="flex items-center justify-between px-5 py-2.5 border-t border-gray-100">
    <div className="h-3 w-44 bg-gray-200 rounded" />
    <div className="h-8 w-20 bg-gray-200 rounded-md flex-shrink-0" />
  </div>
);
