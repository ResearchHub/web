import { SidebarCardSkeleton } from '@/components/ui/SidebarCard';

/**
 * An RFP's or a proposal's sidebar while the page loads: the navy funding
 * card over a card of rows (the activity, or the reviews).
 */
export function FundingSidebarSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="animate-pulse space-y-3 rounded-lg bg-navy p-4">
        <div className="h-3 w-16 rounded bg-white/15" />
        <div className="h-7 w-40 rounded bg-white/15" />
        <div className="h-2 w-full rounded-full bg-white/15" />
        <div className="h-4 w-28 rounded bg-white/15" />
        <div className="h-10 w-full rounded-lg bg-white/15" />
      </div>
      <SidebarCardSkeleton />
    </div>
  );
}
