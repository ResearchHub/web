import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving-tuesday/lib/topics';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_BUTTON, BLUE_TEXT } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';

const CLOSING_TILES: { id: Topic['id']; className: string }[] = [
  { id: 'neuroscience', className: 'left-[-40px] top-[-30px] -rotate-12' },
  { id: 'genetics', className: 'bottom-[-50px] left-[8%] rotate-6' },
  { id: 'physics', className: 'right-[-30px] top-[-20px] rotate-12' },
  { id: 'cancer', className: 'bottom-[-60px] right-[10%] -rotate-6' },
];

export function GivingTuesdayClosing() {
  return (
    <section className="px-6 pb-24">
      <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[36px] border border-white/10 bg-gradient-to-b from-[#0b1230]/70 to-[#070a18]/40 px-8 py-20 text-center md:py-28">
        {CLOSING_TILES.map((tile) => (
          <div
            key={tile.id}
            className={cn(
              'absolute hidden h-[180px] w-[240px] overflow-hidden rounded-3xl opacity-80 ring-1 ring-white/10 md:block',
              tile.className
            )}
            aria-hidden
          >
            <TopicArt topicId={tile.id} className="h-full w-full" />
          </div>
        ))}
        <div className="relative">
          <h2
            className="mx-auto max-w-[680px] text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[60px]"
            style={DISPLAY_FONT}
          >
            Science moves when <span className={BLUE_TEXT}>someone funds it.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-[460px] text-lg text-[#98a4ba]">
            Every gift before 2027 is matched 1:1.
          </p>
          <a href="#fields" className={cn(BLUE_BUTTON, 'mt-9')}>
            Choose a field
            <ArrowUpRight className="h-5 w-5" />
          </a>
        </div>
      </div>
    </section>
  );
}
