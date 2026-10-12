/**
 * Offsets that keep the notebook's fixed overlays clear of the app's own mobile
 * bottom nav, not anything browser- or device-specific.
 *
 * Below the `tablet` breakpoint MobileBottomNav is fixed across the bottom
 * `4rem` plus the device's safe-area inset. It outranks the notebook's overlays
 * in z-order, so an overlay left at its desktop offset is not merely
 * overlapped, it is buried: the bar wins the hit test and swallows the taps
 * meant for it.
 *
 * globals.css reserves the same space for in-flow content
 * (`.page-layout-with-mobile-bottom-nav`); fixed overlays sit outside the flow
 * and have to carry their own. The
 * notebook never shows the funding power bar that the home tabs dock over the
 * nav, so the nav's own height is the whole of the bottom offset here.
 *
 * Entries name the desktop offset they stand in for, so a call site reads as a
 * swap — `bottom-6` becomes `ABOVE_MOBILE_NAV.bottom6` — keeping the same gap
 * but measuring it from the bar rather than the viewport edge, and restoring
 * the plain offset once the bar is gone. Whole class strings, never built by
 * concatenation: Tailwind only generates classes it can find verbatim in the
 * source.
 */
export const ABOVE_MOBILE_NAV = {
  /** Flush against the nav — for an overlay that fills the screen. */
  bottom0: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px))] tablet:bottom-0',
  bottom6: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px)_+_1.5rem)] tablet:bottom-6',
  bottom24: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px)_+_6rem)] tablet:bottom-24',
} as const;
