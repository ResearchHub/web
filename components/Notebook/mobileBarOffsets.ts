/**
 * Offsets that keep the notebook's fixed overlays clear of the app's own fixed
 * bars on mobile — the bottom nav and the top bar, not anything browser- or
 * device-specific.
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
 * fixed overlays sit outside the flow and have to carry their own. The
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
  /** Above the assistant's composer bar, chips included (centred controls). */
  bottom40: 'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px)_+_10rem)] tablet:bottom-40',
  /** Beside the composer bar's top edge, for a control in the corner. */
  aboveComposer:
    'bottom-[calc(4rem_+_env(safe-area-inset-bottom,_0px)_+_11rem)] tablet:bottom-[8.5rem]',
} as const;

/**
 * Top offset for an overlay that hangs below the TopBar. Pass whether the
 * promo banner is currently showing — the banner only renders below `tablet`,
 * so the taller offset is mobile-only and the plain one is always correct
 * above that breakpoint.
 *
 * The bar's bottom border sits just past `--top-bar-height` (the variable is
 * the title row; the border is drawn under it), so the offset adds that pixel:
 * an overlay starting at the bare height covers the border, and the line
 * across the top of the page stops dead at the overlay's edge.
 */
export function belowMobileTopBar(promoBannerVisible: boolean): string {
  return promoBannerVisible
    ? 'top-[calc(56px_+_var(--top-bar-height)_+_1px)] tablet:top-[calc(var(--top-bar-height)_+_1px)]'
    : 'top-[calc(var(--top-bar-height)_+_1px)]';
}
