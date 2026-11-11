import { formatMoney } from '@/components/Funding/lib/fundingAmounts';
import { cn } from '@/utils/styles';
import { TRACK_RECORD } from '@/app/giving-tuesday/lib/trackRecord';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

/** Ballpark waits, in months, for the "us versus them" gauges. */
const COMPARISONS = [
  {
    title: 'Time to get funded',
    traditionalMonths: 9,
    bars: [
      { label: 'Traditional grant', time: '9+ months', months: 9, className: 'bg-slate-400' },
      { label: 'ResearchHub', time: 'Weeks', months: 1, className: 'bg-emerald-400' },
    ],
  },
  {
    title: 'Time to peer review',
    traditionalMonths: 3,
    bars: [
      { label: 'Traditional journal', time: '3+ months', months: 3, className: 'bg-slate-400' },
      { label: 'ResearchHub', time: '~2 weeks', months: 0.5, className: 'bg-emerald-400' },
    ],
  },
];

const STATS = [
  {
    label: 'Contributed to research since 2024',
    value: formatMoney(TRACK_RECORD.contributedUsd, true),
  },
  { label: 'Proposals fully funded', value: TRACK_RECORD.proposalsFunded.toLocaleString() },
  { label: 'Peer reviewers', value: TRACK_RECORD.peerReviewers.toLocaleString() },
  { label: 'Peer reviews', value: TRACK_RECORD.peerReviews.toLocaleString() },
];

/** Why ResearchHub: open science, funded and reviewed faster than the traditional route. */
export function GivingTuesdayWhyGive() {
  return (
    <section className="px-5 pt-16 lg:px-7 lg:pt-20">
      <div
        className="mx-auto max-w-[1180px] overflow-hidden rounded-[28px] px-6 py-10 text-white lg:px-12 lg:py-12"
        style={{
          background:
            'radial-gradient(circle at 88% 30%, rgba(16,185,129,0.3), transparent 45%), linear-gradient(120deg, #0b1238, #1a235e)',
        }}
      >
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <h2
              className="text-[30px] font-bold leading-[1.08] lg:text-[40px]"
              style={DISPLAY_FONT}
            >
              Why give to ResearchHub?
            </h2>
            <p className="mt-4 text-lg text-slate-300">
              We’re advocates for open science. Every project publishes its plan before the work
              starts and shares what it finds, and we get research funded and peer-reviewed far
              faster than the traditional route.
            </p>
          </div>
          <div className="space-y-6">
            {COMPARISONS.map((comparison) => (
              <div key={comparison.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-indigo-200">
                  {comparison.title}
                </h3>
                <div className="mt-3 space-y-2">
                  {comparison.bars.map((bar) => (
                    <div key={bar.label} className="flex items-center gap-3">
                      <span className="w-[130px] shrink-0 text-sm text-slate-300">{bar.label}</span>
                      <span className="h-3 flex-1 overflow-hidden rounded-full bg-white/10">
                        <span
                          className={cn('block h-full rounded-full', bar.className)}
                          style={{
                            width: `${(bar.months / comparison.traditionalMonths) * 100}%`,
                          }}
                        />
                      </span>
                      <span className="w-[76px] shrink-0 text-right text-sm font-semibold">
                        {bar.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <dl className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse rounded-2xl bg-white/[0.07] p-4 ring-1 ring-white/10"
            >
              <dt className="mt-2 text-sm text-slate-400">{stat.label}</dt>
              <dd className="text-[26px] font-bold leading-none" style={DISPLAY_FONT}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-slate-500">As of {TRACK_RECORD.asOf}.</p>
      </div>
    </section>
  );
}
