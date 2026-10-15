'use client';

import { FC, Fragment, ReactNode, TouchEvent, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { ChevronLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  /** Pinned under the scrolling body. */
  footer?: ReactNode;
  /** Width from the tablet breakpoint up; below it the panel takes the whole screen. */
  widthClassName?: string;
}

/** A swipe across that carries the panel this share of its width closes it on release. */
const SWIPE_CLOSE_FRACTION = 0.3;
/** So does a flick faster than this, in px per ms, once it has gone a little way. */
const SWIPE_CLOSE_VELOCITY = 0.5;
const SWIPE_FLICK_MIN_PX = 40;
/** Travel before a touch counts as a swipe across or a scroll. */
const SWIPE_SLOP = 10;
const SWIPE_SETTLE_MS = 200;

/** Whether the touch began on something that scrolls sideways, which keeps the swipe. */
function startsInSideScroller(target: EventTarget | null, panel: HTMLElement): boolean {
  for (let el = target as HTMLElement | null; el && el !== panel; el = el.parentElement) {
    if (el.scrollWidth > el.clientWidth && /auto|scroll/.test(getComputedStyle(el).overflowX)) {
      return true;
    }
  }
  return false;
}

/**
 * Lets a finger drag the panel back off to the right, the way it came in, and closes
 * it if let go far enough along or flicked. A touch that moves mostly up or down is
 * left to scroll the panel.
 */
function useSwipeToClose(onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  const swipe = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    dx: number;
    axis?: 'x' | 'y';
  } | null>(null);

  // Inline styles win over the slide-in transition's classes while the finger is
  // down; they're cleared once the panel settles back, so closing with the button
  // still slides it out.
  const moveTo = (x: string, settle: boolean) => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transition = settle ? `transform ${SWIPE_SETTLE_MS}ms ease-out` : 'none';
    panel.style.transform = `translateX(${x})`;
  };

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    const panel = panelRef.current;
    if (!panel || e.touches.length !== 1 || startsInSideScroller(e.target, panel)) {
      swipe.current = null;
      return;
    }
    const touch = e.touches[0];
    swipe.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: e.timeStamp,
      dx: 0,
    };
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    const current = swipe.current;
    if (!current || current.axis === 'y') return;
    const touch = e.touches[0];
    const dx = touch.clientX - current.startX;
    const dy = touch.clientY - current.startY;
    if (!current.axis) {
      if (Math.abs(dx) < SWIPE_SLOP && Math.abs(dy) < SWIPE_SLOP) return;
      current.axis = dx > Math.abs(dy) ? 'x' : 'y';
      if (current.axis === 'y') return;
    }
    current.dx = Math.max(0, dx);
    moveTo(`${current.dx}px`, false);
  };

  const onTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const current = swipe.current;
    swipe.current = null;
    const panel = panelRef.current;
    if (!current || current.axis !== 'x' || !panel) return;

    const velocity = current.dx / Math.max(1, e.timeStamp - current.startTime);
    const isFlick = velocity > SWIPE_CLOSE_VELOCITY && current.dx > SWIPE_FLICK_MIN_PX;
    if (current.dx > panel.offsetWidth * SWIPE_CLOSE_FRACTION || isFlick) {
      moveTo('100%', true);
      window.setTimeout(onClose, SWIPE_SETTLE_MS);
      return;
    }
    moveTo('0px', true);
    window.setTimeout(() => {
      if (swipe.current) return;
      panel.style.transition = '';
      panel.style.transform = '';
    }, SWIPE_SETTLE_MS);
  };

  return {
    ref: panelRef,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onTouchCancel: onTouchEnd,
  };
}

/**
 * A panel that slides in from the right over a dimmed page, for reading something
 * in full without leaving the list it came from. On a phone it fills the screen and
 * reads as a page of its own: a back button sits left of the title, and a swipe to
 * the right takes it away.
 */
export const SidePanel: FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  widthClassName = 'tablet:max-w-[560px]',
}) => {
  const swipeHandlers = useSwipeToClose(onClose);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-[9999]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/20" aria-hidden />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex w-full justify-end">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-out duration-300"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in duration-200"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel
                {...swipeHandlers}
                className={cn(
                  // Sideways moves are left to the swipe; the page still scrolls and zooms.
                  'pointer-events-auto flex h-full w-full touch-pan-y touch-pinch-zoom flex-col bg-white shadow-2xl',
                  widthClassName
                )}
              >
                <div className="flex flex-shrink-0 items-center gap-1 border-b border-gray-200 px-4 py-2 tablet:gap-4 tablet:px-6 tablet:py-4">
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="-ml-3 flex-shrink-0 rounded-full tablet:hidden"
                    aria-label="Back"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Dialog.Title
                    as="h2"
                    className="min-w-0 flex-1 text-base font-semibold text-gray-900"
                  >
                    {title}
                  </Dialog.Title>
                  <Button
                    onClick={onClose}
                    variant="ghost"
                    size="icon"
                    className="hidden h-9 w-9 flex-shrink-0 rounded-full tablet:inline-flex"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="min-h-0 flex-1 touch-pan-y touch-pinch-zoom overflow-y-auto">
                  {children}
                </div>

                {footer && (
                  <div className="flex-shrink-0 border-t border-gray-200 px-4 py-3 tablet:px-6">
                    {footer}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
