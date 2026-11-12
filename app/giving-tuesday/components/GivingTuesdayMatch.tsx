import { cn } from '@/utils/styles';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';

export function GivingTuesdayMatch() {
  return (
    <section id="match" className="scroll-mt-4 px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1100px] text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#7fb0ff]">The match</p>
        <h2
          className="mt-4 text-[40px] font-bold leading-[1.05] tracking-[-0.03em] text-white md:text-[60px]"
          style={DISPLAY_FONT}
        >
          Your gift, <span className={BLUE_TEXT}>doubled.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-[560px] text-lg text-[#98a4ba]">
          ResearchHub matches every dollar given before 2027, and the match goes to the same field
          you choose.
        </p>
        <div className="mt-14 flex flex-col items-stretch gap-4 md:flex-row md:items-center">
          <EquationCard amount="$100,000" label="Your gift" />
          <Operator symbol="+" />
          <EquationCard amount="$100,000" label="Our match" isMatch />
          <Operator symbol="=" />
          <div className="relative flex-[1.3] overflow-hidden rounded-3xl bg-gradient-to-br from-[#4a7fff] to-[#1d4ed8] p-8 text-left shadow-[0_30px_80px_-20px_rgba(57,113,255,0.7)]">
            <TopicArt
              topicId="ai"
              className="absolute inset-0 h-full w-full opacity-40 mix-blend-screen"
            />
            <p className="relative text-sm font-semibold text-white/80">
              For the science you choose
            </p>
            <p
              className="relative mt-2 text-[44px] font-bold leading-none tracking-[-0.03em] text-white md:text-[56px]"
              style={DISPLAY_FONT}
            >
              $200,000
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function EquationCard({
  amount,
  label,
  isMatch = false,
}: Readonly<{ amount: string; label: string; isMatch?: boolean }>) {
  return (
    <div
      className={cn(
        'flex-1 rounded-3xl border p-8 text-left',
        isMatch
          ? 'border-emerald-400/40 bg-emerald-400/[0.08] shadow-[0_0_60px_-20px_rgba(52,211,153,0.6)]'
          : 'border-white/10 bg-white/[0.03]'
      )}
    >
      <p className={cn('text-sm font-semibold', isMatch ? 'text-emerald-300' : 'text-[#98a4ba]')}>
        {label}
      </p>
      <p
        className="mt-2 text-[36px] font-bold leading-none tracking-[-0.03em] text-white md:text-[40px]"
        style={DISPLAY_FONT}
      >
        {amount}
      </p>
    </div>
  );
}

function Operator({ symbol }: Readonly<{ symbol: string }>) {
  return <span className="text-center text-4xl font-bold text-[#6b7690]">{symbol}</span>;
}
