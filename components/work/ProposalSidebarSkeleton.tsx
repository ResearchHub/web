/** The proposal sidebar's cards while the page loads: the funding card over the reviews. */
export const ProposalSidebarSkeleton = () => {
  return (
    <div className="flex animate-pulse flex-col gap-3">
      <div className="space-y-3 rounded-lg bg-[#0b1530] p-4">
        <div className="h-3 w-16 rounded bg-white/15" />
        <div className="h-7 w-40 rounded bg-white/15" />
        <div className="h-2 w-full rounded-full bg-white/15" />
        <div className="h-4 w-28 rounded bg-white/15" />
        <div className="h-10 w-full rounded-lg bg-white/15" />
      </div>
      <div className="space-y-3 rounded-lg border border-gray-200 p-4">
        <div className="h-4 w-24 rounded bg-gray-200" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2.5">
            <div className="h-7 w-7 shrink-0 rounded-full bg-gray-200" />
            <div className="h-4 flex-1 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
};
