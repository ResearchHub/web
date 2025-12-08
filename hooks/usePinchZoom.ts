'use client';

import { useRef, useEffect, useCallback, useState } from 'react';

interface PinchZoomOptions {
  /** Minimum scale value */
  minScale?: number;
  /** Maximum scale value */
  maxScale?: number;
  /** Current scale value */
  scale: number;
  /** Callback when scale changes (called incrementally during gesture) */
  onScaleChange: (scale: number) => void;
  /** Whether pinch zoom is enabled */
  enabled?: boolean;
  /** Step size for incremental zoom (default: 0.01 = 1%) */
  stepSize?: number;
}

interface PinchState {
  isPinching: boolean;
  lastDistance: number;
  centerX: number;
  centerY: number;
}

interface UsePinchZoomReturn<T extends HTMLElement> {
  /** Ref to attach to the zoomable element */
  ref: React.MutableRefObject<T | null>;
  /** Whether a gesture is currently in progress */
  isGesturing: boolean;
  /** Transform origin point (x, y in pixels) */
  transformOrigin: { x: number; y: number } | null;
}

/**
 * Hook to handle pinch-to-zoom gestures on touch devices and trackpads.
 * Returns a ref to attach to the target element, plus gesture state.
 *
 * Features:
 * - Incremental zoom updates (no debounce, immediate response)
 * - Tracks pinch center point for proper transform origin
 * - Trackpad pinch support (via wheel events with ctrlKey)
 * - Configurable min/max scale limits and step size
 *
 * @example
 * ```tsx
 * const [scale, setScale] = useState(1);
 * const { ref, isGesturing, transformOrigin } = usePinchZoom({
 *   scale,
 *   onScaleChange: setScale,
 *   minScale: 0.5,
 *   maxScale: 3,
 *   stepSize: 0.01, // 1% increments
 * });
 *
 * return (
 *   <div ref={ref}>
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
  stepSize = 0.01, // 1% increments by default
}: PinchZoomOptions): UsePinchZoomReturn<T> {
  const elementRef = useRef<T | null>(null);

  const [isGesturing, setIsGesturing] = useState(false);
  const [transformOrigin, setTransformOrigin] = useState<{ x: number; y: number } | null>(null);

  const pinchStateRef = useRef<PinchState>({
    isPinching: false,
    lastDistance: 0,
    centerX: 0,
    centerY: 0,
  });

  // Track the current scale in a ref (avoids stale closures)
  const scaleRef = useRef(scale);
  // Track pending scale update
  const pendingScaleRef = useRef<number | null>(null);
  // RAF for throttling updates
  const rafRef = useRef<number | null>(null);

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

  // Calculate center point between two touches
  const getCenter = useCallback((touch1: Touch, touch2: Touch): { x: number; y: number } => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    };
  }, []);

  // Clamp scale within bounds
  const clampScale = useCallback(
    (value: number): number => {
      return Math.min(maxScale, Math.max(minScale, value));
    },
    [minScale, maxScale]
  );

  // Handle touch start
  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (e.touches.length !== 2) return;

      // Prevent default to stop browser zoom
      e.preventDefault();

      const distance = getDistance(e.touches[0], e.touches[1]);
      const center = getCenter(e.touches[0], e.touches[1]);

      // Get element bounds to convert to relative coordinates
      const element = elementRef.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        pinchStateRef.current = {
          isPinching: true,
          lastDistance: distance,
          centerX: center.x - rect.left,
          centerY: center.y - rect.top,
        };

        setTransformOrigin({ x: center.x - rect.left, y: center.y - rect.top });
      } else {
        pinchStateRef.current = {
          isPinching: true,
          lastDistance: distance,
          centerX: center.x,
          centerY: center.y,
        };

        setTransformOrigin({ x: center.x, y: center.y });
      }

      setIsGesturing(true);
    },
    [getDistance, getCenter]
  );

  // Handle touch move (pinch gesture)
  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!pinchStateRef.current.isPinching || e.touches.length !== 2) return;

      // Prevent default browser behavior (zoom, scroll)
      e.preventDefault();

      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const { lastDistance } = pinchStateRef.current;

      // Calculate distance change
      const distanceChange = currentDistance - lastDistance;

      // Only update if there's significant change (avoid jitter)
      if (Math.abs(distanceChange) < 1) return;

      // Determine direction: positive = zoom in, negative = zoom out
      const direction = distanceChange > 0 ? 1 : -1;

      // Calculate new scale with step size (1% increments)
      const newScale = clampScale(scaleRef.current + direction * stepSize);

      // Store pending scale
      pendingScaleRef.current = newScale;

      // Update last distance for next comparison
      pinchStateRef.current.lastDistance = currentDistance;

      // Update pinch center point
      const center = getCenter(e.touches[0], e.touches[1]);
      const element = elementRef.current;
      if (element) {
        const rect = element.getBoundingClientRect();
        pinchStateRef.current.centerX = center.x - rect.left;
        pinchStateRef.current.centerY = center.y - rect.top;
        setTransformOrigin({ x: center.x - rect.left, y: center.y - rect.top });
      }

      // Throttle scale updates with RAF (smooth but not debounced)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (
          pendingScaleRef.current !== null &&
          Math.abs(pendingScaleRef.current - scaleRef.current) > 0.001
        ) {
          onScaleChange(parseFloat(pendingScaleRef.current.toFixed(3)));
          pendingScaleRef.current = null;
        }
      });
    },
    [getDistance, getCenter, clampScale, stepSize, onScaleChange]
  );

  // Handle touch end
  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      // End pinch when fewer than 2 fingers
      if (e.touches.length < 2 && pinchStateRef.current.isPinching) {
        pinchStateRef.current.isPinching = false;

        // Cancel any pending RAF
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        // Flush any pending scale update immediately
        if (
          pendingScaleRef.current !== null &&
          Math.abs(pendingScaleRef.current - scaleRef.current) > 0.001
        ) {
          onScaleChange(parseFloat(pendingScaleRef.current.toFixed(3)));
          pendingScaleRef.current = null;
        }

        setIsGesturing(false);
        setTransformOrigin(null);
      }
    },
    [onScaleChange]
  );

  // Handle wheel events for trackpad pinch (ctrlKey + wheel = pinch gesture)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      // ctrlKey is set when using trackpad pinch or Chrome DevTools pinch simulation
      if (!e.ctrlKey) return;

      // Prevent browser zoom
      e.preventDefault();

      // Start gesturing if not already
      if (!isGesturing) {
        setIsGesturing(true);

        // Set transform origin to mouse position
        const element = elementRef.current;
        if (element) {
          const rect = element.getBoundingClientRect();
          setTransformOrigin({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      }

      // Determine direction from deltaY: negative = zoom in, positive = zoom out
      const direction = e.deltaY < 0 ? 1 : -1;

      // Calculate new scale with step size
      const newScale = clampScale(scaleRef.current + direction * stepSize);

      // Store pending scale
      pendingScaleRef.current = newScale;

      // Throttle scale updates with RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        if (
          pendingScaleRef.current !== null &&
          Math.abs(pendingScaleRef.current - scaleRef.current) > 0.001
        ) {
          onScaleChange(parseFloat(pendingScaleRef.current.toFixed(3)));
          pendingScaleRef.current = null;
        }
      });
    },
    [clampScale, stepSize, onScaleChange, isGesturing]
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
    };
  }, [enabled, handleWheel]);

  // Reset gesture state when wheel gesture ends (after a delay without wheel events)
  useEffect(() => {
    if (!isGesturing) return;

    let timeoutId: NodeJS.Timeout;

    const resetGesture = () => {
      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        // Flush any pending scale update
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        if (
          pendingScaleRef.current !== null &&
          Math.abs(pendingScaleRef.current - scaleRef.current) > 0.001
        ) {
          onScaleChange(parseFloat(pendingScaleRef.current.toFixed(3)));
          pendingScaleRef.current = null;
        }

        setIsGesturing(false);
        setTransformOrigin(null);
      }, 100); // Reset after 100ms of no activity
    };

    const element = elementRef.current;
    if (element) {
      const wheelHandler = () => resetGesture();
      element.addEventListener('wheel', wheelHandler);
      resetGesture(); // Start initial timer

      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        element.removeEventListener('wheel', wheelHandler);
      };
    }
  }, [isGesturing, onScaleChange]);

  return {
    ref: elementRef,
    isGesturing,
    transformOrigin,
  };
}

/**
 * Utility to detect if a touch event is a pinch gesture
 */
export function isPinchGesture(e: TouchEvent): boolean {
  return e.touches.length === 2;
}
