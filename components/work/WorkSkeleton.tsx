import { FC } from 'react';
import { cn } from '@/utils/styles';
import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';

const TAB_WIDTHS = ['w-16', 'w-24', 'w-28', 'w-32', 'w-24'];

export function WorkHeaderSkeleton({ tabCount = 4 }: { tabCount?: number }) {
  const tabs = TAB_WIDTHS.slice(0, tabCount);

  return (
    <div className="w-full bg-gray-50/80 border-b border-gray-200 animate-pulse">
      <div className="max-w-[1180px] mx-auto px-4 tablet:!px-8 pt-6">
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="space-y-2">
            <div className="h-7 sm:h-9 w-2/3 rounded-md bg-gray-200" />
          </div>

          {/* Subtitle: authors + date */}
          <div className="mt-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-4 w-8 rounded bg-gray-200" />
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
            <div className="h-4 w-36 rounded bg-gray-200" />
          </div>

          {/* Action bar */}
          <div className="mt-3 flex items-center gap-3">
            <div className="h-9 w-24 rounded-lg bg-gray-200" />
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
            <div className="h-9 w-9 rounded-lg bg-gray-200" />
          </div>

          {/* WorkTabs-shaped row */}
          <div className="mt-3 sm:mt-4 border-b border-gray-200">
            <div className="flex items-center gap-8 -mb-px overflow-hidden pb-0">
              {tabs.map((width, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-center gap-2 py-3 flex-shrink-0',
                    index === 0 && 'border-b-2 border-primary-600'
                  )}
                >
                  <div className="h-4 w-4 rounded bg-gray-200" />
                  <div className={cn('h-4 bg-gray-200 rounded', width)} />
                  <div className="h-5 w-6 rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface WorkSkeletonProps {
  /** Show abstract / document body block (papers without PDF, posts, proposals). */
  showAbstract?: boolean;
  /** Show PDF viewer placeholder (paper routes with PDF). */
  showPdf?: boolean;
}

export const WorkSkeleton: FC<WorkSkeletonProps> = ({ showAbstract = true, showPdf = true }) => {
  return (
    <div className="mt-6 space-y-6">
      {showAbstract && (
        <div className="bg-white rounded-lg shadow-sm border p-6 space-y-4 animate-pulse">
          <div className="h-6 w-24 rounded bg-gray-200" />
          <div className="space-y-2.5">
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
            <div className="h-4 w-full rounded bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
          </div>
        </div>
      )}

      {showPdf && (
        <div className="bg-white rounded-lg shadow-sm border mb-6 relative">
          <DocumentSkeleton className="min-h-[800px]" lines={22} />
        </div>
      )}
    </div>
  );
};
