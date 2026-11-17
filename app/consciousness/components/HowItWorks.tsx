import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';
import { QUESTIONS } from '../data/content';
import {
  ORCH_OR_RFP,
  deadlinePhrase,
  formatDate,
  formatUsd,
  formatUsdShort,
  poolPercent,
} from '../data/mockRfp';
import { Sequence } from './Motion';
import { AddToPoolButton } from './OrchActions';
import { PoolBar } from './PoolPanel';
import { Wrap } from './Story';

/** Stage art: a round plate of one size, so the four stages sit on one line and the track passes behind them. */
function Art({ children }: { children: React.ReactNode }) {
  return (
    <div aria-hidden className="relative z-10 flex shrink-0 justify-center tablet:w-full">
      <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-[var(--o-ink2)] ring-1 ring-[color:var(--o-line)] tablet:h-[184px] tablet:w-[184px]">
        {children}
      </div>
    </div>
  );
}

/** 1. Backers, and a dashed seat for you. */
function BackersArt() {
  const { backers } = ORCH_OR_RFP.pool;
  return (
    <Art>
      <div className="grid grid-cols-2 gap-1.5 tablet:gap-2.5">
        {backers.slice(0, 3).map((b, i) => (
          <span
            key={b.name}
            style={{ '--i': i } as React.CSSProperties}
            className="o-hiw-face rounded-full bg-[var(--o-ink)] ring-[3px] ring-[var(--o-ink)]"
          >
            <span className="hidden tablet:block">
              <Avatar src={b.avatarUrl} alt={b.name} size={48} disableTooltip />
            </span>
            <span className="tablet:hidden">
              <Avatar src={b.avatarUrl} alt={b.name} size={30} disableTooltip />
            </span>
          </span>
        ))}
        <span
          style={{ '--i': 3 } as React.CSSProperties}
          className="o-hiw-face flex h-[30px] w-[30px] items-center justify-center rounded-full border-2 border-dashed border-[var(--o-gold)] bg-[var(--o-ink)] text-[9.5px] font-semibold text-[var(--o-gold)] tablet:h-[48px] tablet:w-[48px] tablet:text-[13px]"
        >
          You
        </span>
      </div>
    </Art>
  );
}

/** 2. The pool: a flask (the ResearchHub mark) filled to the share of the goal raised. */
function PoolArt() {
  const pct = poolPercent(ORCH_OR_RFP);
  // The body of the flask runs from y=50 to y=132; never draw it bone dry.
  const level = 132 - (82 * Math.max(pct, 12)) / 100;
  return (
    <Art>
      <svg viewBox="0 0 120 140" className="h-[64%] w-auto overflow-visible">
        <defs>
          <clipPath id="hiw-flask">
            <path d="M47 14h26v36l33 66a12 12 0 0 1-10.7 17.4H24.7A12 12 0 0 1 14 116l33-66z" />
          </clipPath>
        </defs>
        {/* Coins falling into the neck. */}
        {[0, 1, 2].map((i) => (
          <circle
            key={i}
            className="o-hiw-coin"
            style={{ '--i': i } as React.CSSProperties}
            cx={60}
            cy={-6}
            r={5}
            fill="var(--o-accent)"
            stroke="var(--o-white)"
            strokeWidth={1.5}
          />
        ))}
        <g clipPath="url(#hiw-flask)">
          <rect x={0} y={0} width={120} height={140} fill="var(--o-ink)" />
          <g className="o-hiw-liquid" style={{ transform: `translateY(${level}px)` }}>
            <path
              className="o-hiw-wave"
              d="M-120 6 q15 -6 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 V140 H-120z"
              fill="var(--o-gold)"
            />
          </g>
        </g>
        <path
          d="M47 14h26v36l33 66a12 12 0 0 1-10.7 17.4H24.7A12 12 0 0 1 14 116l33-66z"
          fill="none"
          stroke="var(--o-white)"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path d="M41 14h38" stroke="var(--o-white)" strokeWidth={3} strokeLinecap="round" />
      </svg>
    </Art>
  );
}

