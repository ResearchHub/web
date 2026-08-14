/**
 * Bottom offsets for the notebook's fixed overlays, lifted clear of the
 * MobileBottomNav.
 *
 * That nav (app/layouts/MobileBottomNav.tsx) is fixed over the bottom `4rem`
 * plus the device's safe-area inset below the `tablet` breakpoint, and its
 * z-index outranks every overlay the notebook floats. An overlay left at its
 * desktop offset is not merely overlapped there — it is buried, taps and all,
 * because the nav wins the hit test. The same reservation exists as
 * `.page-layout-with-mobile-bottom-nav` in globals.css, which only helps
 * in-flow content; fixed overlays have to carry their own.
 *
 * Each entry names the desktop offset it stands in for, so a call site reads
 * as a swap: `bottom-6` becomes `ABOVE_MOBILE_NAV.bottom6`, keeping the same
 * gap but measuring it from the nav rather than the viewport edge, and
 * restoring the plain offset once the nav is gone. Whole class strings, not
 * built by concatenation — Tailwind only generates classes it can find
 * verbatim in the source.
 */
export const ABOVE_MOBILE_NAV = {
  /** Flush against the nav — for an overlay that fills the screen. */
  bottom0: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px))] tablet:bottom-0',
  bottom6: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px)_+_1.5rem)] tablet:bottom-6',
  bottom24: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px)_+_6rem)] tablet:bottom-24',
} as const;
