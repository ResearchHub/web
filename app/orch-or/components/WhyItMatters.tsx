import { Cpu } from 'lucide-react';
import { Wrap } from './Story';

/**
 * Why the questions matter beyond neuroscience: what an answer would tell
 * us about AI. Written as a conditional, since nobody knows the answer;
 * it promises nothing about the AI this research might lead to.
 */
export function WhyItMatters() {
  return (
    <section aria-labelledby="why-title" className="o-rule border-t py-24 tablet:py-32">
      <Wrap>
        <div className="grid grid-cols-1 gap-8 tablet:grid-cols-12 tablet:gap-12">
          <div className="tablet:col-span-5">
            <p className="o-reveal flex items-center gap-2 text-[14px] text-[var(--o-mute)]">
              <Cpu aria-hidden strokeWidth={2} className="h-4 w-4 text-[var(--o-gold)]" />
              Why it matters
            </p>
            <h2
              id="why-title"
              className="o-reveal o-serif mt-4 max-w-[11em] text-[clamp(32px,4vw,56px)] leading-[1.06]"
            >
              What it would tell us about AI
            </h2>
          </div>
          <div className="o-reveal o-prose space-y-5 tablet:col-span-7 tablet:pt-10">
            <p>
              Today’s AI computes. Whether computing alone can give rise to understanding, or to
              experience, is one of the open questions on this page (
              <a
                href="#q-computation"
                className="underline decoration-[color:var(--o-line-2)] underline-offset-4 hover:decoration-current"
              >
                Q6
              </a>
              ).
            </p>
            <p>
              If consciousness depends on physics that computers do not use, that would show what
              current AI is missing. If it does not, that would show machines could get there by
              computing alone.{' '}
              <span className="text-[var(--o-text)]">
                Either answer would change how AI is built, and how we treat what we build.
              </span>
            </p>
            <p className="text-[15px] text-[var(--o-mute)]">
              Nobody knows which answer is right. Experiments like the ones funded here are how we
              find out.
            </p>
          </div>
        </div>
      </Wrap>
    </section>
  );
}
