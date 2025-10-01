'use client';

import { useState, useEffect, useMemo } from 'react';
import { useMediaQuery } from './useMediaQuery';

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

type BreakpointKey = keyof typeof BREAKPOINTS;

type ScreenSizeValue = {
  // Current breakpoint
  current: BreakpointKey | 'xs' | null;

  // Boolean checks for specific breakpoints
  isXs: boolean | null;
  isSm: boolean | null;
  isMd: boolean | null;
  isLg: boolean | null;
  isXl: boolean | null;
  is2Xl: boolean | null;

  // Boolean checks for breakpoint ranges
  smAndUp: boolean | null;
  mdAndUp: boolean | null;
  lgAndUp: boolean | null;
  xlAndUp: boolean | null;

  smAndDown: boolean | null;
  mdAndDown: boolean | null;
  lgAndDown: boolean | null;
  xlAndDown: boolean | null;
};

/**
 * Custom hook that provides detailed information about the current screen size
 * @returns Object with current breakpoint and various comparison helpers
 */
export function useScreenSize(): ScreenSizeValue {
  // Use the base useMediaQuery hook for each breakpoint
  const sm = useMediaQuery(`(min-width: ${BREAKPOINTS.sm}px)`);
  const md = useMediaQuery(`(min-width: ${BREAKPOINTS.md}px)`);
  const lg = useMediaQuery(`(min-width: ${BREAKPOINTS.lg}px)`);
  const xl = useMediaQuery(`(min-width: ${BREAKPOINTS.xl}px)`);
  const xxl = useMediaQuery(`(min-width: ${BREAKPOINTS['2xl']}px)`);

  // Determine current breakpoint
  const current = useMemo(() => {
    if (xxl === true) return '2xl';
    if (xl === true) return 'xl';
    if (lg === true) return 'lg';
    if (md === true) return 'md';
    if (sm === true) return 'sm';
    if (sm === false) return 'xs';
    return null; // During SSR or initial render
  }, [sm, md, lg, xl, xxl]);

  return {
    current,

    // Exact breakpoint matches
    isXs: sm === false,
    isSm: sm === true && md === false,
    isMd: md === true && lg === false,
    isLg: lg === true && xl === false,
    isXl: xl === true && xxl === false,
    is2Xl: xxl === true,

    // Breakpoint and up
    smAndUp: sm,
    mdAndUp: md,
    lgAndUp: lg,
    xlAndUp: xl,

    // Breakpoint and down
    smAndDown: md === false,
    mdAndDown: lg === false,
    lgAndDown: xl === false,
    xlAndDown: xxl === false,
  };
}
