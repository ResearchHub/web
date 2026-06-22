/**
 * Catalyst NYC conference palette, sampled from the event brand extract. These
 * violet accents sit on top of ResearchHub's otherwise light auth surfaces so
 * the in-person attendee experience reads as co-branded without forking the
 * whole theme.
 */
export const CATALYST_COLORS = {
  glowViolet: '#7B43BE',
  royalViolet: '#5A2DB0',
  deepIndigo: '#3A1F86',
  twilight: '#20104E',
  plumBlack: '#0C0720',
  accentViolet: '#7C3AED',
  white: '#FFFFFF',
} as const;

/** Signature radial violet field from the brand extract (light-source top-left). */
export const CATALYST_GRADIENT =
  'radial-gradient(98% 78% at 22% 26%, #7B43BE 0%, #5A2DB0 26%, #3A1F86 48%, #20104E 72%, #0C0720 100%)';

export const CATALYST_TAGLINE = 'The Future of Translational Science';
