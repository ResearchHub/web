import { ThumbsDown, ThumbsUp } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { SetId } from '../theme';
import { QUESTIONS, type Question } from '../data/content';
import { Figure } from './Figure';
import { TrackApplyLink } from './OrchActions';
import { Rich } from './Rich';
import { Refs, Wrap } from './Story';

function Outcome({ side, children }: { side: 'for' | 'against'; children: string }) {
  const Icon = side === 'for' ? ThumbsUp : ThumbsDown;
  return (
    <p className="flex gap-3 text-[15px] leading-[1.55]">
      <Icon
        aria-hidden
        strokeWidth={2}
        className={cn(
          'mt-[3px] h-4 w-4 shrink-0',
          side === 'for' ? 'text-[var(--o-gold)]' : 'text-[var(--o-ice)]'
        )}
      />
      <span className="text-[var(--o-soft)]">
        <span className="text-[var(--o-text)]">
          {side === 'for' ? 'Would support it: ' : 'Would count against it: '}
        </span>
        <Rich>{children}</Rich>
      </span>
    </p>
  );
}

function QuestionBlock({ q, n, flip, set }: { q: Question; n: number; flip: boolean; set: SetId }) {
  return (
    <article
      id={`q-${q.id}`}
      aria-labelledby={`q-${q.id}-title`}
      className="grid scroll-mt-24 grid-cols-1 items-center gap-8 tablet:grid-cols-12 tablet:gap-12"
    >
      <Figure
        set={set}
        sceneId={q.scene}
        figure={q.figure}
        className={cn('tablet:col-span-7', flip && 'tablet:order-2')}
      />
      <div className={cn('tablet:col-span-5', flip && 'tablet:order-1')}>
        <h3
          id={`q-${q.id}-title`}
          className="o-reveal o-serif text-[clamp(26px,2.6vw,36px)] leading-[1.12]"
        >
          <span className="text-[var(--o-gold)]">Q{n}:</span> {q.question}
        </h3>
        <p className="o-reveal mt-4 text-[16px] leading-[1.65] text-[var(--o-soft)]">
          <Rich>{q.known}</Rich>
          <Refs ids={q.sources} />
        </p>
        <div className="o-reveal mt-6 space-y-2">
          <Outcome side="for">{q.countsFor}</Outcome>
          <Outcome side="against">{q.countsAgainst}</Outcome>
        </div>
        <div className="mt-6">
          <TrackApplyLink trackId={q.id} label="Propose an experiment" />
        </div>
      </div>
    </article>
  );
}

/**
 * The open questions: six with a figure, alternating sides, then a short
 * text-only coda inviting any other proposal on the topic.
 */
export function Questions({ set = 'ink' }: { set?: SetId }) {
  return (
    <section aria-labelledby="questions-title" className="o-rule border-t py-24 tablet:py-32">
      <Wrap>
        <h2
          id="questions-title"
          className="o-reveal o-serif max-w-[13em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
        >
          Six unanswered questions
        </h2>
        <p className="o-reveal o-prose mt-5 max-w-[34em]">
          For each, we say in advance what would count as a yes and what would count as a no. The
          funding follows the experiment, not the side.
        </p>

        <div className="mt-16 space-y-24 tablet:mt-20 tablet:space-y-32">
          {QUESTIONS.map((q, i) => (
            <QuestionBlock key={q.id} q={q} n={i + 1} flip={i % 2 === 1} set={set} />
          ))}
        </div>

        <article
          id="q-critique"
          aria-labelledby="q-critique-title"
          className="o-rule mx-auto mt-24 max-w-[40em] scroll-mt-24 border-t pt-16 text-center tablet:mt-32"
        >
          <h3
            id="q-critique-title"
            className="o-reveal o-serif text-[clamp(26px,2.6vw,36px)] leading-[1.12]"
          >
            Have a different idea?
          </h3>
          <p className="o-reveal mx-auto mt-4 max-w-[34em] text-[16px] leading-[1.65] text-[var(--o-soft)]">
            The six questions are a start, not a limit. Any rigorous proposal on how consciousness
            arises is welcome, quantum or not: an experiment we did not list, a replication, a
            critique, or a new theory with a way to test it. Each is judged on the same terms.
          </p>
          <div className="mt-6">
            <TrackApplyLink trackId="critique" label="Propose something else" />
          </div>
        </article>
      </Wrap>
    </section>
  );
}
