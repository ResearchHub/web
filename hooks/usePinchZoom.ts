'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface PinchZoomOptions {
  /** Minimum scale value */
  minScale?: number;
  /** Maximum scale value */
  maxScale?: number;
  /** Current scale value */
  scale: number;
  /** Callback when scale changes (called on gesture end, debounced) */
  onScaleChange: (scale: number) => void;
  /** Whether pinch zoom is enabled */
  enabled?: boolean;
  /** Sensitivity multiplier for zoom speed (default: 1) */
  sensitivity?: number;
  /** Debounce delay in ms before triggering re-render (default: 150) */
  debounceMs?: number;
}

interface PinchState {
  isPinching: boolean;
  initialDistance: number;
  initialScale: number;
}

interface UsePinchZoomReturn<T extends HTMLElement> {
  /** Ref to attach to the zoomable element */
  ref: React.MutableRefObject<T | null>;
  /** Current gesture scale ratio (1 = no transform, use for CSS transform during gesture) */
  gestureScale: number;
  /** Whether a gesture is currently in progress */
  isGesturing: boolean;
}

/**
 * Hook to handle pinch-to-zoom gestures on touch devices and trackpads.
 * Returns a ref to attach to the target element, plus gesture state for smooth CSS transforms.
 *
 * Features:
 * - Smooth pinch with CSS transform during gesture (no re-renders)
 * - Debounced final scale update on gesture end (triggers re-render once)
 * - Trackpad pinch support (via wheel events with ctrlKey)
 * - Configurable min/max scale limits
 *
 * @example
 * ```tsx
 * const [scale, setScale] = useState(1);
 * const { ref, gestureScale, isGesturing } = usePinchZoom({
 *   scale,
 *   onScaleChange: setScale,
 *   minScale: 0.5,
 *   maxScale: 3,
 * });
 *
 * return (
 *   <div ref={ref} style={{
 *     transform: isGesturing ? `scale(${gestureScale})` : undefined,
 *     transformOrigin: 'center top',
 *   }}>
 *     Content
 *   </div>
 * );
 * ```
 */
