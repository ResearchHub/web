import { cn } from '@/utils/styles';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT, PALE_BAND } from '@/app/giving-tuesday/components/accents';
import { FadedPixels } from '@/app/giving-tuesday/components/FadedPixels';

const STEPS = [
  { title: 'Pick a field', body: 'Choose the area of science you care about most.' },
  { title: 'Book a call with us', body: 'We’ll set up your gift together.' },
  { title: 'Give by wire or DAF', body: 'Your gift is matched 1:1.' },
];

export function GivingTuesdaySteps() {
  return (
    <section
      id="how"
      className={cn('relative scroll-mt-4 overflow-hidden px-6 py-24 md:py-32', PALE_BAND)}
    >
      <FadedPixels side="bottom-left" />
      <FadedPixels side="bottom-right" />
      <div className="relative mx-auto max-w-[1240px]">
        <h2
          className="text-center text-[36px] font-bold tracking-[-0.03em] text-[#0b1530] md:text-[52px]"
          style={DISPLAY_FONT}
        >
          Three steps. <span className={BLUE_TEXT}>About fifteen minutes.</span>
        </h2>
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-3xl border border-[#bfdbfe] bg-white p-8 shadow-[0_16px_36px_-20px_rgba(13,30,80,0.18)] transition hover:-translate-y-1 hover:border-[#93c5fd] hover:shadow-[0_26px_50px_-22px_rgba(57,113,255,0.25)]"
            >
              <span
                className={cn('text-[64px] font-bold leading-none', BLUE_TEXT)}
                style={DISPLAY_FONT}
              >
                {index + 1}
              </span>
              <p className="mt-6 text-xl font-bold text-[#0b1530]">{step.title}</p>
              <p className="mt-2 text-[#4b5563]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
