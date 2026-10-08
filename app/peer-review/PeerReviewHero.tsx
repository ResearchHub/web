import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Coins, PenLine, ShieldCheck, Star, Target } from 'lucide-react';
import { cn } from '@/utils/styles';

const PIPELINE_STEPS = [
  {
    label: 'Submitted proposal',
    description: 'Researchers ask for funding',
    href: '/fund/proposals',
    current: false,
  },
  {
    label: 'Peer Review',
    description: 'Paid, public expert reviews',
    href: null,
    current: true,
  },
  {
    label: 'Funded proposal',
    description: 'Reviews give funders context',
    href: null,
    current: false,
  },
];

const REVIEW_SCORES = [
  { label: 'Overall impact', stars: 5 },
  { label: 'Importance', stars: 4 },
  { label: 'Rigor & feasibility', stars: 4 },
];

const HOW_IT_WORKS = [
  { icon: Target, title: 'Pick a proposal', description: 'No invite or permission' },
  { icon: PenLine, title: 'Review', description: 'Rate each section yourself' },
  { icon: ShieldCheck, title: 'Editors decide', description: 'Top 2 per proposal accepted' },
  { icon: Coins, title: 'Get paid', description: '$150, about 10 days later' },
];

/** The journal's issue-card stack, dressed as an accepted proposal review. */
const PeerReviewCards = () => (
  <div className="relative aspect-[3/4] w-[11.7rem] flex-shrink-0 sm:w-[13.5rem]">
    <div
      aria-hidden="true"
      className="absolute -inset-6 origin-bottom -rotate-[6deg] rounded-[2.5rem] bg-orange-500/25 blur-2xl"
    />

    <div className="absolute inset-0 origin-bottom translate-x-3 translate-y-1 rotate-[4deg] rounded-2xl bg-gradient-to-br from-orange-300 to-orange-500 shadow-xl ring-1 ring-orange-400/30" />

    <div className="absolute inset-0 origin-bottom -rotate-[5deg] flex flex-col overflow-hidden rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-700 p-5 text-white shadow-2xl shadow-orange-900/40 ring-1 ring-orange-700/40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-4 top-0 h-full w-px bg-white/15"
      />

      <div className="relative flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
        <span>Peer review</span>
        <span>Proposal</span>
      </div>

      <div className="relative flex flex-1 flex-col justify-center gap-3">
        {REVIEW_SCORES.map((score) => (
          <div key={score.label}>
            <p className="text-[11px] font-medium text-white/80">{score.label}</p>
            <div className="mt-1 flex gap-0.5" aria-hidden="true">
              {Array.from({ length: 5 }, (_, index) => (
                <Star
                  key={index}
                  size={14}
                  className={
                    index < score.stars ? 'fill-white text-white' : 'fill-white/30 text-white/30'
                  }
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="relative">
        <p className="text-3xl font-bold leading-none tracking-tight">$150</p>
        <p className="mt-1.5 text-[11px] font-medium tracking-wide text-white/70">Paid in RSC</p>
      </div>
    </div>

    <span className="absolute -right-5 -top-3.5 inline-flex rotate-[8deg] items-center gap-1.5 rounded-full border border-gray-200 bg-white py-1.5 pl-2 pr-2.5 text-xs font-semibold text-gray-900 shadow-lg">
      <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-green-600 text-white">
        <Check size={11} strokeWidth={3} />
      </span>
      Accepted
    </span>
  </div>
);

const PeerReviewTimeline = () => (
  <div className="mt-8 w-full max-w-2xl overflow-x-auto pb-1">
    <div className="min-w-[30rem]">
      <div className="grid grid-cols-3">
        {PIPELINE_STEPS.map((step, index) => {
          const next = PIPELINE_STEPS[index + 1];
          const number = String(index + 1).padStart(2, '0');

          return (
            <div key={step.label} className={cn('flex items-center', index > 0 && 'pl-6')}>
              <span
                className={cn(
                  'font-mono text-2xl font-medium tracking-wide',
                  step.current ? 'text-orange-600' : 'text-gray-400'
                )}
              >
                {number}
              </span>
              {next && (
                // The lines brighten into the current step and fade out of it.
                <span
                  aria-hidden="true"
                  className={cn(
                    'ml-6 h-px flex-1 bg-gradient-to-r',
                    next.current
                      ? 'from-gray-300 to-orange-400'
                      : step.current
                        ? 'from-orange-400 to-gray-300'
                        : 'from-gray-300 to-gray-300'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 grid grid-cols-3">
        {PIPELINE_STEPS.map((step, index) => {
          const content = (
            <>
              <p
                className={cn(
                  'text-base font-semibold leading-tight',
                  step.current ? 'text-orange-700' : 'text-gray-900 group-hover:text-primary-700'
                )}
              >
                {step.label}
              </p>
              <p className="mt-1 text-xs leading-snug text-gray-500">{step.description}</p>
            </>
          );

          return (
            <div key={step.label} className={cn(index > 0 && 'pl-6')}>
              {step.href ? (
                <Link href={step.href} className="group block">
                  {content}
                </Link>
              ) : (
                content
              )}
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export const PeerReviewHero = () => (
  <div className="relative border-b border-gray-200 bg-gray-50">
    <div className="relative z-10 mx-auto max-w-[1180px] px-4 py-16 tablet:!px-8 sm:py-20">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <h1
            className="text-4xl font-bold leading-[1.05] tracking-[-0.032em] text-[#0b1530] sm:text-5xl"
            style={{
              fontFamily: "'Cal Sans', var(--font-geist-sans), system-ui, sans-serif",
              textWrap: 'balance',
            }}
          >
            Where <span className="text-orange-600">peer review</span> finally pays.
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Expert, public reviews of submitted proposals. $150 for every accepted review.
          </p>

          <PeerReviewTimeline />
        </div>

        <div className="flex justify-center lg:justify-end lg:pr-6">
          <PeerReviewCards />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Sits under the hero, across the feed and the sidebar: the container matches
 * the layout's row, and from `lg` (where the sidebar shows) it drops the right
 * padding so it ends flush with the sidebar's edge.
 */
export const PeerReviewHowItWorks = () => (
  <section
    aria-labelledby="peer-review-how-it-works"
    className="mx-auto max-w-[1180px] px-4 pt-6 tablet:!px-8 lg:!pr-0"
  >
    <h2 id="peer-review-how-it-works" className="text-sm font-semibold text-gray-700">
      How it works
    </h2>
    <ol className="scrollbar-hide mt-2.5 flex gap-2 overflow-x-auto">
      {HOW_IT_WORKS.map((step, index) => {
        const StepIcon = step.icon;

        return (
          <Fragment key={step.title}>
            {index > 0 && (
              <li aria-hidden="true" className="flex flex-shrink-0 items-center text-gray-400">
                <ArrowRight size={14} />
              </li>
            )}
            <li className="flex min-w-[200px] flex-1 items-center gap-2.5 rounded-lg bg-gray-100 px-3 py-2.5">
              <StepIcon size={16} className="flex-shrink-0 text-gray-600" />
              <div className="min-w-0">
                <p className="whitespace-nowrap text-[13px] font-semibold leading-[18px] text-gray-900">
                  {step.title}
                </p>
                <p className="truncate text-xs leading-4 text-gray-600">{step.description}</p>
              </div>
            </li>
          </Fragment>
        );
      })}
    </ol>
  </section>
);