export function usePinchZoom<T extends HTMLElement = HTMLElement>({
  minScale = 0.5,
  maxScale = 3,
  scale,
  onScaleChange,
  enabled = true,
  sensitivity = 1,
  debounceMs = 150,
}: PinchZoomOptions): UsePinchZoomReturn<T> {
  const elementRef = useRef<T | null>(null);

  // Gesture state - used for CSS transform during gesture
  const [gestureScale, setGestureScale] = useState(1);
  const [isGesturing, setIsGesturing] = useState(false);

  const pinchStateRef = useRef<PinchState>({
    isPinching: false,
    initialDistance: 0,
    initialScale: scale,
  });

  // Ref to track animation frame for throttling visual updates
  const rafRef = useRef<number | null>(null);
  // Ref for debounce timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  // Track the current scale in a ref (avoids stale closures)
  const scaleRef = useRef(scale);
  // Track the pending final scale
  const pendingScaleRef = useRef<number | null>(null);

  // Update ref when scale prop changes
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Calculate distance between two touch points
  const getDistance = useCallback((touch1: Touch, touch2: Touch): number => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.hypot(dx, dy);
  }, []);

  // Clamp scale within bounds
  const clampScale = useCallback(
    (value: number): number => {
      return Math.min(maxScale, Math.max(minScale, value));
    },
    [minScale, maxScale]
  );

  // Commit the pending scale change (debounced)
  const commitScale = useCallback(() => {
    if (pendingScaleRef.current !== null) {
      const finalScale = pendingScaleRef.current;
      pendingScaleRef.current = null;

      // Trigger the actual re-render
      onScaleChange(finalScale);

      // Reset gesture state after a short delay to allow PDF to re-render
      // This prevents the visual flash where transform disappears before PDF catches up
      // Using 50ms which is enough for the browser to start the re-render
      setTimeout(() => {
        setGestureScale(1);
        setIsGesturing(false);
      }, 50);
    }
  }, [onScaleChange]);

  // Schedule a debounced scale commit
  const scheduleCommit = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(commitScale, debounceMs);
  }, [commitScale, debounceMs]);

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      // Prevent default to stop browser zoom
      e.preventDefault();

      // Cancel any pending commit
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const distance = getDistance(e.touches[0], e.touches[1]);
      pinchStateRef.current = {
        isPinching: true,
        initialDistance: distance,
        initialScale: pendingScaleRef.current ?? scaleRef.current,
      };

      setIsGesturing(true);
    },
    [getDistance]
  );

  // Handle touch move (pinch gesture)
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pinchStateRef.current.isPinching || e.touches.length !== 2) return;

      // Prevent default browser behavior (zoom, scroll)
      e.preventDefault();

      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const { initialDistance, initialScale } = pinchStateRef.current;

      // Calculate scale ratio with sensitivity
      const ratio = currentDistance / initialDistance;
      const scaleDelta = (ratio - 1) * sensitivity;
      const newScale = clampScale(initialScale * (1 + scaleDelta));

      // Store pending scale
      pendingScaleRef.current = parseFloat(newScale.toFixed(2));

      // Update visual gesture scale (ratio relative to current rendered scale)
      // This is used for CSS transform
      const visualRatio = newScale / scaleRef.current;

      // Throttle visual updates using requestAnimationFrame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setGestureScale(visualRatio);
      });
    },
    [getDistance, clampScale, sensitivity]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // End pinch when fewer than 2 fingers
      if (e.touches.length < 2 && pinchStateRef.current.isPinching) {
        pinchStateRef.current.isPinching = false;

        // Clean up animation frame
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        // Schedule debounced commit
        if (pendingScaleRef.current !== null) {
          scheduleCommit();
        } else {
          setIsGesturing(false);
          setGestureScale(1);
        }
      }
    },
    [scheduleCommit]
  );

  // Handle wheel events for trackpad pinch (ctrlKey + wheel = pinch gesture)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // ctrlKey is set when using trackpad pinch or Chrome DevTools pinch simulation
      if (!e.ctrlKey) return;

      // Prevent browser zoom
      e.preventDefault();

      // Cancel any pending commit to accumulate gesture
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Start gesturing if not already
      if (!isGesturing) {
        setIsGesturing(true);
      }

      // Calculate new scale based on wheel delta
      const baseScale = pendingScaleRef.current ?? scaleRef.current;
      const zoomFactor = 0.01 * sensitivity;
      const delta = -e.deltaY * zoomFactor;
      const newScale = clampScale(baseScale * (1 + delta));

      // Store pending scale
      pendingScaleRef.current = parseFloat(newScale.toFixed(2));

      // Update visual gesture scale
      const visualRatio = newScale / scaleRef.current;

      // Throttle visual updates
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        setGestureScale(visualRatio);
      });

      // Schedule debounced commit (wheel events are continuous, so debounce)
      scheduleCommit();
    },
    [clampScale, sensitivity, isGesturing, scheduleCommit]
  );

  // Set up touch event listeners
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    const options: AddEventListenerOptions = { passive: false };

    element.addEventListener('touchstart', handleTouchStart, options);
    element.addEventListener('touchmove', handleTouchMove, options);
    element.addEventListener('touchend', handleTouchEnd, options);
    element.addEventListener('touchcancel', handleTouchEnd, options);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Set up wheel event listener for trackpad pinch
  useEffect(() => {
    const element = elementRef.current;
    if (!element || !enabled) return;

    element.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      element.removeEventListener('wheel', handleWheel);

      // Clean up timers
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [enabled, handleWheel]);

  return {
    ref: elementRef,
    gestureScale,
    isGesturing,
  };
}

/**
 * Utility to detect if a touch event is a pinch gesture
 */
export function isPinchGesture(e: TouchEvent): boolean {
  return e.touches.length === 2;
}
