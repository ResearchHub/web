'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useSmartBack } from '@/hooks/useSmartBack';

export function EndowmentTopBar() {
  const router = useRouter();
  const goBack = useSmartBack();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  // True once the user has scrolled past the hero section. Drives both the
  // white-background fade-in on the bar itself and the "Start Earning" CTA
  // visibility (kept hidden while the hero CTA is on-screen so there's only
  // one prominent CTA at a time).
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.querySelector('.endowment-hero') as HTMLElement | null;
    if (!hero) return;

    // We flip `scrolled` once the user has scrolled past the entire hero
    // section. This keeps the topbar fully embedded in the hero (transparent +
    // no CTA) while the user is reading it, then introduces the white
    // background and "Start Earning" CTA once they're into the next section.
    const update = () => {
      const heroBottom = hero.offsetTop + hero.offsetHeight;
      setScrolled(window.scrollY >= heroBottom);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const handleStartEarning = () => {
    executeAuthenticatedAction(() => {
      router.push('/researchcoin');
    });
  };

  return (
    <header
      className={`endowment-topbar${scrolled ? ' endowment-topbar-visible' : ''}`}
      aria-label="Endowment page navigation"
      aria-hidden={!scrolled}
    >
      <div className="endowment-topbar-inner">
        <div className="endowment-topbar-left">
          <button
            type="button"
            onClick={goBack}
            className="endowment-topbar-back"
            aria-label="Go back"
            tabIndex={scrolled ? 0 : -1}
          >
            <ChevronLeft className="w-5 h-5" aria-hidden />
          </button>
          <Link
            href="/"
            className="endowment-topbar-logo"
            aria-label="ResearchHub home"
            tabIndex={scrolled ? 0 : -1}
          >
            <Logo size={28} />
          </Link>
        </div>

        <div className="endowment-topbar-right">
          <Button
            size="sm"
            onClick={handleStartEarning}
            tabIndex={scrolled ? 0 : -1}
            className="!rounded-[12px] !h-[40px] !px-5 !text-sm !font-semibold
              bg-gradient-to-r from-[#3971FF] to-[#4A7FFF] hover:from-[#2C5EE8] hover:to-[#3971FF]
              text-white shadow-[0_6px_16px_-8px_rgba(57,113,255,0.55)]
              hover:shadow-[0_10px_22px_-8px_rgba(57,113,255,0.7)]"
          >
            Start Earning
          </Button>
        </div>
      </div>

      <style jsx>{`
        .endowment-topbar {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: rgba(255, 255, 255, 0.92);
          border-bottom: 1px solid #e5e7eb;
          backdrop-filter: saturate(140%) blur(10px);
          -webkit-backdrop-filter: saturate(140%) blur(10px);
          box-shadow: 0 6px 20px -16px rgba(13, 30, 80, 0.25);
          /* Hidden by default. Slides in from above when user scrolls past
             the hero. Using transform + opacity keeps the transition cheap
             and lets pointer-events fully disable interaction while hidden. */
          opacity: 0;
          transform: translateY(-100%);
          pointer-events: none;
          transition:
            opacity 0.25s ease,
            transform 0.25s ease;
        }
        .endowment-topbar-visible {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .endowment-topbar-inner {
          max-width: 1320px;
          margin: 0 auto;
          padding: 12px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .endowment-topbar-left {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
        }
        .endowment-topbar-back {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: transparent;
          color: #374151;
          border: 1px solid transparent;
          cursor: pointer;
          transition:
            background-color 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }
        .endowment-topbar-back:hover {
          background: rgba(15, 23, 42, 0.06);
          color: #0b1530;
        }
        .endowment-topbar-back:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .endowment-topbar-logo {
          display: inline-flex;
          align-items: center;
          padding: 4px 6px;
          border-radius: 8px;
        }
        .endowment-topbar-logo:focus-visible {
          outline: 2px solid #3971ff;
          outline-offset: 2px;
        }
        .endowment-topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        @media (max-width: 640px) {
          .endowment-topbar-inner {
            padding: 10px 16px;
          }
        }
      `}</style>
    </header>
  );
}
