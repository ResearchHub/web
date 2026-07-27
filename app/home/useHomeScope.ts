'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * Whether the hub is showing the whole marketplace or only the things the
 * viewer has a stake in (RFPs they opened, proposals they backed).
 */
export type HomeScope = 'all' | 'mine';

/**
 * Candidate interaction patterns for the "mine vs everything" switch. They are
 * implemented side by side so the demo can compare how each one feels; the
 * choice is a product decision, not a styling one, because they differ in how
 * heavy the switch is and how hard it is to forget you flipped it.
 */
export type ScopePattern = 'lens' | 'mode' | 'pinned' | 'sidebar';

export interface ScopePatternInfo {
  id: ScopePattern;
  label: string;
  /** The closest well-known product that ships this pattern. */
  precedent: string;
  blurb: string;
}

export const SCOPE_PATTERNS: ScopePatternInfo[] = [
  {
    id: 'lens',
    label: 'Avatar lens',
    precedent: 'Figma · view-as',
    blurb:
      'Your avatar is the switch. Feels like putting on your own glasses; costs discoverability.',
  },
  {
    id: 'mode',
    label: 'Identity mode',
    precedent: 'Airbnb · switch to hosting',
    blurb:
      'A real mode: title, chrome and content all change. Best when the two sides have separate jobs.',
  },
  {
    id: 'pinned',
    label: 'No switch',
    precedent: 'Patreon · single identity',
    blurb:
      'Pin your stakes above the shared feed instead of splitting it. One surface, nothing to forget.',
  },
  {
    id: 'sidebar',
    label: 'Nav destination',
    precedent: 'Linear · My issues',
    blurb:
      'Your funding is a place in the left nav, not a filter on the feed. Nothing to forget, but you leave the marketplace to get there.',
  },
];

/**
 * Layout variations that are independent of the scope switch: each one moves or
 * restyles a single piece of chrome, so any combination of them is valid and
 * they are toggled rather than selected.
 */
export type HomeVariation = 'sidebarPost' | 'underlineTabs' | 'noRightSidebar';

export interface HomeVariationInfo {
  id: HomeVariation;
  label: string;
  blurb: string;
}

export const HOME_VARIATIONS: HomeVariationInfo[] = [
  {
    id: 'sidebarPost',
    label: 'Post in left nav',
    blurb:
      'Move Post out of the top bar and into the sidebar, where the rest of the app puts Publish.',
  },
  {
    id: 'underlineTabs',
    label: 'Underline tabs',
    blurb: "Swap the pills for the app's standard underlined tab bar.",
  },
  {
    id: 'noRightSidebar',
    label: 'No right sidebar',
    blurb: 'Drop the wallet column and centre the feed on the page. One column, nothing beside it.',
  },
];

export type HomeVariationState = Record<HomeVariation, boolean>;

const NO_VARIATIONS: HomeVariationState = {
  sidebarPost: false,
  underlineTabs: false,
  noRightSidebar: false,
};

const STORAGE_KEY = 'rh:home-scope-pattern';
const VARIATIONS_STORAGE_KEY = 'rh:home-variations';

const isScopePattern = (value: string | null): value is ScopePattern =>
  SCOPE_PATTERNS.some((pattern) => pattern.id === value);

/** Stored as the list of enabled ids so adding a variation defaults it to off. */
function readStoredVariations(): HomeVariationState {
  const raw = window.localStorage.getItem(VARIATIONS_STORAGE_KEY);
  if (!raw) return NO_VARIATIONS;

  let enabled: unknown;
  try {
    enabled = JSON.parse(raw);
  } catch {
    return NO_VARIATIONS;
  }
  if (!Array.isArray(enabled)) return NO_VARIATIONS;

  return HOME_VARIATIONS.reduce<HomeVariationState>(
    (state, variation) => ({ ...state, [variation.id]: enabled.includes(variation.id) }),
    NO_VARIATIONS
  );
}

/**
 * Scope state for the home hub plus the prototype's pattern and variation
 * selection. Both selections are persisted so a reload doesn't lose which
 * candidate you were evaluating; scope deliberately is not, so every session
 * starts unfiltered.
 */
export function useHomeScope() {
  const [pattern, setPatternState] = useState<ScopePattern>('sidebar');
  const [scope, setScope] = useState<HomeScope>('all');
  const [variations, setVariations] = useState<HomeVariationState>(NO_VARIATIONS);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isScopePattern(stored)) setPatternState(stored);
    setVariations(readStoredVariations());
  }, []);

  const toggleVariation = useCallback((id: HomeVariation) => {
    setVariations((current) => {
      const next = { ...current, [id]: !current[id] };
      window.localStorage.setItem(
        VARIATIONS_STORAGE_KEY,
        JSON.stringify(HOME_VARIATIONS.filter((variation) => next[variation.id]).map((v) => v.id))
      );
      return next;
    });
  }, []);

  const setPattern = useCallback((next: ScopePattern) => {
    setPatternState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    // The "no switch" pattern has no way back out of a scoped view, so reset.
    setScope('all');
  }, []);

  const toggleScope = useCallback(() => {
    setScope((current) => (current === 'mine' ? 'all' : 'mine'));
  }, []);

  return { scope, setScope, toggleScope, pattern, setPattern, variations, toggleVariation };
}
