import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { MonoLabel } from './MonoLabel';
import { JumpLinks } from './JumpLinks';

const heroStats = [
  { value: '$1.5M+', label: 'Research funding distributed' },
  { value: '100k+', label: 'Researchers & readers' },
  { value: '<10d', label: 'Avg. peer review turnaround' },
  { value: '0–10%', label: 'University indirects' },
];

const jumpLinks = [
  { label: 'The problem', href: '#problem' },
  { label: 'Funding Marketplace', href: '#funding' },
  { label: 'ResearchCoin', href: '#rsc' },
  { label: 'Team', href: '#team' },
];

export const Hero = () => (
  <section className="relative overflow-hidden bg-primary-500 text-white">
    <div
      aria-hidden
      className="absolute inset-0 opacity-[0.08]"
      style={{
        backgroundImage:
          'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
        WebkitMaskImage: 'radial-gradient(ellipse at top, black 30%, transparent 70%)',
      }}
    />

    <AboutContainer className="relative pt-10 sm:pt-16 lg:pt-28 pb-10 sm:pb-16 md:pb-20 lg:pb-24">
      <span className="inline-flex items-center gap-2 px-3 py-1.5 mb-6 sm:mb-8 md:mb-10 rounded-full border border-white/30 bg-white/10 backdrop-blur">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
        <MonoLabel className="text-[11px] uppercase tracking-[0.16em]">About ResearchHub</MonoLabel>
      </span>

      <div className="grid lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <h1
            className="font-normal tracking-[-0.025em] leading-[1.05] md:leading-[0.98] text-[clamp(34px,8vw,104px)]"
            style={{ textWrap: 'balance' }}
          >
            Science <br className="hidden lg:block" />
            <span className="italic font-light">Reimagined</span>
          </h1>
          <p className="mt-4 md:mt-6 text-base sm:text-[17px] md:text-[20px] leading-[1.6] text-white/95 max-w-2xl">
            ResearchHub is an online platform designed to accelerate science. It&apos;s built on a
            simple premise: that science works best when it&apos;s done openly and rigorously.
          </p>
        </div>
        <div className="lg:col-span-5 pt-5 lg:pt-0 lg:flex lg:flex-col lg:justify-end">
          <div className="lg:border-l border-white/25 lg:pl-8">
            <Eyebrow tone="onDark" className="mb-3">
              Jump to
            </Eyebrow>
            <JumpLinks links={jumpLinks} />
          </div>
        </div>
      </div>

      <div className="mt-10 sm:mt-12 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-6 sm:gap-6 md:gap-8 md:pt-10 md:border-t border-white/25">
        {heroStats.map((stat) => (
          <div key={stat.label}>
            <div className="leading-none tracking-[-0.02em] font-medium text-[clamp(22px,5vw,44px)]">
              {stat.value}
            </div>
            <MonoLabel className="mt-2 block text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-white/85">
              {stat.label}
            </MonoLabel>
          </div>
        ))}
      </div>
    </AboutContainer>
  </section>
);
