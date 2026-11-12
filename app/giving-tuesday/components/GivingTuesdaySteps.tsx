import { cn } from '@/utils/styles';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT } from '@/app/giving-tuesday/components/accents';

const STEPS = [
  { title: 'Pick a field', body: 'Choose the area of science you care about most.' },
  {
    title: 'Book a call with Tyler',
    body: 'Fifteen minutes to answer questions and set up your gift.',
  },
  {
    title: 'Give by wire or DAF',
    body: 'Details are shared on the call, and your gift is matched 1:1.',
  },
];

export function GivingTuesdaySteps() {
  return (
    <section id="how" className="scroll-mt-4 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1240px]">
        <h2
          className="text-center text-[36px] font-bold tracking-[-0.03em] text-white md:text-[52px]"
          style={DISPLAY_FONT}
        >
          Three steps. <span className="text-[#6b7690]">About fifteen minutes.</span>
        </h2>
        <ol className="mt-14 grid gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 transition hover:border-[#3971ff]/60 hover:bg-white/[0.05]"
            >
              <span
                className={cn('text-[64px] font-bold leading-none', BLUE_TEXT)}
                style={DISPLAY_FONT}
              >
                {index + 1}
              </span>
              <p className="mt-6 text-xl font-bold text-white">{step.title}</p>
              <p className="mt-2 text-[#98a4ba]">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