/** 3. Proposals from labs, each a card with its question's figure. */
function ExperimentsArt() {
  const cards = [QUESTIONS[0], QUESTIONS[2], QUESTIONS[3]];
  return (
    <Art>
      <div className="relative h-[64px] w-[76px] tablet:h-[104px] tablet:w-[124px]">
        {cards.map((q, i) => (
          <span
            key={q.id}
            style={
              {
                '--i': i,
                '--r': `${(i - 1) * 8}deg`,
                left: `${i * 18}%`,
                top: `${i === 1 ? 0 : 10}%`,
                zIndex: i === 1 ? 2 : 1,
              } as React.CSSProperties
            }
            className="o-hiw-card absolute w-[52%] overflow-hidden rounded-[6px] bg-[var(--o-ink)] shadow-[0_10px_24px_-12px_rgba(0,0,0,0.45)] ring-1 ring-[color:var(--o-line-2)]"
          >
            <Image
              src={`/consciousness/sets/poster/${q.scene}.webp`}
              alt=""
              width={160}
              height={120}
              className="aspect-[4/3] w-full object-cover"
            />
            <span className="block space-y-1 p-1.5">
              <span className="block h-[3px] w-[85%] rounded bg-[rgb(var(--o-text-rgb)/0.25)]" />
              <span className="block h-[3px] w-[60%] rounded bg-[rgb(var(--o-text-rgb)/0.15)]" />
              <span className="block h-[3px] w-[45%] rounded bg-[var(--o-gold)]" />
            </span>
          </span>
        ))}
      </div>
    </Art>
  );
}

/** 4. The six questions, each ring closing on a result, either way. */
function AnswersArt() {
  return (
    <Art>
      <div className="grid grid-cols-3 gap-1 tablet:gap-2">
        {QUESTIONS.map((q, i) => (
          <svg
            key={q.id}
            viewBox="0 0 44 44"
            className="h-[24px] w-[24px] tablet:h-[38px] tablet:w-[38px]"
          >
            <circle
              cx={22}
              cy={22}
              r={19}
              fill="var(--o-ink)"
              stroke="var(--o-line-2)"
              strokeWidth={2}
            />
            <circle
              className="o-hiw-ring"
              style={{ '--i': i } as React.CSSProperties}
              cx={22}
              cy={22}
              r={19}
              fill="none"
              stroke={i % 2 === 0 ? 'var(--o-gold)' : 'var(--o-ice)'}
              strokeWidth={3}
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray="100"
              transform="rotate(-90 22 22)"
            />
            <text
              x={22}
              y={26.5}
              textAnchor="middle"
              fontSize={12}
              fontWeight={600}
              fill="var(--o-text)"
            >
              Q{i + 1}
            </text>
          </svg>
        ))}
      </div>
    </Art>
  );
}

const STEPS = [
  {
    Art: BackersArt,
    title: 'You add to the pool',
    text: 'Any amount, alongside everyone else who wants to know. The pool is the whole budget for this call.',
  },
  {
    Art: PoolArt,
    title: 'The pool funds experiments',
    text: 'Every dollar goes to research under this call, and nothing else.',
  },
  {
    Art: ExperimentsArt,
    title: 'Leading scientists run them',
    text: 'Labs propose experiments in the open on ResearchHub, peers review them, and the strongest get funded.',
  },
  {
    Art: AnswersArt,
    title: 'Results answer the questions',
    text: 'Data, code and results are published openly, whichever way they point.',
  },
];

/** A goal over its two stages: a numbered tag, the aim, where it stands, and a bracket down to the stages. */
function GoalHead({
  n,
  title,
  current,
  children,
  className,
}: {
  n: number;
  title: string;
  current: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('o-hiw-goal flex flex-col tablet:col-span-2', className)}>
      <p
        className={cn(
          'self-start rounded-full px-3 py-1 text-[12.5px] font-semibold',
          current
            ? 'bg-[var(--o-gold)] text-[var(--o-onGold)]'
            : 'text-[var(--o-gold)] ring-1 ring-inset ring-[color:rgb(var(--o-gold-rgb)/0.5)]'
        )}
      >
        Goal {n}
        {current && <span className="font-normal opacity-80"> · now</span>}
      </p>
      <h3 className="o-serif mt-3 max-w-[18em] text-[24px] leading-tight tablet:text-[30px]">
        {title}
      </h3>
      <div className="mt-2 text-[14.5px] leading-[1.55] text-[var(--o-soft)]">{children}</div>
      {/* On wide screens, a bracket from the goal down to its two stages. */}
      <span
        aria-hidden
        className="mx-[24%] mt-auto hidden h-3 rounded-t-[10px] border-x border-t border-[color:var(--o-line-2)] pt-6 tablet:block"
      />
    </div>
  );
}

/** Phone order: goal 1, its stages, goal 2, its stages. Wide screens: both goals above all four stages. */
const PHONE_ORDER = ['order-2', 'order-3', 'order-5', 'order-6'];

