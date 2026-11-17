import Link from 'next/link';
import { cn } from '@/utils/styles';
import { DEFAULT_SET, THEMES, type SetId } from '../theme';
import { SETS } from '../sets/registry';
import { DEFAULT_HERO, HERO_IDS, HERO_INFO, type HeroId } from '../sets/heroes';

/**
 * A small fixed control for comparing the graphic sets: each option is a
 * link to `?set=…`, so the server renders the whole page, palette included,
 * in that set. Names show from tablet up; phones get the swatches. In the
 * Poster set a second row picks the hero candidate (`?hero=`). Hidden from
 * visitors: the page shows it only with `?design=1`, which its links keep.
 */
export function SetSwitcher({
  current,
  hero = DEFAULT_HERO,
  base = '/consciousness',
}: {
  current: SetId;
  hero?: HeroId;
  base?: string;
}) {
  return (
    <div className="fixed right-3 top-16 z-50 flex flex-col items-end gap-1.5 tablet:right-5 tablet:top-20">
      <nav
        aria-label="Graphic set"
        className="flex items-center gap-0.5 rounded-full border border-[color:var(--o-line-2)] bg-[rgb(var(--o-ink2-rgb)/0.86)] p-1 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.5)] backdrop-blur-xl"
      >
        <span className="hidden px-2.5 text-[12px] text-[var(--o-mute)] content-md:inline">
          Graphics
        </span>
        {SETS.map((s) => {
          const t = THEMES[s.id];
          const active = s.id === current;
          return (
            <Link
              key={s.id}
              href={s.id === DEFAULT_SET ? `${base}?design=1` : `${base}?design=1&set=${s.id}`}
              scroll={false}
              aria-current={active ? 'true' : undefined}
              title={s.phrase}
              className={cn(
                'flex h-8 items-center gap-1.5 rounded-full px-2 text-[12.5px] font-medium transition-colors tablet:px-2.5',
                active
                  ? 'bg-[var(--o-text)] text-[var(--o-ink)]'
                  : 'text-[var(--o-soft)] hover:bg-[rgb(var(--o-text-rgb)/0.08)]'
              )}
            >
              <span
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-[rgb(var(--o-text-rgb)/0.25)]"
                style={{
                  background: `linear-gradient(135deg, ${t.gold} 0 50%, ${t.ice} 50% 100%)`,
                  boxShadow: `inset 0 0 0 2px ${t.ink}`,
                }}
              />
              <span className="hidden tablet:inline">{s.name}</span>
              <span className="sr-only tablet:hidden">{s.name}</span>
            </Link>
          );
        })}
      </nav>
      {current === DEFAULT_SET && (
        <nav
          aria-label="Hero candidate"
          className="flex max-w-[calc(100vw-32px)] flex-wrap items-center justify-end gap-0 rounded-[18px] border border-[color:var(--o-line-2)] bg-[rgb(var(--o-ink2-rgb)/0.86)] p-1 backdrop-blur-xl tablet:max-w-none tablet:flex-nowrap tablet:gap-0.5 tablet:rounded-full"
        >
          <span className="hidden px-2 text-[12px] text-[var(--o-mute)] tablet:inline">Hero</span>
          {HERO_IDS.map((id) => (
            <Link
              key={id}
              href={id === DEFAULT_HERO ? `${base}?design=1` : `${base}?design=1&hero=${id}`}
              scroll={false}
              aria-current={id === hero ? 'true' : undefined}
              title={HERO_INFO[id].idea}
              className={cn(
                'flex h-7 items-center rounded-full px-[7px] text-[12px] font-medium transition-colors tablet:px-2.5',
                id === hero
                  ? 'bg-[var(--o-text)] text-[var(--o-ink)]'
                  : 'text-[var(--o-soft)] hover:bg-[rgb(var(--o-text-rgb)/0.08)]'
              )}
            >
              {id === 'beads' ? 'Before' : id.toUpperCase()}
            </Link>
          ))}
        </nav>
      )}
    </div>
  );
}
