'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { cn } from '@/utils/styles';

/** How far the page has to come down before letting go refreshes it. */
const REFRESH_DISTANCE = 72;
const MAX_PULL = 112;
/** The gap the page keeps open above itself while it reloads. */
const REFRESHING_GAP = 56;
/** The page follows the finger at this rate, so the pull feels like it resists. */
const PULL_RATE = 0.5;
/** Finger travel before a touch counts as a pull rather than a tap or a sideways swipe. */
const PULL_SLOP = 6;
const INDICATOR_SIZE = 36;
/** Phones only: below the tablet breakpoint. */
const PHONE_QUERY = '(max-width: 767px)';

/** Whether anything between the touch and the scrollport is scrolled down on its own. */
function isInScrolledElement(target: EventTarget | null, container: HTMLElement): boolean {
  let node = target instanceof Element ? target : null;
  while (node && node !== container) {
    if (node.scrollTop > 0) return true;
    node = node.parentElement;
  }
  return false;
}

interface PullToRefreshProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
}

/**
 * Pulling the page down from its top on a phone reloads it. The page slides down to
 * open a gap above itself, and in it an arrow winds round as it comes down, then
 * spins once the reload starts. Rendered as the scrollport's first child, so the gap
 * opens under the top bar and above everything on the page. The page scrolls inside
 * its own container, which phone browsers never pull to refresh, so the gesture is
 * rebuilt here.
 */
export function PullToRefresh({ scrollContainerRef }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const phone = window.matchMedia(PHONE_QUERY);

    let startX = 0;
    let startY = 0;
    // A touch that began at the top, until it shows which way it is going.
    let isTracking = false;
    let isPulling = false;
    let distance = 0;

    const stop = () => {
      isTracking = false;
      isPulling = false;
      setIsDragging(false);
    };

    const onTouchStart = (event: TouchEvent) => {
      if (isRefreshingRef.current || !phone.matches || event.touches.length !== 1) return;
      if (container.scrollTop > 0 || isInScrolledElement(event.target, container)) return;
      startX = event.touches[0].clientX;
      startY = event.touches[0].clientY;
      isTracking = true;
      isPulling = false;
      distance = 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (!isTracking) return;
      if (event.touches.length !== 1) {
        stop();
        setPull(0);
        return;
      }
      const dx = event.touches[0].clientX - startX;
      const dy = event.touches[0].clientY - startY;

      if (!isPulling) {
        if (Math.abs(dx) < PULL_SLOP && Math.abs(dy) < PULL_SLOP) return;
        // Scrolling on, or swiping sideways, is not a pull.
        if (dy <= 0 || Math.abs(dx) > dy || container.scrollTop > 0) {
          isTracking = false;
          return;
        }
        isPulling = true;
        setIsDragging(true);
      }

      // Hold the page still while it is being pulled, iOS's rubber band included.
      if (event.cancelable) event.preventDefault();
      distance = Math.min(MAX_PULL, Math.max(0, dy) * PULL_RATE);
      setPull(distance);
    };

    const onTouchEnd = () => {
      if (!isPulling) {
        isTracking = false;
        return;
      }
      stop();
      if (distance >= REFRESH_DISTANCE) {
        isRefreshingRef.current = true;
        setIsRefreshing(true);
        setPull(REFRESHING_GAP);
        window.location.reload();
      } else {
        setPull(0);
      }
    };

    const onTouchCancel = () => {
      stop();
      setPull(0);
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    // Not passive, so a pull can keep the page from scrolling.
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    container.addEventListener('touchcancel', onTouchCancel);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchCancel);
    };
  }, [scrollContainerRef]);

  const progress = isRefreshing ? 1 : Math.min(1, pull / REFRESH_DISTANCE);

  return (
    <div
      role="status"
      className={cn(
        'flex justify-center overflow-hidden tablet:!hidden',
        !isDragging && 'transition-[height,padding] duration-200 ease-out'
      )}
      // The arrow rides down at the bottom of the gap until the gap is big enough
      // to hold it, then stays in the middle.
      style={{
        height: pull,
        alignItems: 'flex-end',
        paddingBottom: Math.max(0, (pull - INDICATOR_SIZE) / 2),
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm"
        style={{ opacity: isRefreshing ? 1 : Math.min(1, pull / INDICATOR_SIZE) }}
      >
        <RefreshCw
          aria-hidden
          className={cn(
            'h-[18px] w-[18px] transition-colors',
            progress >= 1 ? 'text-primary-600' : 'text-gray-500',
            isRefreshing && 'animate-spin'
          )}
          style={isRefreshing ? undefined : { transform: `rotate(${progress * 270}deg)` }}
        />
      </div>
      {isRefreshing && <span className="sr-only">Refreshing</span>}
    </div>
  );
}
