import Link from 'next/link';
import { Activity, Bell, Megaphone, Star, type LucideIcon } from 'lucide-react';
import { DISPLAY_FONT } from '@/components/Funding/dashboard/MyFundingHero';
import { activityPromise } from '@/components/Funding/dashboard/RecentActivityPreview';
import { cn } from '@/utils/styles';

interface MyFundingActivityEmptyStateProps {
  /** A scientist the user backs, so the promise names someone real. */
  readonly firstScientist?: string;
  readonly hasRfps: boolean;
}

interface ComingKind {
  readonly label: string;
  readonly Icon: LucideIcon;
  readonly tint: string;
  /** Shown only once the user does what makes it possible. */
  readonly note?: string;
}

/**
 * The Activity tab before anything has happened: what will show up here,
 * drawn as the rows it will become, and the ways to make it happen sooner.
 */
export function MyFundingActivityEmptyState({
  firstScientist,
  hasRfps,
}: MyFundingActivityEmptyStateProps) {
  const kinds: ComingKind[] = [
    {
      label: 'Updates from the scientists you back',
      Icon: Bell,
      tint: 'bg-primary-50 text-primary-600',
    },
    { label: 'Peer reviews of the work you fund', Icon: Star, tint: 'bg-amber-50 text-amber-700' },
    {
      label: 'Updates and reviews on proposals sent to your RFPs',
      Icon: Megaphone,
      tint: 'bg-primary-50 text-primary-600',
      note: hasRfps ? undefined : 'Once you open an RFP',
    },
  ];

  return (
    <section className="rounded-2xl bg-gray-50 px-6 py-12 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-primary-50">
        <Activity className="h-7 w-7 text-primary-500" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-2xl font-bold tracking-tight text-[#0b1530]" style={DISPLAY_FONT}>
        Nothing new yet
      </h2>
      <p className="mx-auto mt-2 max-w-md text-[15px] leading-relaxed text-gray-600">
        {activityPromise(firstScientist)}
      </p>

      <ul className="mx-auto mt-7 flex max-w-md flex-col gap-2 text-left">
        {kinds.map(({ label, Icon, tint, note }) => (
          <li
            key={label}
            className={cn(
              'flex items-center gap-3 rounded-xl border bg-white px-3.5 py-3',
              note ? 'border-dashed border-gray-300' : 'border-gray-100'
            )}
          >
            <span
              className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', tint)}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-gray-900">{label}</span>
              {note ? (
                <span className="block text-xs text-gray-500">{note}</span>
              ) : (
                <span
                  aria-hidden="true"
                  className="mt-1.5 block h-2 w-2/3 rounded-full bg-gray-100"
                />
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-wrap justify-center gap-2.5">
        <Link
          href="/fund/proposals"
          className="inline-flex h-10 items-center rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white hover:bg-primary-600"
        >
          Back a proposal
        </Link>
      </div>
    </section>
  );
}
