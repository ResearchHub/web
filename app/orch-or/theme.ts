/**
 * The page's palettes, in one place. The page uses the active one as CSS
 * variables (`--o-*`, set on `.orch` by OrchShell), and the figures use the
 * same values as RGB. Change a colour here and the page and every figure in
 * that set follow.
 *
 * There is one palette per graphic set (`?set=` on /orch-or): the page
 * chrome follows the set, so each set is seen on its own ground. In every
 * set, gold and ice are the two branches of a superposition in the figures,
 * and on the page "would support it" (gold) and "would count against it"
 * (ice); they are equally strong, so neither reads as the right answer.
 * White is a single, classical outcome (on the light sets it is a dark ink).
 */

export const SET_IDS = ['ink', 'poster', 'clay', 'spectral', 'engraved', 'micrograph'] as const;
export type SetId = (typeof SET_IDS)[number];

export interface Theme {
  ink: string; // page background
  ink2: string; // raised surfaces: dock, menus
  text: string; // headings, primary text
  soft: string; // body text
  mute: string; // captions, metadata
  gold: string; // primary action · branch A · would support it
  ice: string; // branch B · would count against it
  white: string; // one outcome, ordinary matter
  dim: string; // figure scaffolding
  open: string; // "open" status dot
  onGold: string; // text on a gold button
  accent: string; // a third colour some figures use for fields and light
  goldDeep?: string; // the primary colour pressed or hovered
  fire?: string; // a neuron firing (Q6); falls back to `white`
}

/**
 * Each set's display type: headlines, numerals and the gold phrase. The
 * families are loaded once in layout.tsx as CSS variables.
 */
export interface DisplayType {
  family: string; // a CSS font-family list
  weight: number;
  tracking: string; // letter-spacing
  emStyle: 'italic' | 'normal';
  emWeight: number;
}

export const THEMES: Record<SetId, Theme> = {
  // Gold and ice light on black ink (the original set).
  ink: {
    ink: '#05060c',
    ink2: '#0b0d18',
    text: '#ece9e1',
    soft: '#bcc0d0',
    mute: '#8c91a8',
    gold: '#f4c870',
    ice: '#7ab4ff',
    white: '#f6f3ec',
    dim: '#969fbc',
    open: '#7ee2a8',
    onGold: '#05060c',
    accent: '#f4c870',
  },
  // A risograph poster in ResearchHub blue and fluorescent pink on warm
  // paper, with a sunflower yellow for the colour fields. The pink is set to
  // the blue's lightness and chroma (OKLCH 0.62/0.22 against 0.60/0.22), so
  // the two outcomes in every figure weigh the same.
  poster: {
    ink: '#f4ede0',
    ink2: '#ebe2d1',
    text: '#1d1b2c',
    soft: '#45405a',
    mute: '#76708a',
    gold: '#3971ff', // rhBlue 500 (app/styles/colors.ts)
    goldDeep: '#2563eb', // rhBlue 600
    ice: '#e8336f',
    white: '#2b2275',
    dim: '#8c84a0',
    open: '#12985a',
    onGold: '#ffffff',
    accent: '#ffc83d',
    // Pink printed over the yellow: a red, for neurons firing.
    fire: '#e8281b',
  },
  // Soft clay models in a lavender studio: apricot and teal, violet matter.
  clay: {
    ink: '#ece7f7',
    ink2: '#e1daf1',
    text: '#221d3b',
    soft: '#4a4468',
    mute: '#7a7398',
    gold: '#f9733b',
    ice: '#13a891',
    white: '#5b4fd1',
    dim: '#a39cc4',
    open: '#13a85e',
    onGold: '#fffaf6',
    accent: '#ffd36b',
  },
  // A hand-coloured engraved plate: sepia ink on parchment, washed with
  // madder red and Prussian blue.
  engraved: {
    ink: '#f1e7d0',
    ink2: '#e7dbbf',
    text: '#2b2119',
    soft: '#4f4236',
    mute: '#7d6d5a',
    gold: '#c2412d',
    ice: '#28598f',
    white: '#2b2119',
    dim: '#a8977a',
    open: '#3f7d3a',
    onGold: '#fbf4e4',
    accent: '#d9a03f',
  },
  // A false-colour electron micrograph: grey-scale relief on charcoal,
  // with chartreuse and violet painted on.
  micrograph: {
    ink: '#16171a',
    ink2: '#202226',
    text: '#eceae6',
    soft: '#bdbcb8',
    mute: '#8d8c88',
    gold: '#cdf04a',
    ice: '#b57bff',
    white: '#f2f0ea',
    dim: '#8f8e8a',
    open: '#7ee2a8',
    onGold: '#16171a',
    accent: '#ff8a4c',
  },
  // Interference light on midnight: magenta and cyan, iridescent between.
  spectral: {
    ink: '#07061a',
    ink2: '#0f0d27',
    text: '#f2effd',
    soft: '#c4bfe0',
    mute: '#8e88b4',
    gold: '#ff5cc8',
    ice: '#4fe0ff',
    white: '#f7f5ff',
    dim: '#8f8ab8',
    open: '#7dffad',
    onGold: '#07061a',
    accent: '#ffd86e',
  },
};

