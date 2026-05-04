import { ArrowRight } from 'lucide-react';
import { AboutContainer } from './AboutContainer';
import { Eyebrow } from './Eyebrow';
import { MonoLabel } from './MonoLabel';

const stats = [
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

export const Hero = () => {
  return (
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

      <AboutContainer className="relative pt-12 sm:pt-16 md:pt-24 lg:pt-28 pb-12 sm:pb-16 md:pb-20 lg:pb-24">
        <div className="flex items-center gap-2 mb-6 sm:mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/30 bg-white/10 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse-dot" />
            <MonoLabel className="text-[11px] uppercase tracking-[0.16em]">
              About ResearchHub
            </MonoLabel>
          </span>
        </div>

        <h1
          className="font-normal tracking-[-0.025em] leading-[1.05] md:leading-[0.98]"
          style={{
            fontSize: 'clamp(34px, 8vw, 104px)',
            textWrap: 'balance',
          }}
        >
          You&apos;ve discovered <br className="hidden sm:inline" />
          the <span className="italic font-light">future</span> of science.
        </h1>

        <div className="mt-8 md:mt-10 grid md:grid-cols-12 gap-6 md:gap-8 items-end">
          <p className="md:col-span-7 text-base sm:text-[17px] md:text-[20px] leading-[1.55] text-white/95 max-w-2xl">
            ResearchHub is an online platform designed to enhance the speed and transparency of
            science — built on a simple premise: that science provides the most benefit when
            it&apos;s done quickly, openly, and with a high level of rigor and reproducibility.
          </p>
          <div className="md:col-span-5 md:pl-8 pt-6 md:pt-0 border-t border-white/25 md:border-t-0 md:border-l">
            <Eyebrow tone="onDark" className="mb-3">
              Jump to
            </Eyebrow>
            <ul className="space-y-2 text-[15px]">
              {jumpLinks.map(({ label, href }) => (
                <li key={href}>
                  <a
                    href={href}
                    className="group flex items-center justify-between py-1 border-b border-white/25 text-white hover:text-white transition-colors"
                  >
                    <span>{label}</span>
                    <ArrowRight
                      className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition"
                      aria-hidden
                    />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 sm:mt-14 md:mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-10 pt-8 sm:pt-10 border-t border-white/25">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div
                className="leading-none tracking-[-0.02em] font-medium"
                style={{ fontSize: 'clamp(22px, 5vw, 44px)' }}
              >
                {stat.value}
              </div>
              <MonoLabel className="mt-2 block text-[10px] sm:text-[11px] uppercase tracking-[0.14em] text-white/85">
                {stat.label}
              </MonoLabel>
            </div>
          ))}
        </div>
      </AboutContainer>
    </section>
  );
};
