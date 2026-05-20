'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sprout } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { EndowmentTree } from './EndowmentTree';
import { EndowmentGround } from './EndowmentGround';
import { PixelBackdrop } from './PixelBackdrop';

export function EndowmentHero() {
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleStartEarning = () => {
    executeAuthenticatedAction(() => {
      router.push('/researchcoin');
    });
  };

  const handleWatchHowItWorks = () => {
    const target = document.getElementById('endowment-video');
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
    <section className="endowment-hero">
      <PixelBackdrop />
      <div className="endowment-hero-blob" aria-hidden="true" />
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
        className="endowment-hero-logo"
      >
        <Logo size={32} />
      </Link>
      <div className="endowment-hero-inner">
        <div>
          <div className="endowment-hero-eyebrow">
            <Sprout className="w-[18px] h-[18px] text-[#16a34a]" strokeWidth={2} aria-hidden />
            ResearchHub Endowment
          </div>
          <h1 className="endowment-hero-h1">
            <span className="endowment-h1-main">
              Perpetual yield for <span className="endowment-h1-accent">funding science.</span>
            </span>
          </h1>
          <p className="endowment-hero-lead">
            Earn Funding Credits on your deposits to be used for funding proposals.
          </p>
          <div className="endowment-hero-ctas">
            <Button
              size="lg"
              onClick={handleStartEarning}
              className="!rounded-[14px] !h-[54px] !px-7 !text-base !font-semibold
                bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] hover:from-[#2C5EE8] hover:to-[#3971FF]
                text-white shadow-[0_8px_20px_-8px_rgba(57,113,255,0.55)]
                hover:shadow-[0_12px_24px_-8px_rgba(57,113,255,0.7)]"
            >
              Start earning
            </Button>
            <Button
              variant="outlined"
              size="lg"
              onClick={handleWatchHowItWorks}
              className="!rounded-[14px] !h-[54px] !px-7 !text-base !font-semibold"
            >
              Watch how it works
            </Button>
          </div>
        </div>

        <EndowmentTree hideGround />
      </div>

      <EndowmentGround />

      <style jsx>{`
        .endowment-hero {
          position: relative;
          padding: 160px 28px 160px;
          overflow: hidden;
          background: #fff;
          /* Stretch the hero so it nearly fills the viewport on a fresh load.
             The next section ("Earn daily yield...") should only just peek above
             the fold to invite scrolling. The 60px subtraction matches the
             height the section had before adding the fixed topbar - the
             tree's negative margins are tuned for this exact height.
             We also cap the min-height so very tall viewports (e.g.
             zoomed-out, 4K, ultrawide) don't make the section grow past
             what the tree margins are calibrated for - otherwise the tree
             floats off the soil. 905px is what (100vh - 60px) resolves to
             on a 1728x1080 laptop, which the tree margins were tuned for
             (verified via runtime measurement). */
          min-height: min(calc(100vh - 60px), 905px);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        /* Logo positioning + base layout is set via inline style on the Link itself
           because styled-jsx's selector wasn't applying to the Next <Link>. These
           hover/focus rules still work because the className IS forwarded. */
        .endowment-hero-logo {
          transition: background-color 0.15s ease;
        }
        .endowment-hero-logo:hover {
          background: rgba(15, 23, 42, 0.04);
        }
        .endowment-hero-logo:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .endowment-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          pointer-events: none;
          background-image:
            radial-gradient(ellipse 50% 40% at 18% 12%, rgba(255, 255, 255, 0.55), transparent 70%),
            radial-gradient(ellipse 50% 40% at 90% 88%, rgba(255, 255, 255, 0.45), transparent 70%);
          z-index: 1;
        }
        .endowment-hero-inner {
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
        .endowment-hero-inner > :global(.endowment-tree-wrap) {
          align-self: end;
          /* The tree wrap's bottom edge now coincides with the trunk bottom (the
             SVG was cropped to remove empty space below the trunk). In the
             two-column layout the tree sits on the right side of the viewport,
             where the soil's top edge is *deeper* (closer to the section bottom)
             because of the soil's center-peak curve. So we need a larger
             pull-down than in the stacked layout. Verified by runtime measurement
             at multiple breakpoints (see debug logs). -112px lands the trunk
             ~3px into the soil for a visibly planted look across native zoom
             and 1-3 cmd-minus steps. */
          margin-bottom: -112px;
          max-width: 720px;
        }
        .endowment-hero-blob {
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
        .endowment-hero-h1 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 84px;
          line-height: 1.02;
          letter-spacing: -0.032em;
          margin: 0 0 32px;
          color: #0b1530;
          text-wrap: balance;
        }
        .endowment-h1-main {
          display: inline;
          color: #0b1530;
        }
        .endowment-h1-accent {
          color: #3971ff;
        }
        .endowment-hero-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-geist-sans), system-ui, sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 32px;
        }
        .endowment-hero-lead {
          font-size: 20px;
          line-height: 1.55;
          color: #1f2937;
          max-width: 560px;
          margin: 0 0 72px;
          font-weight: 500;
        }
        .endowment-hero-ctas {
          display: flex;
          gap: 12px;
          align-items: center;
          flex-wrap: wrap;
        }
        /* Mid range: still two columns but everything tightens up so the tree
           doesn't dominate the layout and the headline doesn't wrap awkwardly. */
        @media (max-width: 1280px) {
          .endowment-hero {
            padding: 120px 28px 140px;
            /* Lower cap at this breakpoint than at full desktop because the
               mid-range tree margin (-88px) is tuned for a section height of
               ~777px (which is what (100vh - 60px) resolves to on a 837px
               viewport, a typical laptop in this width range). Without this
               lower cap, a taller viewport at mid widths would create a ~64px
               gap between the trunk and the soil. */
            min-height: min(calc(100vh - 60px), 777px);
          }
          .endowment-hero-inner {
            gap: 48px;
          }
          .endowment-hero-h1 {
            font-size: 72px;
          }
          .endowment-hero-lead {
            margin: 0 0 56px;
          }
          .endowment-hero-inner > :global(.endowment-tree-wrap) {
            max-width: 560px;
            /* At narrower 2-col viewports the tree shrinks but the soil-top dip
               at its x-position is also closer to ground.top, so it can land
               with a slightly smaller pull-down than at full desktop. */
            margin-bottom: -88px;
          }
        }
        @media (max-width: 1100px) {
          .endowment-hero {
            min-height: auto;
            /* Top padding clears the absolutely-positioned center logo
               (top: 28px + ~47px logo height ≈ 75px logo bottom + breathing
               room). Was 84px which only left ~9px gap and felt cramped. */
            padding: 104px 28px 120px;
          }
          .endowment-hero-inner {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .endowment-hero-h1 {
            font-size: 56px;
          }
          .endowment-hero-lead {
            margin: 0 0 32px;
          }
          .endowment-hero-inner > :global(.endowment-tree-wrap) {
            /* Stacked layout: tree is centered, so the soil-top peak (y=0) is at
               the tree's x. Pull down just past ground.top to plant the trunk. */
            margin-bottom: -65px;
            max-width: 480px;
          }
        }
        @media (max-width: 640px) {
          .endowment-hero {
            /* Top padding clears the absolutely-positioned center logo
               (top: 28px + ~47px logo height = 75px logo bottom + breathing
               room). Was 64px which caused the logo to overlap the eyebrow. */
            padding: 100px 20px 96px;
          }
          .endowment-hero-inner > :global(.endowment-tree-wrap) {
            margin-bottom: -56px;
            max-width: 360px;
          }
        }
      `}</style>
    </section>
  );
}
