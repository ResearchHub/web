'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { cn } from '@/utils/styles';

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'center';

interface TourStep {
  selector: string;
  title: string;
  description: string;
  placement: Placement;
}

// Steps are matched to live DOM via `data-tour` anchors. If a target isn't
// present (e.g. the publishing sidebar before a note is opened), the step
// gracefully falls back to a centered popover with no spotlight.
const STEPS: TourStep[] = [
  {
    selector: '[data-tour="notebook-editor"]',
    title: 'Write in the main area',
    description:
      'This is your document. Draft your preprint, proposal, or funding opportunity here — everything autosaves as you type.',
    placement: 'center',
  },
  {
    selector: '[data-tour="notebook-publish"]',
    title: 'Add details & publish',
    description:
      'Switch to the Details tab to set funding amount, topics, and contacts — then publish from the button at the bottom.',
    placement: 'bottom',
  },
];

const SPOTLIGHT_PADDING = 8;
const POPOVER_WIDTH = 320;

interface NotebookTourProps {
  run: boolean;
  onClose: () => void;
}

export function NotebookTour({ run, onClose }: NotebookTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number } | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const step = STEPS[stepIndex];

  // Restart from the first step each time the tour is (re)opened.
  useEffect(() => {
    if (run) setStepIndex(0);
  }, [run]);

  // Continuously track the target while the tour is open. The notebook layout
  // animates (the right sidebar slides in via a grid-template-columns
  // transition, content reflows on load), so a one-time measurement lands the
  // highlight out of place. Measuring every frame keeps the ring glued to the
  // target through any reflow; we only re-render when the rect actually moves.
  useEffect(() => {
    if (!run) return;
    let raf = 0;
    let prevKey = '';
    const tick = () => {
      const el = document.querySelector(step.selector) as HTMLElement | null;
      const r = el ? el.getBoundingClientRect() : null;
      const key = r
        ? `${Math.round(r.top)}:${Math.round(r.left)}:${Math.round(r.width)}:${Math.round(r.height)}`
        : 'none';
      if (key !== prevKey) {
        prevKey = key;
        setRect(r);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [run, step]);

  // Position the popover relative to the target (or centered as a fallback).
  useEffect(() => {
    if (!run) return;
    const w = POPOVER_WIDTH;
    const h = popoverRef.current?.offsetHeight ?? 190;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const margin = 16;

    let top: number;
    let left: number;

    if (step.placement === 'center' && rect) {
      // Center the popover over the highlighted target rather than the viewport.
      top = rect.top + rect.height / 2 - h / 2;
      left = rect.left + rect.width / 2 - w / 2;
    } else if (!rect || step.placement === 'center') {
      top = vh / 2 - h / 2;
      left = vw / 2 - w / 2;
    } else if (step.placement === 'bottom') {
      top = rect.bottom + 12;
      left = rect.left + rect.width / 2 - w / 2;
    } else if (step.placement === 'top') {
      top = rect.top - h - 12;
      left = rect.left + rect.width / 2 - w / 2;
    } else if (step.placement === 'left') {
      left = rect.left - w - 12;
      top = rect.top + rect.height / 2 - h / 2;
    } else {
      left = rect.right + 12;
      top = rect.top + rect.height / 2 - h / 2;
    }

    left = Math.min(Math.max(left, margin), vw - w - margin);
    top = Math.min(Math.max(top, margin), vh - h - margin);
    setPopoverPos({ top, left });
  }, [run, rect, step, stepIndex]);

  if (!run || typeof document === 'undefined') return null;

  const isLast = stepIndex === STEPS.length - 1;
  const handleNext = () => (isLast ? onClose() : setStepIndex((i) => i + 1));
  const handleBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const spotlight = rect
    ? {
        top: rect.top - SPOTLIGHT_PADDING,
        left: rect.left - SPOTLIGHT_PADDING,
        width: rect.width + SPOTLIGHT_PADDING * 2,
        height: rect.height + SPOTLIGHT_PADDING * 2,
      }
    : null;

  return createPortal(
    <div className="pointer-events-none fixed inset-0 z-[10000]">
      {spotlight && (
        <div
          className="absolute rounded-xl transition-all duration-200"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
            boxShadow:
              '0 0 0 3px rgba(57,113,255,1), 0 0 0 8px rgba(57,113,255,0.35), 0 0 32px 8px rgba(57,113,255,0.45)',
          }}
        />
      )}

      <div
        key={stepIndex}
        ref={popoverRef}
        className={cn(
          'pointer-events-auto absolute w-80 overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-500 text-white shadow-2xl ring-1 ring-white/20',
          popoverPos ? 'opacity-100 animate-fadeIn' : 'opacity-0'
        )}
        style={{ top: popoverPos?.top ?? -9999, left: popoverPos?.left ?? -9999 }}
      >
        <div className="p-4">
          <div className="flex items-center gap-2">
            <RadiatingDot color="bg-white" ring isRadiating />
            <h3 className="text-base font-semibold text-white">{step.title}</h3>
          </div>
          <p className="mt-1 text-sm leading-relaxed text-white/85">{step.description}</p>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-medium text-white/70 transition-colors hover:text-white"
            >
              Skip
            </button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="rounded-md border border-white/40 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                className="rounded-md bg-white px-3.5 py-1.5 text-sm font-semibold text-primary-700 shadow-sm transition-colors hover:bg-white/90"
              >
                {isLast ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
