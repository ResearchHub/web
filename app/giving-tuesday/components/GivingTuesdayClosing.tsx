import Link from 'next/link';
import { ArrowRight, Building2, Landmark } from 'lucide-react';
import { newDraftTarget, workspaceHref } from '@/components/AIMode/workspaceUrl';
import { formatMoney } from '@/components/Funding/lib/fundingAmounts';
import { formatCompactAmount } from '@/utils/currency';
import { TRACK_RECORD } from '@/app/giving-tuesday/lib/trackRecord';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

const STATS = [
  {
    label: 'Contributed to research since 2024',
    value: formatMoney(TRACK_RECORD.contributedUsd, true),
  },
  { label: 'Proposals fully funded', value: TRACK_RECORD.proposalsFunded.toLocaleString() },
  { label: 'Peer reviewers', value: TRACK_RECORD.peerReviewers.toLocaleString() },
  { label: 'Peer reviews', value: TRACK_RECORD.peerReviews.toLocaleString() },
];

/** The closing band: the track record, with the ways in for donors and foundations. */
export function GivingTuesdayClosing() {
  return (
    <section className="px-5 pt-16 lg:px-7 lg:pt-20">
      <div
        className="mx-auto grid max-w-[1180px] items-center gap-10 overflow-hidden rounded-[28px] px-6 py-10 text-white lg:grid-cols-[1.2fr_1fr] lg:px-12 lg:py-12"
        style={{
          background:
            'radial-gradient(circle at 88% 50%, rgba(16,185,129,0.3), transparent 45%), linear-gradient(120deg, #0b1238, #1a235e)',
        }}
      >
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-indigo-200">
            Giving continues through December 31
          </p>
          <h2
            className="mt-3 text-[30px] font-bold leading-[1.08] lg:text-[40px]"
            style={DISPLAY_FONT}
          >
            Join the people who have already put {formatCompactAmount(TRACK_RECORD.contributedUsd)}{' '}
            into research.
          </h2>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/fund/proposals"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary-600 px-6 text-base font-semibold text-white transition-colors hover:bg-primary-700"
            >
              Browse projects to fund
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/give"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-white/20 bg-white/[0.06] px-5 text-base font-semibold text-white transition-colors hover:bg-white/[0.12]"
            >
              <Landmark className="h-4 w-4" />
              Give from your DAF
            </Link>
          </div>
          <Link
            href={workspaceHref(newDraftTarget('fund'))}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition-colors hover:text-white"
          >
            <Building2 className="h-4 w-4" />
            Represent a foundation?
            <span className="text-white underline underline-offset-4">
              Post an RFP for your foundation
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div>
          <dl className="grid grid-cols-2 gap-4">
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
      </div>
    </section>
  );
}
