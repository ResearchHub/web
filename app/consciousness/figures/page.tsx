import { Fragment } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import { QUESTIONS } from '../data/content';
import { FigureArt } from '../components/Figure';
import { SETS } from '../sets/registry';
import { FIGURE_IDS, isPosterOnly, type FigureId, type PosterFigureId } from '../sets/types';
import { parseHero } from '../sets/heroes';
import { DEFAULT_SET, SET_IDS, THEMES, parseSet, themeVars, type SetId } from '../theme';

export const metadata: Metadata = {
  title: 'Consciousness figures: graphic sets',
  robots: { index: false, follow: false },
};

const ROWS: { fig: FigureId; label: string; title: string }[] = FIGURE_IDS.map((fig) => {
  if (fig === 'hero') return { fig, label: 'Hero', title: 'The microtubule' };
  const i = QUESTIONS.findIndex((q) => q.scene === fig);
  return { fig, label: `Q${i + 1}`, title: QUESTIONS[i].name };
});

/** `?sets=ink,poster` picks the columns; all of them by default. */
function pickSets(value: unknown): SetId[] {
  const raw = typeof value === 'string' ? value.split(',') : [];
  const picked = SET_IDS.filter((id) => raw.includes(id));
  return picked.length ? picked : [...SET_IDS];
}

const setsHref = (ids: SetId[]) =>
  ids.length === SET_IDS.length
    ? '/consciousness/figures'
    : `/consciousness/figures?sets=${ids.join(',')}`;

/**
 * Every figure in every graphic set, side by side: one row per figure, one
 * column per set, each cell on its own set's ground. Only cells on screen
 * animate (each set's live layer mounts while visible and unmounts after).
 * The columns scroll sideways together when they do not fit (always on
 * phones); `?sets=` narrows them to the sets being compared.
 *
 * `?solo=<set>-<fig>` shows one figure filling the window instead, which is
 * how the static fallback images are captured (with `orch-capture=1`).
 */
export default async function FiguresGallery({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const solo = params.solo;
  if (typeof solo === 'string' && solo.includes('-')) {
    const [setId, fig] = solo.split('-') as [string, PosterFigureId];
    const set = parseSet(setId);
    if (FIGURE_IDS.includes(fig as FigureId) || isPosterOnly(fig)) {
      return (
        <div
          style={themeVars(set)}
          data-solo={`${set}-${fig}`}
          className="o-set fixed inset-0 z-[60] bg-[var(--o-ink)]"
        >
          <FigureArt set={set} fig={fig} hero={parseHero(params.hero)} />
        </div>
      );
    }
  }
  const shown = SETS.filter((s) => pickSets(params.sets).includes(s.id));
  const columns = {
    gridTemplateColumns: `repeat(${shown.length}, minmax(min(82vw, 330px), 1fr))`,
  };

  return (
    <div className="pb-24">
      <header className="px-5 pb-8 pt-16 tablet:px-10 content-lg:px-16">
        <p className="text-[13px] text-[var(--o-mute)]">
          <Link href="/consciousness" className="underline-offset-4 hover:underline">
            Orch OR landing page
          </Link>{' '}
          · preview
        </p>
        <h1 className="o-serif mt-3 text-[clamp(34px,4.4vw,60px)] leading-[1.04]">
          Six graphic sets, <em>side by side.</em>
        </h1>
        <p className="o-prose mt-4 max-w-[40em]">
          The same six figures in six art styles: the current one and five alternatives. Each set
          has its own library, palette, type and fallback; open one to see the whole page in it.
        </p>
        <nav aria-label="Sets to compare" className="mt-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 text-[13px] text-[var(--o-mute)]">Compare</span>
          {SETS.map((s) => {
            const on = shown.some((x) => x.id === s.id);
            const next = on
              ? shown.filter((x) => x.id !== s.id).map((x) => x.id)
              : SET_IDS.filter((id) => id === s.id || shown.some((x) => x.id === id));
            return (
              <Link
                key={s.id}
                href={setsHref(next.length ? next : [s.id])}
                scroll={false}
                aria-pressed={on}
                className={cn(
                  'flex h-8 items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors',
                  on
                    ? 'border-[color:var(--o-text)] bg-[var(--o-text)] text-[var(--o-ink)]'
                    : 'border-[color:var(--o-line-2)] text-[var(--o-soft)] hover:border-[color:var(--o-soft)]'
                )}
              >
                <span
                  aria-hidden
                  className="h-3 w-3 rounded-full"
                  style={{
                    background: `linear-gradient(135deg, ${THEMES[s.id].gold} 0 50%, ${THEMES[s.id].ice} 50%)`,
                  }}
                />
                {s.name}
              </Link>
            );
          })}
          {shown.length < SETS.length && (
            <Link
              href="/consciousness/figures"
              scroll={false}
              className="ml-1 text-[13px] text-[var(--o-mute)] underline-offset-4 hover:underline"
            >
              Show all
            </Link>
          )}
        </nav>
      </header>

      <div className="o-scroll-x overflow-x-auto px-5 pb-4 tablet:px-10 content-lg:px-16">
        <div className="grid gap-3" style={columns}>
          {shown.map((s) => (
            <section
              key={s.id}
              style={themeVars(s.id)}
              className="o-set flex flex-col rounded-[10px] border border-[color:var(--o-line-2)] bg-[var(--o-ink)] p-5 text-[var(--o-text)]"
            >
              <h2 className="o-serif text-[28px] leading-none">
                {s.name}
                <span
                  aria-hidden
                  className="ml-2 inline-block h-3 w-3 rounded-full align-middle"
                  style={{
                    background: 'linear-gradient(135deg, var(--o-gold) 0 50%, var(--o-ice) 50%)',
                  }}
                />
              </h2>
              <p className="mt-2 text-[15px] leading-snug text-[var(--o-text)]">{s.phrase}</p>
              <p className="mt-3 text-[12.5px] font-medium text-[var(--o-gold)]">{s.library}</p>
              <p className="mt-2 text-[13px] leading-[1.6] text-[var(--o-soft)]">{s.note}</p>
              <Link
                href={s.id === DEFAULT_SET ? '/consciousness' : `/consciousness?set=${s.id}`}
                className="mt-auto inline-flex items-center gap-1 pt-4 text-[13px] font-semibold text-[var(--o-text)] underline-offset-4 hover:underline"
              >
                Page in {s.name} <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </section>
          ))}

          {ROWS.map((row) => (
            <Fragment key={row.fig}>
              <h2 className="sticky left-0 mt-9 w-max text-[15px]" style={{ gridColumn: '1 / -1' }}>
                <span className="font-semibold text-[var(--o-gold)]">{row.label}</span>{' '}
                <span className="text-[var(--o-soft)]">{row.title}</span>
              </h2>
              {shown.map((s) => (
                <div
                  key={s.id}
                  style={themeVars(s.id)}
                  data-cell={`${s.id}-${row.fig}`}
                  className={cn(
                    'o-set relative overflow-hidden rounded-[8px] bg-[var(--o-ink)]',
                    row.fig === 'hero' ? 'aspect-[16/10]' : 'aspect-[4/3]'
                  )}
                >
                  <FigureArt set={s.id} fig={row.fig} />
                  <span className="absolute bottom-2 left-2 rounded-full bg-[rgb(var(--o-ink-rgb)/0.7)] px-2 py-0.5 text-[11px] text-[var(--o-soft)] backdrop-blur">
                    {s.name}
                  </span>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