export const DISPLAY: Record<SetId, DisplayType> = {
  ink: {
    family: 'var(--font-orch-serif), Georgia, serif',
    weight: 340,
    tracking: '-0.022em',
    emStyle: 'italic',
    emWeight: 320,
  },
  poster: {
    family: 'var(--font-orch-poster), system-ui, sans-serif',
    weight: 720,
    tracking: '-0.035em',
    emStyle: 'normal',
    emWeight: 800,
  },
  clay: {
    family: 'var(--font-orch-clay), system-ui, sans-serif',
    weight: 560,
    tracking: '-0.015em',
    emStyle: 'normal',
    emWeight: 620,
  },
  spectral: {
    family: 'var(--font-orch-spectral), Georgia, serif',
    weight: 400,
    tracking: '-0.01em',
    emStyle: 'italic',
    emWeight: 400,
  },
  engraved: {
    family: 'var(--font-orch-engraved), Georgia, serif',
    weight: 400,
    tracking: '-0.005em',
    emStyle: 'italic',
    emWeight: 400,
  },
  micrograph: {
    family: 'var(--font-orch-micrograph), system-ui, sans-serif',
    weight: 500,
    tracking: '-0.03em',
    emStyle: 'normal',
    emWeight: 500,
  },
};

/** The set `/orch-or` opens in when no `?set=` is given. */
export const DEFAULT_SET: SetId = 'poster';

/** The original palette, which the original figures read. */
export const THEME = THEMES.ink;

export type ThemeKey = keyof Theme;

export function parseSet(value: unknown): SetId {
  const v = Array.isArray(value) ? value[0] : value;
  return (SET_IDS as readonly unknown[]).includes(v) ? (v as SetId) : DEFAULT_SET;
}

export const isLightSet = (set: SetId) => set === 'poster' || set === 'clay' || set === 'engraved';

export function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** CSS variables for a set: `--o-gold: #f4c870` and `--o-gold-rgb: 244 200 112`. */
export function themeVars(set: SetId = DEFAULT_SET): Record<string, string> {
  const vars: Record<string, string> = { colorScheme: isLightSet(set) ? 'light' : 'dark' };
  for (const [key, hex] of Object.entries(THEMES[set])) {
    if (!hex) continue;
    vars[`--o-${key}`] = hex;
    vars[`--o-${key}-rgb`] = hexToRgb(hex).join(' ');
  }
  const d = DISPLAY[set];
  vars['--o-display'] = d.family;
  vars['--o-display-weight'] = String(d.weight);
  vars['--o-display-track'] = d.tracking;
  vars['--o-em-style'] = d.emStyle;
  vars['--o-em-weight'] = String(d.emWeight);
  return vars;
}
