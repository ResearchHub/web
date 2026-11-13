import type { ReactNode } from 'react';
import { User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/utils/styles';
import { DISPLAY_FONT } from '@/app/giving-tuesday/components/displayFont';
import { BLUE_TEXT, PALE_BAND } from '@/app/giving-tuesday/components/accents';
import { TopicArt } from '@/app/giving-tuesday/components/TopicArt';
import { FadedPixels } from '@/app/giving-tuesday/components/FadedPixels';

export function GivingTuesdayMatch() {
  return (
    <section
      id="match"
      className={cn('relative scroll-mt-4 overflow-hidden px-6 py-24 md:py-32', PALE_BAND)}
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
          ResearchHub matches every dollar given before 2027, and the match goes to the same field
          you choose.
        </p>
        <div className="mt-14 flex flex-col items-stretch gap-4 md:flex-row">
          <EquationCard
            amount="$100,000"
            label="Your gift"
            badge={<User className="h-5 w-5 text-[#3971ff]" />}
          />
          <Operator symbol="+" />
          <EquationCard
            amount="$100,000"
            label="Our match"
            badge={<Logo noText size={24} />}
            isMatch
          />
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
  badge,
  isMatch = false,
}: Readonly<{ amount: string; label: string; badge: ReactNode; isMatch?: boolean }>) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col justify-center rounded-3xl border bg-white px-8 py-6 text-left shadow-[0_16px_36px_-20px_rgba(13,30,80,0.18)]',
        isMatch ? 'border-emerald-300' : 'border-[#bfdbfe]'
      )}
    >
      <p
        className={cn(
          'flex items-center gap-3 text-[15px] font-semibold',
          isMatch ? 'text-emerald-700' : 'text-[#4b5563]'
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full',
            isMatch ? 'bg-emerald-50' : 'bg-[#eff4ff]'
          )}
        >
          {badge}
        </span>
        {label}
      </p>
      <p
        className="mt-3 text-[36px] font-bold leading-none tracking-[-0.03em] text-[#0b1530] md:text-[40px]"
        style={DISPLAY_FONT}
      >
        {amount}
      </p>
    </div>
  );
}

function Operator({ symbol }: Readonly<{ symbol: string }>) {
  return (
    <span className="self-center text-center text-4xl font-bold text-[#3971ff]/60">{symbol}</span>
  );
}
