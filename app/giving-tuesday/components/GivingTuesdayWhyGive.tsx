import { Eye, Gauge, UserCheck } from 'lucide-react';
import { formatMoney } from '@/components/Funding/lib/fundingAmounts';
import { TRACK_RECORD } from '@/app/giving-tuesday/lib/trackRecord';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';

const REASONS = [
  {
    title: 'Science in the open',
    text: 'Every project publishes its plan before the work starts, and shares what it finds, whether or not it turns out as hoped.',
    Icon: Eye,
  },
  {
    title: 'Funded in weeks',
    text: 'Gifts go straight to the lab, so a project can start in weeks instead of waiting many months for a traditional grant.',
    Icon: Gauge,
  },
  {
    title: 'Faster peer review',
    text: 'Experts are paid to review the work in public, so researchers get feedback sooner than at a traditional journal.',
    Icon: UserCheck,
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

/** Why ResearchHub: open science and faster review and funding, backed by the track record. */
export function GivingTuesdayWhyGive() {
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
          <h2 className="text-[30px] font-bold leading-[1.08] lg:text-[40px]" style={DISPLAY_FONT}>
            Why give to ResearchHub?
          </h2>
          <ul className="mt-7 space-y-5">
            {REASONS.map(({ title, text, Icon }) => (
              <li key={title} className="flex gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <Icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="mt-1 block text-slate-300">{text}</span>
                </span>
              </li>
            ))}
          </ul>
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
