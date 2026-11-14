import { cn } from '@/utils/styles';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT, PALE_BAND } from '@/app/giving-tuesday/components/accents';
import { FadedPixels } from '@/app/giving-tuesday/components/FadedPixels';
import { DollarSplit } from '@/app/giving-tuesday/components/DollarSplit';

export function GivingTuesdayMatch() {
  return (
    <section
      id="match"
      className={cn('relative scroll-mt-4 overflow-hidden px-6 py-24 md:py-28', PALE_BAND)}
    >
      <FadedPixels side="bottom-left" />
      <FadedPixels side="bottom-right" />
      <div className="relative mx-auto max-w-[1100px] text-center">
        <h2
          className="text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-[#0b1530] md:text-[60px]"
          style={DISPLAY_FONT}
        >
          Your gift, <span className={BLUE_TEXT}>doubled.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-lg text-[#1f2937]">
          Every dollar you give before 2027 is matched, and the match goes to the same research you
          choose.
        </p>

        <DollarSplit />
      </div>
    </section>
  );
}
