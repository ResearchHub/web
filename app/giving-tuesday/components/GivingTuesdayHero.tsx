import { ArrowDown, CalendarCheck, Landmark, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/styles';
import { TOPICS } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_BUTTON, BLUE_TEXT } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';

const PERKS = [
  { label: 'Matched 1:1 before 2027', Icon: Sparkles },
  { label: 'Tax-deductible via Endaoment', Icon: Landmark },
  { label: 'Set up on a 15-minute call', Icon: CalendarCheck },
];

/**
 * Each column is its cards twice over, scrolled by half its height so the loop is seamless.
 * The outer columns roll down and the middle one rolls up, like a wheel.
 */
const WALL_COLUMNS = [
  {
    topics: TOPICS.slice(0, 4),
    className: '[animation-direction:reverse] [animation-duration:64s]',
  },
  { topics: TOPICS.slice(4, 8), className: '[animation-duration:72s]' },
  {
    topics: [...TOPICS.slice(8), TOPICS[1]],
    className: '[animation-direction:reverse] [animation-duration:68s]',
  },
];

export function GivingTuesdayHero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(900px 620px at 80% 10%, rgba(57,113,255,0.28), transparent 65%)',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_70%_70%_at_30%_40%,#000_10%,transparent_75%)]" />

      <header className="relative mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6">
        <Logo size={28} variant="white" loading="eager" />
        <nav className="flex items-center gap-7 text-sm font-medium text-white/70">
          <a href="#match" className="hidden hover:text-white sm:inline">
            The match
          </a>
          <a href="#fields" className="hover:text-white">
            Fields
          </a>
          <a href="#how" className="hidden hover:text-white sm:inline">
            How it works
          </a>
        </nav>
      </header>

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.05fr_1fr] lg:pb-0 lg:pt-0">
        <div className="lg:py-28">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-[13px] font-medium text-white/80 backdrop-blur">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Giving Tuesday ·
            December 1
          </span>
          <h1
            className="mt-7 text-[52px] font-bold leading-[0.98] tracking-[-0.035em] text-white md:text-[80px]"
            style={DISPLAY_FONT}
          >
            Give to science.{' '}
            <span
              className={cn('block pb-2 drop-shadow-[0_0_40px_rgba(57,113,255,0.45)]', BLUE_TEXT)}
            >
              We’ll match it.
            </span>
          </h1>
          <p className="mt-6 max-w-[520px] text-lg leading-relaxed text-[#98a4ba]">
            Every gift made before 2027 is matched dollar for dollar. Pick the science you care
            about, and our team sets up your gift on a short call.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <a href="#fields" className={BLUE_BUTTON}>
              Choose a field <ArrowDown className="h-5 w-5" />
            </a>
            <a href="#match" className="text-[15px] font-semibold text-white/80 hover:text-white">
              How the match works →
            </a>
          </div>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {PERKS.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-white/70">
                <Icon className="h-4 w-4 text-[#7fb0ff]" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative grid h-[420px] grid-cols-3 gap-3 overflow-hidden lg:h-[720px] lg:gap-4 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]"
          aria-hidden
        >
          {WALL_COLUMNS.map((column) => (
            <div
              key={column.topics[0].id}
              className={cn('animate-feed-scroll motion-reduce:animate-none', column.className)}
            >
              {[...column.topics, ...column.topics].map((item, index) => (
                <div key={`${item.id}-${index}`} className="pb-3 lg:pb-4">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl ring-1 ring-white/10">
                    <TopicArt topicId={item.id} className="h-full w-full" />
                    <span className="absolute bottom-3 left-3 right-3 w-fit rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
                      {item.label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
