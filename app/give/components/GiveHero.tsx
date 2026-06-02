'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/icons/Icon';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import AnimatedGlobe from '@/components/Globe/AnimatedGlobe';
import { Starfield } from './Starfield';

export function GiveHero() {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  // The AnimatedGlobe canvas is sized in px, so we measure its column and clamp
  // to keep it crisp on desktop while never overflowing on small screens.
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const [globeSize, setGlobeSize] = useState(460);

  useEffect(() => {
    const el = globeWrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setGlobeSize(Math.round(Math.max(260, Math.min(480, w))));
    };
    measure();
    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measure);
    };
  }, []);

  const handleGive = () => {
    executeAuthenticatedAction(() => {
      router.push('/fund');
    });
  };

  const handleSeeHowItWorks = () => {
    const target = document.getElementById('give-ways');
    if (!target) return;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <section className="give-hero">
      <Starfield />
      <div className="give-hero-blob" aria-hidden="true" />
      <Link
        href="/"
        aria-label="ResearchHub home"
        style={{
          position: 'absolute',
          top: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 3,
          display: 'inline-flex',
          alignItems: 'center',
          padding: '6px 10px',
          borderRadius: 10,
        }}
        className="give-hero-logo"
      >
        <Logo size={32} variant="white" />
      </Link>
      <div className="give-hero-inner">
        <div>
          <div className="give-hero-eyebrow">
            <Icon name="fund" size={20} />
            Funding on ResearchHub
          </div>
          <h1 className="give-hero-h1">
            <span className="give-h1-line">Highest impact</span>
            <span className="give-h1-accent">scientific funding.</span>
          </h1>
          <p className="give-hero-lead">
            Fund peer-reviewed research from top scientists around the world.
          </p>
          <div className="give-hero-assurances">
            <span className="give-hero-assurance">
              <Check className="w-[18px] h-[18px] text-[#34d399]" strokeWidth={2.5} aria-hidden />
              Tax deductible
            </span>
            <span className="give-hero-assurance">
              <Check className="w-[18px] h-[18px] text-[#34d399]" strokeWidth={2.5} aria-hidden />
              DAF eligible
            </span>
          </div>
          <div className="give-hero-ctas">
            <Button
              size="lg"
              onClick={handleGive}
              className="!rounded-[14px] !h-[54px] !px-7 !text-base !font-semibold
                bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] hover:from-[#2C5EE8] hover:to-[#3971FF]
                text-white shadow-[0_8px_20px_-8px_rgba(57,113,255,0.55)]
                hover:shadow-[0_12px_24px_-8px_rgba(57,113,255,0.7)]"
            >
              Open a funding opportunity
            </Button>
            <Button
              variant="outlined"
              size="lg"
              onClick={handleSeeHowItWorks}
              className="!rounded-[14px] !h-[54px] !px-7 !text-base !font-semibold
                !bg-white/5 !border-white/30 !text-white hover:!bg-white/15 hover:!border-white/50"
            >
              See how it works
            </Button>
          </div>
        </div>

        <div className="give-hero-globe" ref={globeWrapRef}>
          <AnimatedGlobe size={globeSize} theme="dark" className="give-hero-globe-canvas" />
        </div>
      </div>

      <style jsx>{`
        .give-hero {
          position: relative;
          padding: 160px 28px 120px;
          overflow: hidden;
          /* Deep-space cosmos: an indigo nebula glow near the globe falling off
             into near-black, so the starfield and the glowing globe read. */
          background:
            radial-gradient(circle at 72% 40%, rgba(67, 56, 202, 0.42), transparent 55%),
            radial-gradient(circle at 28% 82%, rgba(49, 46, 129, 0.3), transparent 60%),
            linear-gradient(168deg, #0b1238 0%, #101a45 55%, #1a235e 100%);
          color: #e2e8f0;
          min-height: min(calc(100vh - 60px), 905px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .give-hero-logo {
          transition: background-color 0.15s ease;
        }
        .give-hero-logo:hover {
          background: rgba(255, 255, 255, 0.08);
        }
        .give-hero-logo:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 2px;
        }
        .give-hero-inner {
          width: 100%;
          max-width: 1320px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1fr 1.05fr;
          gap: 64px;
          align-items: center;
        }
        .give-hero-globe {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }
        .give-hero-globe :global(.give-hero-globe-canvas) {
          max-width: 100%;
        }
        .give-hero-blob {
          position: absolute;
          width: 620px;
          height: 620px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(57, 113, 255, 0.18), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          top: -160px;
          right: -180px;
        }
        .give-hero-h1 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 72px;
          line-height: 1.04;
          letter-spacing: -0.03em;
          margin: 0 0 32px;
          color: #f8fafc;
        }
        .give-h1-line {
          display: block;
          color: #f8fafc;
        }
        .give-h1-accent {
          display: block;
          color: #93c5fd;
        }
        .give-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #c7d2fe;
          margin-bottom: 32px;
        }
        .give-hero-lead {
          font-size: 20px;
          line-height: 1.55;
          color: #cbd5e1;
          max-width: 560px;
          margin: 0 0 28px;
          font-weight: 500;
        }
        .give-hero-assurances {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
          margin: 0 0 28px;
        }
        .give-hero-assurance {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 16px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .give-hero-ctas {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        @media (max-width: 1280px) {
          .give-hero {
            padding: 120px 28px 100px;
            min-height: min(calc(100vh - 60px), 777px);
          }
          .give-hero-inner {
            gap: 48px;
          }
          .give-hero-h1 {
            font-size: 72px;
          }
          .give-hero-lead {
            margin: 0 0 24px;
          }
        }
        @media (max-width: 1100px) {
          .give-hero {
            min-height: auto;
            padding: 104px 28px 80px;
          }
          .give-hero-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .give-hero-globe {
            order: -1;
            max-width: 420px;
            margin: 0 auto;
          }
          .give-hero-h1 {
            font-size: 56px;
          }
          .give-hero-lead {
            margin: 0 0 32px;
          }
        }
        @media (max-width: 768px) {
          .give-hero-eyebrow {
            display: none;
          }
        }
        @media (max-width: 640px) {
          .give-hero {
            padding: 100px 20px 64px;
          }
          .give-hero-h1 {
            font-size: 40px;
            margin: 0 0 20px;
          }
          .give-hero-lead {
            font-size: 17px;
            margin: 0 0 28px;
          }
          .give-hero-ctas {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }
          .give-hero-ctas :global(button) {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
