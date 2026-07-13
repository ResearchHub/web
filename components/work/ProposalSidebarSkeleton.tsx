'use client';

export const ProposalSidebarSkeleton = () => {
  return (
    <div className="space-y-12 animate-pulse">
      {/* Funding Progress */}
      <section>
        <div className="h-5 w-36 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div className="h-8 w-12 bg-gray-200 rounded" />
            <div className="h-4 w-28 bg-gray-200 rounded" />
          </div>
          <div className="h-2 w-full bg-gray-200 rounded-full" />
          <div className="h-3 w-40 bg-gray-200 rounded" />
        </div>
      </section>

      {/* Funders */}
      <section>
        <div className="h-5 w-20 bg-gray-200 rounded mb-3" />
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
              <div className="h-4 w-16 bg-gray-200 rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </section>

      {/* Peer Reviews */}
      <section>
        <div className="h-5 w-28 bg-gray-200 rounded mb-4" />
        <div className="space-y-4">
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex-shrink-0" />
                <div className="h-4 w-28 bg-gray-200 rounded" />
              </div>
              <div className="flex gap-0.5">
                {[0, 1, 2, 3, 4].map((s) => (
                  <div key={s} className="h-3.5 w-3.5 bg-gray-200 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Linked Grant / Funding Opportunity */}
      <section>
        <div className="h-5 w-40 bg-gray-200 rounded mb-3" />
        <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="h-4 w-24 bg-gray-200 rounded" />
          </div>
          <div className="w-16 h-16 rounded-lg bg-gray-200 flex-shrink-0" />
        </div>
      </section>

      {/* Topics */}
      <section>
        <div className="h-5 w-16 bg-gray-200 rounded mb-3" />
        <div className="flex flex-wrap gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>
      </section>

      {/* DOI */}
      <section>
        <div className="h-5 w-10 bg-gray-200 rounded mb-2" />
        <div className="h-4 w-full bg-gray-200 rounded" />
      </section>
    </div>
  );
};
