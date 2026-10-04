import { Activity } from 'lucide-react';

/** Empty state for the full My Funding activity tab. */
export function MyFundingActivityEmptyState() {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-gray-50/40 px-6 py-14 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
        <Activity className="h-7 w-7 text-primary-500" aria-hidden="true" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-gray-900">No activity yet</h2>
      <p className="mt-2 max-w-md text-sm leading-6 text-gray-500">
        Updates from your RFPs, proposals, contributions, and peer reviews will appear here.
      </p>
    </div>
  );
}
