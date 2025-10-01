'use client';

import { BREAKPOINTS } from '@/hooks/useScreenSize';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Device detection function that combines multiple detection methods
 */
function detectDeviceType(): DeviceType {
  // SSR fallback
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'desktop';
  }

  // Get device capabilities
  const maxTouchPoints = navigator.maxTouchPoints || 0;
  const hasTouch = maxTouchPoints > 0;
  const screenWidth = window.screen.width;

  // Get user agent information (prefer API when available)
  const userAgent = navigator.userAgent || '';
  const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'unknown';

  // Detection using navigator.userAgentData (more reliable)
  if ((navigator as any).userAgentData) {
    const uaData = (navigator as any).userAgentData;

    // Check for mobile devices
    if (uaData.mobile) {
      return 'mobile';
    }

    // Check for tablet (iPad in desktop mode, Android tablets, etc.)
    if (uaData.platform === 'macOS' && hasTouch && screenWidth >= BREAKPOINTS.md) {
      return 'tablet'; // iPad in desktop mode
    }

    // Check screen size for tablets
    if (hasTouch && screenWidth >= BREAKPOINTS.md && screenWidth < BREAKPOINTS.lg) {
      return 'tablet';
    }

    // Default to desktop for non-mobile devices
    return 'desktop';
  }

  // Fallback to user agent parsing for older browsers
  const ua = userAgent.toLowerCase();

  // Mobile detection
  const isMobileUA =
    /android.*mobile|iphone|ipod|blackberry|windows phone|opera mini|iemobile|mobile/i.test(ua);
  const isAndroidMobile = /android.*mobile/i.test(ua);
  const isIPhone = /iphone/i.test(ua);
  const isIPod = /ipod/i.test(ua);

  // Tablet detection
  const isIPad =
    /ipad/i.test(ua) || (platform === 'MacIntel' && hasTouch && screenWidth >= BREAKPOINTS.md);
  const isAndroidTablet = /android/i.test(ua) && !/mobile/i.test(ua);
  const isWindowsTablet = /windows/i.test(ua) && hasTouch;
  const isTabletUA = /tablet|playbook|silk|kindle/i.test(ua);

  // Determine device type
  if (isMobileUA || isAndroidMobile || isIPhone || isIPod) {
    return 'mobile';
  }

  if (isIPad || isAndroidTablet || isWindowsTablet || isTabletUA) {
    return 'tablet';
  }

  // Additional tablet detection based on screen size and touch
  if (hasTouch && screenWidth >= BREAKPOINTS.md && screenWidth < BREAKPOINTS.lg) {
    return 'tablet';
  }

  // Default to desktop
  return 'desktop';
}

/**
 * React hook that returns the device type
 */
export function useDeviceType(): DeviceType {
  const deviceType = detectDeviceType();
  return deviceType;
}