/**
 * How giving turns into answers, in two goals. Goal 1 (now): raise the
 * pool by its date; backers add to it and it fills. Goal 2: run the
 * experiments; scientists propose and run them, and the results close the
 * six open questions. On wide screens the goals sit above the four stages,
 * each bracketing its two; on phones each goal heads its own stages. A
 * dotted track with moving dots joins the stages. Sits just before the
 * pool, with its own button.
 */
export function HowItWorks() {
  const rfp = ORCH_OR_RFP;
  const { pool } = rfp;
  const pct = Math.round(poolPercent(rfp));
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-title"
      className="o-rule scroll-mt-10 border-t py-24 tablet:py-32"
    >
      <Wrap>
        <p className="o-reveal text-[14px] text-[var(--o-mute)]">How it works, in two goals</p>
        <h2
          id="how-title"
          className="o-reveal o-serif mt-3 max-w-[16em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
        >
          Your money becomes experiments. <em className="block">Experiments become answers.</em>
        </h2>

        <Sequence className="mt-14 grid grid-cols-1 gap-10 tablet:mt-20 tablet:grid-cols-4 tablet:gap-x-8 tablet:gap-y-4">
          <GoalHead
            n={1}
            current
            title={`Raise ${formatUsdShort(pool.goalUsd)} by ${formatDate(pool.goalBy)}`}
            className="order-1 tablet:order-none"
          >
            <PoolBar className="mb-2.5 mt-1 h-1.5 max-w-[320px]" />
            <span className="tabular-nums text-[var(--o-text)]">
              {formatUsd(pool.raisedUsd)}
            </span>{' '}
            raised from {pool.backerCount} backers
            <span className="mx-2 opacity-50">·</span>
            {pct}%
          </GoalHead>
          <GoalHead
            n={2}
            current={false}
            title="Run the experiments that answer the six questions"
            className="order-4 mt-4 tablet:order-none tablet:mt-0"
          >
            Proposals are {deadlinePhrase(rfp)}. The pool pays for the strongest.
          </GoalHead>

          {STEPS.map(({ Art: StepArt, title, text }, i) => (
            <div
              key={title}
              style={{ '--i': i } as React.CSSProperties}
              className={cn(
                'o-hiw-step relative flex items-start gap-5 tablet:order-none tablet:flex-col tablet:items-stretch tablet:gap-0 tablet:text-center',
                PHONE_ORDER[i]
              )}
            >
              {/* Wide screens: track from this plate across to the next. */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="o-hiw-track absolute left-1/2 top-[91px] hidden h-[3px] w-[calc(100%+2rem)] tablet:block"
                />
              )}
              {/* Phones: track down to the next plate in the same goal. */}
              {i % 2 === 0 && (
                <span
                  aria-hidden
                  className="o-hiw-track o-hiw-track-y absolute left-[54.5px] top-[112px] h-[calc(100%-112px+2.5rem)] w-[3px] tablet:hidden"
                />
              )}
              <StepArt />
              <div className="pt-3 tablet:mt-6 tablet:px-2 tablet:pt-0">
                <p className="text-[13px] font-semibold tabular-nums text-[var(--o-gold)]">
                  {i + 1}
                </p>
                <h4 className="o-serif mt-1 text-[22px] leading-tight tablet:text-[24px]">
                  {title}
                </h4>
                <p className="mt-2 text-[15px] leading-[1.55] text-[var(--o-soft)]">{text}</p>
              </div>
            </div>
          ))}
        </Sequence>

        <div
          data-orch-cta
          className="o-reveal mt-16 flex flex-col items-start gap-5 rounded-[18px] bg-[rgb(var(--o-gold-rgb)/0.07)] p-6 ring-1 ring-[color:rgb(var(--o-gold-rgb)/0.2)] tablet:mt-20 tablet:flex-row tablet:items-center tablet:justify-between tablet:p-8"
        >
          <div>
            <p className="o-serif text-[24px] leading-tight tablet:text-[28px]">
              Help reach Goal 1: {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}.
            </p>
            <p className="mt-2 text-[15px] text-[var(--o-soft)]">
              <span className="tabular-nums text-[var(--o-text)]">{formatUsd(pool.raisedUsd)}</span>{' '}
              raised from {pool.backerCount} backers
              <span className="mx-2 opacity-50">·</span>
              {pct}% of the goal
            </p>
          </div>
          <AddToPoolButton size="lg" className="w-full shrink-0 tablet:w-auto" />
        </div>
      </Wrap>
    </section>
  );
}
