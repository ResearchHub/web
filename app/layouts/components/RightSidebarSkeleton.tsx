'use client';

function SidebarHeaderSkeleton({ titleWidth }: { titleWidth: string }) {
  return (
    <div className="flex items-center justify-between gap-2 pb-2">
      <div className={`h-5 bg-gray-200 rounded ${titleWidth} min-w-0 flex-1 max-w-[60%]`} />
      <div className="flex items-center gap-1 flex-shrink-0">
        <div className="h-3 w-14 bg-gray-200 rounded" />
        <div className="h-2.5 w-2.5 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function PersonalizeFeedBannerSkeleton() {
  return (
    <div className="rounded-xl border border-primary-100 bg-primary-50/80 p-5">
      <div className="w-14 h-14 rounded-xl bg-gray-200 mb-4" />
      <div className="h-6 w-44 bg-gray-200 rounded mb-2" />
      <div className="h-4 w-full bg-gray-200 rounded mb-4" />
      <div className="h-11 w-full bg-gray-200 rounded-lg" />
    </div>
  );
}

/** Matches grant rows in `AvailableFundingSection`. */
export function GrantSidebarRowSkeleton() {
  return (
    <div className="flex items-center gap-3 py-2.5 px-1">
      <div className="min-w-0 flex-1">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="flex items-center gap-3 mt-1.5">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-3 w-8 bg-gray-200 rounded flex-shrink-0" />
        </div>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <div className="h-4 w-12 bg-gray-200 rounded" />
          <div className="h-3 w-14 bg-gray-200 rounded" />
        </div>
      </div>
      <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
    </div>
  );
}

/** Matches proposal rows in `NeedsFundingSection`. */
export function ProposalSidebarRowSkeleton() {
  return (
    <div className="py-2.5 px-1">
      <div className="flex gap-3">
        <div className="min-w-0 flex-1">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="flex items-center gap-1.5 mt-1">
            <div className="w-4 h-4 bg-gray-200 rounded-full flex-shrink-0" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
        </div>
        <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0" />
      </div>
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-1 bg-gray-200 rounded-full" />
        <div className="h-3 w-20 bg-gray-200 rounded flex-shrink-0" />
      </div>
    </div>
  );
}

export function GrantSidebarSectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-1 animate-pulse">
      {Array.from({ length: rows }, (_, i) => (
        <GrantSidebarRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProposalSidebarSectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-1 animate-pulse">
      {Array.from({ length: rows }, (_, i) => (
        <ProposalSidebarRowSkeleton key={i} />
      ))}
    </div>
  );
}

interface RightSidebarSkeletonProps {
  showPersonalizeBanner?: boolean;
}

export function RightSidebarSkeleton({ showPersonalizeBanner = false }: RightSidebarSkeletonProps) {
  return (
    <div className="space-y-8 animate-pulse">
      {showPersonalizeBanner && <PersonalizeFeedBannerSkeleton />}

      <section>
        <SidebarHeaderSkeleton titleWidth="w-40" />
        <GrantSidebarSectionSkeleton />
      </section>

      <section>
        <SidebarHeaderSkeleton titleWidth="w-20" />
        <ProposalSidebarSectionSkeleton />
      </section>
    </div>
  );
}
