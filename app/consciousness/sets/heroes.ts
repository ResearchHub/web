/**
 * The hero candidates on the Poster page, picked with `?hero=`. Kobe asked
 * for a different hero visual without a direction, so there were three (A–C),
 * then two more about consciousness itself (D, E), then three more in
 * D's direction (F, G, H), then three with a whole person (I, J, K),
 * then four abstract ones (L–O), then three on wave superposition (P–R);
 * the default is the one recommended. `beads` is the earlier hero (the Ink
 * set's microtubule painted as beads), kept for comparison.
 */

export const HERO_IDS = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  'beads',
] as const;
export type HeroId = (typeof HERO_IDS)[number];

export const DEFAULT_HERO: HeroId = 'p';

export interface HeroInfo {
  name: string;
  /** The idea in one sentence (for the switcher's title). */
  idea: string;
  /** The small caption at the hero's lower right on wide screens. */
  caption: string;
}

export const HERO_INFO: Record<HeroId, HeroInfo> = {
  a: {
    name: 'Two plates',
    idea: 'A neuron printed once in indigo; the microtubules inside it printed twice, blue and pink, out of register (two states at once) until they snap into register (one outcome).',
    caption:
      'A neuron and the microtubules inside it, printed in two inks. Out of register: two states at once. In register: one outcome. Schematic.',
  },
  b: {
    name: 'Ring of 13',
    idea: 'Looking down a microtubule: the 13-strand ring and its tunnel, the ring’s state printed twice and turning into register.',
    caption:
      'Looking down a microtubule: 13 strands of tubulin round a hollow core. Blue and pink: two states at once. In register: one outcome. Schematic.',
  },
  c: {
    name: 'Powers of ten',
    idea: 'Brain, neuron, microtubule, tubulin: four loupes stepping down in scale to the one claim being tested.',
    caption:
      'From brain to neuron to microtubule to tubulin. Orch OR places a quantum process at the smallest step. Schematic.',
  },
  d: {
    name: 'Moments',
    idea: 'A head in profile; moments of experience form in the brain, each printed blue and pink until it snaps into one indigo picture, and stream away.',
    caption:
      'Orch OR proposes that each collapse in the brain’s microtubules is a moment of experience, and a stream of them is consciousness. Slowed about a hundredfold. Schematic.',
  },
  e: {
    name: 'Face or vase',
    idea: 'Rubin’s face–vase figure: two faces (blue, pink) or a vase built of a microtubule lattice; you see one at a time.',
    caption:
      'Two faces or a vase made of a microtubule: the picture holds both, but you see one at a time. An analogy for experience settling on one reading, not evidence. Schematic.',
  },
  f: {
    name: 'Film',
    idea: 'Experience as a film running through the present: frames to come hold two possible pictures (blue, pink); at “now” one wins and prints indigo; the strip’s edges are tubulin.',
    caption:
      'Frames still to come hold two possible pictures; at the present one is seen. Orch OR proposes each such moment is a collapse in the brain’s microtubules. Slowed about a hundredfold. Schematic.',
  },
  g: {
    name: 'Eye',
    idea: 'An eye whose iris is a microtubule’s ring of 13 tubulins, printed blue and pink until it snaps into register as the eye fixes on something.',
    caption:
      'An eye with a microtubule’s ring of 13 tubulins for an iris. Orch OR asks whether seeing, like every experience, rests on collapses inside the brain’s microtubules. Schematic.',
  },
  h: {
    name: 'Inner world',
    idea: 'A head in profile holding a whole scene, printed in halftone dots that are tubulin: two possible worlds (blue, pink) settle into one (indigo).',
    caption:
      'The world you experience, printed in tubulin: two possible scenes at once, then one. Orch OR proposes experience is built from collapses in the brain’s microtubules. Schematic.',
  },
  i: {
    name: 'Orchestrated',
    idea: 'A bust drawn as strands of tubulin from chest to brain; signals run out of step in blue and pink, fall into step, reach the brain together in indigo, and the head lights up.',
    caption:
      'A person drawn as microtubules. Signals out of step, then in step: Orch OR proposes that when collapses in the brain’s microtubules are orchestrated, there is a moment of experience. Schematic.',
  },
  j: {
    name: 'Sitting',
    idea: 'A person sitting cross-legged, nerves drawn as tubulin; signals rise blue and pink, meet in the head in indigo, and a ring of 13 tubulins widens out from it.',
    caption:
      'Signals rise through a person’s nervous system and meet in the brain; each meeting sends out a ring of 13 tubulins, a microtubule’s cross-section. One moment every 4 s. Schematic.',
  },
  k: {
    name: 'The view',
    idea: 'A person from behind looking at a landscape; a cut-away in their head shows a microtubule. Landscape and lattice are printed blue and pink apart, then settle into register together.',
    caption:
      'A microtubule in the back of the head and the view in front: both printed twice, then settling together. Orch OR proposes what we experience settles with the microtubules. Schematic.',
  },
  l: {
    name: 'Moiré',
    idea: 'Abstract: two sets of rings, blue and pink, centres apart, making a moiré; they slide together into one indigo target, then drift apart.',
    caption:
      'Two sets of rings, two states at once: where they cross, a moiré. In register, one indigo target, one outcome. Abstract; schematic.',
  },
  m: {
    name: 'Field',
    idea: 'Abstract: a field of tubulin whose blue and pink marks wander out of step; agreement spreads from one point until the whole field prints indigo.',
    caption:
      'A field of tubulin, each holding two states out of step. Orch OR proposes that when many agree at once there is a moment of experience. Abstract; schematic.',
  },
  n: {
    name: 'Two places',
    idea: 'Abstract: Penrose’s objective reduction. One mass splits into two places (blue, pink); a clock fills faster the further apart; when full, both land in one place, indigo.',
    caption:
      'A mass in two places at once. Penrose: the further apart, the sooner the state reduces to one place (τ ≈ ℏ/E_G). Orch OR places this inside microtubules. Schematic.',
  },
  o: {
    name: 'Pulse',
    idea: 'Abstract: a trace of bars, one per moment; the newest is a blue and a pink bar of different heights that settle into one indigo bar.',
    caption:
      'A trace of moments, newest at right: two possible heights settle into one. Orch OR proposes each moment of experience is such a settling in the brain’s microtubules. Abstract; schematic.',
  },
  p: {
    name: 'Superposition',
    idea: 'A tubulin in a microtubule (13 protofilaments of α and β tubulin, turning slowly) in two states: blue and pink wave packets, each carrying the moment it would be; as they pull apart one vanishes, and the survivor becomes an indigo moment that rises away.',
    caption:
      'A tubulin in a microtubule, in two states at once. As they pull apart, gravity makes the superposition unstable and it reduces to one. Orch OR proposes this is a moment of experience. Slowed down. Schematic.',
  },
  q: {
    name: 'Interference',
    idea: 'Two waves spreading from two points, printed as blue and pink halftone; their crests overprint indigo as an interference pattern, which pulls into one point and releases a moment.',
    caption:
      'Two waves interfering: indigo where their crests meet. The superposition reduces to one point, and out of it, Orch OR proposes, comes a moment of experience. Schematic.',
  },
  r: {
    name: 'Mind waves',
    idea: 'Interfering waves (blue, pink halftone) inside a head; the superposition reduces to one point in the brain, which flares, and a moment of experience rises out through the crown.',
    caption:
      'Waves in superposition inside the brain, reducing to one point. Orch OR proposes each such reduction in the brain’s microtubules is a moment of experience. Schematic.',
  },
  beads: {
    name: 'Beads (before)',
    idea: 'The earlier hero: the Ink set’s microtubule painted as beads.',
    caption:
      'A microtubule, drawn schematically. Blue and pink: two states at once. Indigo: a collapse.',
  },
};

export function parseHero(value: unknown): HeroId {
  const v = Array.isArray(value) ? value[0] : value;
  return (HERO_IDS as readonly unknown[]).includes(v) ? (v as HeroId) : DEFAULT_HERO;
}

/** The hero's captured stills, wide and phone: `public/consciousness/sets/poster/<file>`. */
export const heroStillName = (hero: HeroId) => (hero === 'beads' ? 'hero' : `hero-${hero}`);
