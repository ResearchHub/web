import Image from 'next/image';
import { Avatar } from '@/components/ui/Avatar';
import { QUESTIONS } from '../data/content';
import { ORCH_OR_RFP, formatDate, formatUsd, formatUsdShort, poolPercent } from '../data/mockRfp';
import { Sequence } from './Motion';
import { AddToPoolButton, SubmitProposalButton } from './OrchActions';
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
    text: 'Any amount. Your gift joins everyone else’s in one pool, the whole budget for this call.',
  },
  {
    Art: ExperimentsArt,
    title: 'Scientists submit proposals',
    text: 'Labs post their experiments on ResearchHub: the methods, the budget, and what result would count against their own view.',
  },
  {
    Art: PoolArt,
    title: 'Peers review, the pool pays',
    text: 'Proposals are reviewed in the open on ResearchHub, and the strongest are paid for from the pool.',
  },
  {
    Art: AnswersArt,
    title: 'Results are published',
    text: 'Data, code and results go up on ResearchHub, whichever way they point, so anyone can check them.',
  },
];

/**
 * How it works from the reader's side: what a backer and a scientist each
 * do, in four stages on one dotted track (you give, scientists propose,
 * peers review and the pool pays, results are published). The programme's
 * dates and targets are in the phases under the hero, not here. Sits just
 * before the pool, with its own buttons.
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
        <p className="o-reveal text-[14px] text-[var(--o-mute)]">How it works</p>
        <h2
          id="how-title"
          className="o-reveal o-serif mt-3 max-w-[16em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
        >
          Your money becomes experiments. <em className="block">Experiments become answers.</em>
        </h2>

        <Sequence className="relative mt-14 tablet:mt-20">
          <ol className="relative grid grid-cols-1 gap-10 tablet:grid-cols-4 tablet:gap-8">
            {STEPS.map(({ Art: StepArt, title, text }, i) => (
              <li
                key={title}
                style={{ '--i': i } as React.CSSProperties}
                className="o-hiw-step relative flex items-start gap-5 tablet:flex-col tablet:items-stretch tablet:gap-0 tablet:text-center"
              >
                {i < STEPS.length - 1 && (
                  <>
                    {/* Wide screens: track from this plate across to the next. */}
                    <span
                      aria-hidden
                      className="o-hiw-track absolute left-1/2 top-[91px] hidden h-[3px] w-[calc(100%+2rem)] tablet:block"
                    />
                    {/* Phones: track down to the next plate. */}
                    <span
                      aria-hidden
                      className="o-hiw-track o-hiw-track-y absolute left-[54.5px] top-[112px] h-[calc(100%-112px+2.5rem)] w-[3px] tablet:hidden"
                    />
                  </>
                )}
                <StepArt />
                <div className="pt-3 tablet:mt-6 tablet:px-2 tablet:pt-0">
                  <p className="text-[13px] font-semibold tabular-nums text-[var(--o-gold)]">
                    {i + 1}
                  </p>
                  <h3 className="o-serif mt-1 text-[22px] leading-tight tablet:text-[24px]">
                    {title}
                  </h3>
                  <p className="mt-2 text-[15px] leading-[1.55] text-[var(--o-soft)]">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </Sequence>

        <div
          data-orch-cta
          className="o-reveal mt-16 flex flex-col items-start gap-5 rounded-[18px] bg-[rgb(var(--o-gold-rgb)/0.07)] p-6 ring-1 ring-[color:rgb(var(--o-gold-rgb)/0.2)] tablet:mt-20 tablet:flex-row tablet:items-center tablet:justify-between tablet:p-8"
        >
          <div>
            <p className="o-serif text-[24px] leading-tight tablet:text-[28px]">
              Help complete Phase 1: {formatUsdShort(pool.goalUsd)} by {formatDate(pool.goalBy)}.
            </p>
            <p className="mt-2 text-[15px] text-[var(--o-soft)]">
              <span className="tabular-nums text-[var(--o-text)]">{formatUsd(pool.raisedUsd)}</span>{' '}
              raised from {pool.backerCount} backers
              <span className="mx-2 opacity-50">·</span>
              {pct}% of the target
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 tablet:w-auto tablet:flex-row">
            <SubmitProposalButton size="lg" className="w-full tablet:w-auto" />
            <AddToPoolButton size="lg" className="w-full tablet:w-auto" />
          </div>
        </div>
      </Wrap>
    </section>
  );
}
