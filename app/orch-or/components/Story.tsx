import Image from 'next/image';
import {
  ArrowRight,
  Brain,
  CircleHelp,
  Lightbulb,
  MessageSquareQuote,
  Microscope,
  Scale,
  ThumbsDown,
  ThumbsUp,
} from 'lucide-react';
import { cn } from '@/utils/styles';
import { OPEN_PROBLEM, TIMELINE, type Moment } from '../data/content';
import { Sequence, TimelineScroller } from './Motion';
import { Rich } from './Rich';
import { TenetIcon } from './TenetIcons';

export function Wrap({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div
      id={id}
      className={cn('mx-auto w-full max-w-[1200px] px-5 tablet:px-10 content-lg:px-12', className)}
    >
      {children}
    </div>
  );
}

/** Numbered links to the source list at the foot of the page. */
export function Refs({ ids }: { ids: number[] }) {
  if (ids.length === 0) return null;
  return (
    <span className="ml-1 whitespace-nowrap text-[0.8em] text-[var(--o-mute)]">
      {ids.map((id, i) => (
        <a
          key={id}
          href={`#source-${id}`}
          className="hover:text-[var(--o-text)]"
          aria-label={`Source ${id}`}
        >
          {i === 0 ? '[' : ''}
          {id}
          {i === ids.length - 1 ? ']' : ','}
        </a>
      ))}
    </span>
  );
}

/**
 * The open problem of consciousness in four parts, none settled, with Orch
 * OR's answer to each beneath it: the most developed quantum proposal, and
 * the one that answers all four in one chain.
 */
