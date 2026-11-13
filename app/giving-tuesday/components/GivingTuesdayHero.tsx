import Link from 'next/link';
import { ArrowDown, Landmark, Sparkles } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/styles';
import { TOPICS } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_BUTTON, BLUE_TEXT } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';
import { FadedPixels } from '@/app/giving-tuesday/components/FadedPixels';

const PERKS = [
  { label: 'Matched 1:1 before 2027', Icon: Sparkles },
  { label: 'Tax-deductible', Icon: Landmark },
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
    <section className="relative overflow-hidden bg-white">
      <FadedPixels side="right" fade="bottom" />
      <div
        className="pointer-events-none absolute -right-44 -top-40 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle,rgba(57,113,255,0.18),transparent_70%)] blur-[40px]"
        aria-hidden
      />
      <header className="relative mx-auto flex max-w-[1240px] items-center justify-between px-6 py-6">
        <Link href="/" aria-label="ResearchHub home">
          <Logo size={28} loading="eager" />
        </Link>
        <nav className="flex items-center gap-7 text-sm font-medium text-[#4b5563]">
          <a href="#match" className="hidden hover:text-[#0b1530] sm:inline">
            The match
          </a>
          <a href="#fields" className="hover:text-[#0b1530]">
            Fields
          </a>
          <a href="#how" className="hidden hover:text-[#0b1530] sm:inline">
            How it works
          </a>
        </nav>
      </header>

      <div className="relative mx-auto grid max-w-[1240px] items-center gap-12 px-6 pb-20 pt-8 lg:grid-cols-[1.05fr_1fr] lg:pb-0 lg:pt-0">
        <div className="lg:py-28">
          <h1
            className="text-[52px] font-bold leading-[0.98] tracking-[-0.035em] text-[#0b1530] md:text-[80px]"
            style={DISPLAY_FONT}
          >
            Give to science. <span className={cn('block pb-2', BLUE_TEXT)}>We’ll match it.</span>
          </h1>
          <p className="mt-6 max-w-[520px] text-lg font-medium leading-relaxed text-[#1f2937]">
            Every gift made before 2027 is matched dollar for dollar. Pick the science you care
            about, and we’ll take it from there.
          </p>
          <a href="#fields" className={cn(BLUE_BUTTON, 'mt-9')}>
            Choose a field <ArrowDown className="h-5 w-5" />
          </a>
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
            {PERKS.map(({ label, Icon }) => (
              <li key={label} className="flex items-center gap-2 text-sm text-[#4b5563]">
                <Icon className="h-4 w-4 text-[#3971ff]" />
                {label}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="relative grid h-[420px] grid-cols-3 gap-3 overflow-hidden px-px lg:h-[720px] lg:gap-4 [mask-image:linear-gradient(to_bottom,transparent,#000_14%,#000_86%,transparent)]"
          aria-hidden
        >
          {WALL_COLUMNS.map((column) => (
            <div
              key={column.topics[0].id}
              className={cn('animate-feed-scroll motion-reduce:animate-none', column.className)}
            >
              {[...column.topics, ...column.topics].map((item, index) => (
                <div key={`${item.id}-${index}`} className="pb-3 lg:pb-4">
                  <div className="group relative aspect-[3/4] overflow-hidden rounded-2xl shadow-[0_18px_40px_-20px_rgba(13,30,80,0.35)] ring-1 ring-black/5 transition hover:ring-[#3971ff]/40">
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
