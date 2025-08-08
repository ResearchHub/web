import SidePeek from '@/components/ui/SidePeek';
import { DocumentSkeleton } from '@/components/skeletons/DocumentSkeleton';

interface SidePeekSkeletonProps {
  readonly title?: string;
}

export default function SidePeekSkeleton({ title = 'Loading…' }: SidePeekSkeletonProps) {
  return (
    <SidePeek title={title}>
      <div className="space-y-6" aria-busy="true">
        {/* Title block (large + subtitle) */}
        <div className="space-y-0">
          <div className="h-10 w-11/12 rounded-md bg-gray-200 animate-pulse" />
        </div>

        {/* Toolbar: upvote, share, more (appears under title in the real UI) */}
        <div className="flex items-center gap-5">
          <div className="h-9 w-14 rounded-md bg-gray-200 animate-pulse" aria-hidden />
          <div className="h-9 w-14 rounded-md bg-gray-200 animate-pulse" aria-hidden />
          <div className="h-5 w-8 rounded-md bg-gray-200 animate-pulse" aria-hidden />
        </div>

        {/* Meta: Authors (multi-line) + Published date with labels */}
        <div className="grid grid-cols-[88px_1fr] gap-x-4 gap-y-2">
          {/* Authors label */}
          <div className="h-5 w-14 rounded bg-gray-200 animate-pulse" aria-hidden />
          <div className="space-y-2">
            {/* One line of names */}
            <div className="h-5 w-4/5 rounded bg-gray-200 animate-pulse" />
          </div>

          {/* Published label */}
          <div className="h-5 w-16 rounded bg-gray-200 animate-pulse" aria-hidden />
          <div className="flex items-center gap-2">
            <div className="h-5 w-40 rounded bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Fundraising card */}
        <div className="rounded-lg border border-gray-200 p-4 y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <div className="h-8 w-80 rounded bg-gray-200 animate-pulse pt-3" />
            </div>
            <div className="h-4 w-28 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="mt-3 h-4 w-full rounded-full bg-gray-200 animate-pulse" />
          <div className="mt-6">
            <div className="h-9 w-44 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Tabs row */}
        <div className="flex items-center gap-4 border-b pb-3 pt-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-20 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-200 animate-pulse" />
            <div className="h-6 w-16 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>

        {/* Document body */}
        <DocumentSkeleton lines={13} />
      </div>
    </SidePeek>
  );
}