export function Claim() {
  return (
    <section aria-labelledby="claim-title" className="py-24 tablet:py-32">
      <Wrap>
        <h2
          id="claim-title"
          className="o-reveal o-serif max-w-[14em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
        >
          An open problem, in four parts
        </h2>
        <p className="o-reveal o-prose mt-5 max-w-[36em]">
          How a brain gives rise to experience is one of the largest unanswered questions in
          science. It breaks into four parts, and none has an agreed answer.
          <Refs ids={[26]} />
        </p>

        <Sequence>
          <ol className="mt-14 grid grid-cols-1 gap-x-10 gap-y-10 tablet:grid-cols-2 content-md:grid-cols-4">
            {OPEN_PROBLEM.map((part, i) => (
              <li
                key={part.n}
                style={{ '--i': i } as React.CSSProperties}
                className="relative pt-6"
              >
                {/* A quiet rule, and a gold one a signal draws over it. */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-[var(--o-line)]" />
                <span
                  aria-hidden
                  className="o-chain-rule absolute inset-x-0 top-0 h-px bg-[rgb(var(--o-gold-rgb)/0.55)]"
                />
                <span
                  aria-hidden
                  className="o-chain-spark absolute top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--o-gold)] shadow-[0_0_14px_3px_rgb(var(--o-gold-rgb)/0.8)]"
                />
                <div className="flex items-end justify-between gap-4">
                  <span className="o-chain-n o-serif block text-[44px] italic leading-none text-[var(--o-gold)]">
                    {part.n}
                  </span>
                  <TenetIcon index={i} />
                </div>
                <div className="o-chain-body">
                  <h3 className="o-serif mt-4 text-[24px] leading-tight">{part.name}</h3>
                  <p className="mt-2 text-[15px] leading-[1.6] text-[var(--o-soft)]">
                    <Rich>{part.text}</Rich>
                  </p>
                  <p className="mt-3 text-[13.5px] leading-[1.55] text-[var(--o-mute)]">
                    <span className="text-[var(--o-text)]">Orch OR:</span>{' '}
                    <Rich>{part.orchOr}</Rich>
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Sequence>

        <p className="o-reveal o-prose mt-14 max-w-[40em]">
          Orch OR, proposed in 1996 by the physicist Roger Penrose and the anesthesiologist Stuart
          Hameroff, is the most developed quantum proposal, and it answers all four in a single
          chain. Every link can be tested, which makes it a good place to start, though not the only
          one: this call funds the experiments, whichever answer they favour.
          <Refs ids={[1, 18]} />
        </p>
      </Wrap>
    </section>
  );
}

/** How each moment moved the field: an icon and a short label. */
const KIND = {
  approach: { Icon: Microscope, tone: 'text-[var(--o-white)]', label: 'An approach' },
  problem: { Icon: CircleHelp, tone: 'text-[var(--o-white)]', label: 'A problem' },
  argument: { Icon: MessageSquareQuote, tone: 'text-[var(--o-white)]', label: 'An argument' },
  theory: { Icon: Lightbulb, tone: 'text-[var(--o-white)]', label: 'A theory' },
  objection: { Icon: ThumbsDown, tone: 'text-[var(--o-ice)]', label: 'An objection' },
  finding: { Icon: Brain, tone: 'text-[var(--o-white)]', label: 'A finding' },
  evidence: { Icon: ThumbsUp, tone: 'text-[var(--o-gold)]', label: 'Evidence' },
  test: { Icon: Scale, tone: 'text-[var(--o-white)]', label: 'A test' },
} as const;

/** An author without a freely licensed photo: their initials in the same circle. */
function Initials({ name }: { name: string }) {
  const letters = name
    .split(' ')
    .map((w) => w[0])
    .join('');
  return (
    <span
      aria-hidden
      className="o-serif flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--o-text-rgb)/0.06)] text-[19px] tracking-[0.02em] text-[var(--o-soft)] ring-1 ring-[color:var(--o-line-2)] transition-colors duration-500 group-hover:text-[var(--o-text)]"
    >
      {letters}
    </span>
  );
}

/**
 * One moment on the axis. Moments alternate above and below the line, each
 * starting half a card after the last, so the row reads as one continuous
 * timeline. The dot sits on the axis with the year on its far side; a short
 * stem joins it to the card.
 */
function MomentItem({ m, i }: { m: Moment; i: number }) {
  const side = KIND[m.kind];
  const above = i % 2 === 0;
  return (
    <li
      style={
        { '--i': i, gridColumn: `${i + 1} / span 2`, gridRow: above ? 1 : 3 } as React.CSSProperties
      }
      className={cn(
        'group relative w-[256px] snap-start tablet:w-[300px]',
        above ? 'self-end' : 'self-start'
      )}
    >
      {/* Stem, dot and year, in the axis row. */}
      <span
        aria-hidden
        className={cn(
          'o-tl-node pointer-events-none absolute left-7 flex w-0 flex-col items-center',
          above ? 'top-full' : 'bottom-full flex-col-reverse'
        )}
      >
        <span className="block h-[30px] w-px bg-[var(--o-line-2)]" />
        <span
          className={cn(
            'block h-3 w-3 shrink-0 rounded-full bg-current ring-[5px] ring-[var(--o-ink)] transition-transform duration-300 group-hover:scale-125',
            side.tone
          )}
        />
        <span
          className={cn(
            'o-serif whitespace-nowrap text-[17px] leading-none text-[var(--o-soft)] transition-colors duration-300 group-hover:text-[var(--o-text)]',
            above ? 'mt-2.5' : 'mb-2.5'
          )}
        >
          {m.year}
        </span>
      </span>

      <div className="o-tl-face flex items-center gap-3">
        {m.person.photo ? (
          <Image
            src={m.person.photo.src}
            alt=""
            width={56}
            height={56}
            className="h-14 w-14 shrink-0 rounded-full object-cover ring-1 ring-[color:var(--o-line-2)] grayscale-[35%] transition-[filter] duration-500 group-hover:grayscale-0"
          />
        ) : (
          <Initials name={m.person.name} />
        )}
        <span className="min-w-0">
          <span className="block truncate text-[13.5px] text-[var(--o-text)]">{m.person.name}</span>
          <span className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[12px] text-[var(--o-mute)]">
            <side.Icon aria-hidden strokeWidth={2} className={cn('h-3.5 w-3.5', side.tone)} />
            {side.label}
          </span>
        </span>
      </div>
      <div className="o-tl-body">
        <p className="mt-3 text-[14px] leading-[1.5] text-[var(--o-soft)] tablet:text-[14.5px]">
          <span className="sr-only">{m.year}: </span>
          {m.text}
        </p>
        <p className="mt-2 text-[12.5px] text-[var(--o-mute)]">
          {m.cite}
          <Refs ids={m.sources} />
        </p>
      </div>
    </li>
  );
}

/** Consciousness science so far, oldest on the left, newest on the right. */
export function Timeline() {
  const first = TIMELINE[0].year;
  const last = TIMELINE[TIMELINE.length - 1].year;
  return (
    <section aria-labelledby="timeline-title" className="o-rule border-t py-24 tablet:py-32">
      <Sequence>
        <TimelineScroller
          header={
            <h2
              id="timeline-title"
              className="o-reveal o-serif max-w-[16em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
            >
              Consciousness science, so far
            </h2>
          }
          hint={
            <p className="mt-4 flex items-center gap-2 text-[13px] text-[var(--o-mute)] tablet:hidden">
              Swipe through time, {first} to {last}
              <ArrowRight aria-hidden className="h-3.5 w-3.5" />
            </p>
          }
        >
          <div className="o-tl-pad w-max pb-2">
            <ol className="relative grid w-max auto-cols-[var(--c)] grid-rows-[auto_76px_auto] [--c:144px] tablet:[--c:166px]">
              {/* The axis, from the first dot to the last. */}
              <li
                aria-hidden
                role="presentation"
                style={{ gridColumn: `1 / ${TIMELINE.length + 2}`, gridRow: 2 }}
                className="relative"
              >
                <span className="o-tl-line absolute left-7 right-[calc(2*var(--c)-1.75rem)] top-1/2 block h-px bg-[var(--o-line-2)]" />
              </li>
              {TIMELINE.map((m, i) => (
                <MomentItem key={`${m.year}-${m.cite}`} m={m} i={i} />
              ))}
            </ol>
          </div>
        </TimelineScroller>
      </Sequence>
    </section>
  );
}

/** Photo credits for the timeline, shown with the sources. */
export function PhotoCredits() {
  const people = TIMELINE.flatMap(({ person: { name, photo } }) =>
    photo ? [{ name, photo }] : []
  ).filter((p, i, all) => all.findIndex((q) => q.name === p.name) === i);
  return (
    <p className="mt-10 text-[12.5px] leading-[1.6] text-[var(--o-mute)]">
      Photos, from Wikimedia Commons, show authors of the work cited, not endorsers of this call:{' '}
      {people.map((p, i) => (
        <span key={p.name}>
          {p.name} by{' '}
          <a
            href={p.photo.sourceUrl}
            className="underline underline-offset-2 hover:text-[var(--o-text)]"
          >
            {p.photo.author}
          </a>
          ,{' '}
          <a
            href={p.photo.licenceUrl}
            className="underline underline-offset-2 hover:text-[var(--o-text)]"
          >
            {p.photo.licence}
          </a>
          , cropped{i < people.length - 1 ? '; ' : '.'}
        </span>
      ))}
    </p>
  );
}
