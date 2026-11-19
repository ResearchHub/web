import { cn } from '@/utils/styles';
import { LEDGER, SPREAD } from '../data/content';
import { Ref } from './Parts';

/* The funnel ---------------------------------------------------------------- */

/**
 * How wide the funnel is at the top of each stage, as a share of its column;
 * the last value is the spout. Chosen to read as a funnel, not to scale:
 * the real figures span four orders of magnitude.
 */
const FUNNEL_WIDTHS = [100, 76, 36, 36, 21, 11, 7];

/**
 * The astrophysics audit as a funnel: papers go in at the top (black) and
 * narrow to the few that were recomputed; errors come out (red) and narrow
 * to the few anyone had challenged. Each stage's figure sits beside it.
 */
export function Funnel() {
  return (
    <figure>
      <ol>
        {LEDGER.map((row, i) => {
          const top = FUNNEL_WIDTHS[i];
          const bottom = FUNNEL_WIDTHS[i + 1];
          const opensGroup = i === 0 || LEDGER[i - 1].flagged !== row.flagged;
          return (
            <li
              key={row.label}
              className="grid grid-cols-[minmax(0,26%)_minmax(0,1fr)] gap-x-5 tablet:grid-cols-[minmax(0,34%)_minmax(0,1fr)] tablet:gap-x-10"
            >
              <div aria-hidden className="relative">
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="absolute inset-0 h-full w-full"
                >
                  <polygon
                    points={`${50 - top / 2},0 ${50 + top / 2},0 ${50 + bottom / 2},100 ${50 - bottom / 2},100`}
                    fill={row.flagged ? 'var(--a-red)' : 'var(--a-ink)'}
                  />
                  {/* A hairline of paper between one stage and the next. */}
                  {i > 0 && (
                    <line
                      x1={0}
                      x2={100}
                      y1={0}
                      y2={0}
                      stroke="var(--a-paper)"
                      strokeWidth={4}
                      vectorEffect="non-scaling-stroke"
                    />
                  )}
                </svg>
              </div>
              <div
                className={cn(
                  'a-reveal border-t py-6 tablet:py-7',
                  row.flagged ? 'border-[color:var(--a-red)]' : 'border-[color:var(--a-line-2)]'
                )}
              >
                {opensGroup && (
                  <p
                    className={cn(
                      'a-mono mb-3',
                      row.flagged ? 'text-[var(--a-red-deep)]' : 'text-[var(--a-mute)]'
                    )}
                  >
                    {row.flagged ? 'Errors out' : 'Papers in'}
                  </p>
                )}
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span
                    className={cn(
                      'a-serif text-[clamp(34px,4.6vw,54px)] leading-none tabular-nums',
                      row.flagged && 'text-[var(--a-red-deep)]'
                    )}
                  >
                    {row.value}
                  </span>
                  <span className="text-[16px] font-semibold leading-snug">{row.label}</span>
                </p>
                <p className="mt-2 max-w-[30em] text-[15px] leading-[1.5] text-[var(--a-soft)]">
                  {row.detail}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <figcaption className="a-mono mt-2 border-t border-[color:var(--a-line-2)] pt-4 !normal-case !tracking-normal text-[var(--a-mute)]">
        The funnel is not drawn to scale. Figures from the audit’s own pages.
        <Ref n={1} />
        <Ref n={3} />
      </figcaption>
    </figure>
  );
}

/* How an error spreads ------------------------------------------------------ */

/**
 * How the audit's errors travelled, as one ratio: the later papers that
 * repeated an error against the later papers that objected to one. No
 * graphic; the ratio is the figure.
 */
export function Spread() {
  const { copyingPapers, objectingPapers, challenged, stillCopied, laterCopies } = SPREAD;
  const ratio = (copyingPapers / objectingPapers).toFixed(1);
  return (
    <figure className="a-reveal mt-14 border-y border-[color:var(--a-ink)] py-12 tablet:py-16">
      <div className="grid grid-cols-1 gap-x-16 gap-y-10 content-md:grid-cols-12 content-md:items-end">
        <p
          aria-label={`${ratio} to 1`}
          className="a-serif flex items-baseline gap-[0.16em] !whitespace-nowrap text-[clamp(96px,16.5vw,230px)] leading-[0.8] tabular-nums content-md:col-span-7"
        >
          <span className="text-[var(--a-red-deep)]">{ratio}</span>
          <span className="text-[0.6em] text-[var(--a-mute)]">:</span>
          <span className="text-[var(--a-blue)]">1</span>
        </p>

        <figcaption className="content-md:col-span-5">
          <p className="a-serif text-[26px] leading-[1.16] tablet:text-[32px]">
            For every later paper that objected to an error, more than five repeated one.
          </p>
          <dl className="mt-7 space-y-3 text-[15.5px] leading-snug text-[var(--a-soft)]">
            <div className="flex items-baseline gap-3">
              <dd className="a-serif w-[3.2rem] shrink-0 text-[24px] leading-none tabular-nums text-[var(--a-red-deep)]">
                {copyingPapers}
              </dd>
              <dt>later papers repeated one of the audit’s errors.</dt>
            </div>
            <div className="flex items-baseline gap-3">
              <dd className="a-serif w-[3.2rem] shrink-0 text-[24px] leading-none tabular-nums text-[var(--a-blue)]">
                {objectingPapers}
              </dd>
              <dt>later papers objected to one.</dt>
            </div>
          </dl>
        </figcaption>
      </div>

      <p className="mt-12 max-w-[52em] text-[14.5px] leading-[1.6] text-[var(--a-soft)]">
        An objection did not end it. Of the {challenged} errors that were challenged in print,{' '}
        {stillCopied} went on being copied, by {laterCopies} more papers. The audit read only the
        citing papers with open text, so these counts are floors.
        <Ref n={1} />
      </p>
    </figure>
  );
}
