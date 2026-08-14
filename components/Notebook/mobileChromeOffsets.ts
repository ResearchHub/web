/**
 * Offsets that keep the notebook's fixed overlays clear of the app's mobile
 * chrome.
 *
 * Below the `tablet` breakpoint the app frames the viewport with two fixed
 * bars the rest of the layout has to work around: MobileBottomNav across the
 * bottom `4rem` plus the device's safe-area inset, and — while it is showing —
 * the EndowmentPromoBanner stacked above the TopBar, pushing the whole top bar
 * down by its 56px height. Both outrank the notebook's overlays in z-order, so
 * an overlay left at its desktop offset is not merely overlapped, it is
 * buried: the bar wins the hit test and swallows the taps meant for it.
 *
 * globals.css reserves the same space for in-flow content
 * (`.page-layout-with-mobile-bottom-nav`, `.page-layout-with-promo-banner`);
 * fixed overlays sit outside the flow and have to carry their own.
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

/**
 * Top offset for an overlay that hangs below the TopBar. Pass whether the
 * promo banner is currently showing — the banner only renders below `tablet`,
 * so the taller offset is mobile-only and the plain one is always correct
 * above that breakpoint.
 */
export function belowMobileTopBar(promoBannerVisible: boolean): string {
  return promoBannerVisible
    ? 'top-[calc(56px_+_var(--top-bar-height))] tablet:top-[var(--top-bar-height)]'
    : 'top-[var(--top-bar-height)]';
}
