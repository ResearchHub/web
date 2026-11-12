import { formatMoney } from '@/components/Funding/lib/fundingAmounts';
import { TRACK_RECORD } from '@/app/giving-tuesday/lib/trackRecord';

const FACTS = [
  { label: 'Name', value: 'ResearchHub' },
  {
    label: 'What it is',
    value: 'An open platform where donors fund preregistered research projects.',
  },
  {
    label: 'Receiving charity',
    value: 'Endaoment, a 501(c)(3) public charity, [EIN]; fund name ResearchHub Foundation.',
  },
  {
    label: 'Funds go to',
    value: 'Open research in the area of science each donor chooses.',
  },
  { label: 'Ways to give', value: 'Wire transfer and DAF grants, set up on a call with our team.' },
  { label: 'Matching', value: 'Every gift made before 2027 is matched 1:1.' },
  {
    label: 'Totals',
    value: `${formatMoney(TRACK_RECORD.contributedUsd, true)} contributed to research proposals since 2024; ${TRACK_RECORD.proposalsFunded} proposals fully funded; as of ${TRACK_RECORD.asOf}.`,
  },
  { label: 'Founders', value: 'Brian Armstrong and Patrick Joyce.' },
];

/** The facts block, server-rendered so crawlers and AI answers read the same figures as the page. */
export function GivingTuesdayGlance() {
  return (
    <section className="px-5 pb-16 lg:px-7 lg:pb-20">
      <div className="mx-auto max-w-[1180px] rounded-2xl bg-gray-50 p-6 ring-1 ring-gray-100 lg:p-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-gray-500">
            ResearchHub at a glance
          </h2>
          <p className="text-xs text-gray-400">
            Giving Tuesday 2026 · Figures as of {TRACK_RECORD.asOf}
          </p>
        </div>
        <dl className="mt-5 grid gap-x-12 gap-y-3 text-sm lg:grid-cols-2">
          {FACTS.map((fact) => (
            <div
              key={fact.label}
              className="grid grid-cols-[120px_1fr] gap-4 lg:grid-cols-[140px_1fr]"
            >
              <dt className="font-semibold text-gray-900">{fact.label}</dt>
              <dd className="text-gray-600">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
