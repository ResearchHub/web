'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

// Reveal after a nudge of scrolling and hide again near the top. The gap between
// the two thresholds stops the banner from flickering around the boundary.
const REVEAL_AT_SCROLL_Y = 120;
const HIDE_AT_SCROLL_Y = 48;

export const JoinResearchHubBanner = () => {
  const { user, isLoading } = useUser();
  const { showAuthModal } = useAuthModalContext();
  const scrollContainerRef = useScrollContainer();
  const [isRevealed, setIsRevealed] = useState(false);
  // Deliberately not persisted: dismissing only hides the banner for the current
  // page view, so it comes back on the next load.
  const [isDismissed, setIsDismissed] = useState(false);
  // The banner stays mounted while hidden, so the sweep has to be held back
  // until it is actually on screen. Latched on, never off, so it plays once.
  const [hasShimmered, setHasShimmered] = useState(false);

  const isEligible = !isLoading && !user && !isDismissed;

  useEffect(() => {
    if (isRevealed) setHasShimmered(true);
  }, [isRevealed]);

  useEffect(() => {
    if (!isEligible) return;

    const container = scrollContainerRef?.current;
    const target: HTMLElement | Window = container ?? window;

    const handleScroll = () => {
      const scrollY = container ? container.scrollTop : window.scrollY;
      setIsRevealed((wasRevealed) =>
        wasRevealed ? scrollY > HIDE_AT_SCROLL_Y : scrollY > REVEAL_AT_SCROLL_Y
      );
    };

    target.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => target.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef, isEligible]);

  if (!isEligible) return null;

  return (
    <>
      {/* Extra scroll room so the fixed banner never covers the end of the feed. */}
      <div aria-hidden className="h-60" />

      <div
        role="region"
        aria-label="Join ResearchHub"
        inert={!isRevealed}
        className={cn(
          // z-index clears the MobileBottomNav (z-100) so the banner covers it.
          'fixed inset-x-0 bottom-0 z-[110] transition-[opacity,transform] duration-500 ease-out',
          isRevealed
            ? 'translate-y-0 opacity-100'
            : 'pointer-events-none translate-y-full opacity-0'
        )}
      >
        {/* Untinted white scrim that fades in toward the bottom, so the feed
            dissolves into it rather than hitting a hard edge. The paired outer
            shadow and inset highlight bevel the top edge so the banner reads as
            a layer sitting above the feed. */}
        <div className="relative bg-gradient-to-t from-white/95 via-white/85 to-white/40 pb-[env(safe-area-inset-bottom,_0px)] shadow-[0_-6px_24px_-4px_rgba(15,23,42,0.13),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-sm tablet:!pb-0">
          <div className="mx-auto max-w-[1180px] px-4 py-4 text-center tablet:!px-8 tablet:!py-5">
            <p className="text-lg font-bold leading-snug text-gray-900 tablet:!text-2xl">
              <span className="lg:!hidden">Fund the next breakthrough</span>
              <span className="hidden lg:!inline">Fund the next scientific breakthrough</span>
            </p>
            <p className="mx-auto mt-1.5 max-w-md text-md leading-snug text-gray-600 tablet:!text-[16px]">
              Join the world&apos;s experts advancing science.
            </p>

            <Button
              variant="dark"
              size="lg"
              onClick={() => showAuthModal()}
              className="relative mt-4 w-full max-w-[400px] gap-2.5 overflow-hidden"
            >
              <Logo noText variant="white" size={20} />
              Join ResearchHub
              {hasShimmered && (
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/4 animate-shimmer bg-gradient-to-r from-transparent via-white/40 to-transparent motion-reduce:hidden"
                />
              )}
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            aria-label="Dismiss"
            className="absolute right-2 top-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-200/70 hover:text-gray-700 tablet:!right-4 tablet:!top-3"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
};
