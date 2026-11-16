import type { SetId } from '../theme';

export interface SetInfo {
  id: SetId;
  name: string;
  /** The direction in one phrase. */
  phrase: string;
  library: string;
  /** For the gallery: the idea, the library, its weight, and its fallback. */
  note: string;
  /** How the hero caption names the colours. */
  words: { a: string; b: string; w: string };
}

export const SETS: SetInfo[] = [
  {
    id: 'ink',
    name: 'Ink',
    phrase: 'Gold and ice light drawn on black ink.',
    library: 'Hand-written Canvas 2D and WebGL2',
    note: 'The current set. Every figure is a pure function of time drawn through a small pen: Canvas 2D for the questions, WebGL2 point sprites for the hero, and the same code renders the server-side SVG still. No library; about 10 KB gzipped of figure code. Fallback: the SVG still, frozen at the figure’s key moment, which is also what shows without JavaScript.',
    words: { a: 'Gold', b: 'blue', w: 'White' },
  },
  {
    id: 'poster',
    name: 'Poster',
    phrase: 'A risograph print in ResearchHub blue: grainy colour fields under flat ink diagrams.',
    library: 'Paper Shaders (@paper-design/shaders-react)',
    note: 'The page’s default, combining the figures Kobe picked into one set. Each figure is a printed sheet: a Paper shader lays a warm colour field (mesh gradient, grain gradient, god rays, dithering, dot grid), and the diagram prints over it in ResearchHub blue, fluorescent pink and indigo, multiplied like ink. The hero has three candidates (`?hero=a|b|c`; C, a powers-of-ten zoom from brain to tubulin, is the default) that share one idea: a part printed twice, blue and pink out of register, is two states at once, and in register it prints indigo, one outcome. Q1 is the Spectral figure redrawn as a halftone wave with “A” anesthetic molecules and a fast collapse; Q3 puts the two published decoherence estimates on one log-time ruler; Q5 is the Spectral tissue sheet printed in yellow cells, with gamma as a blue halftone at 0.8 Hz. Canvas 2D on top of Paper Shaders (the earlier bead hero adds one small WebGL2 shader), no three.js or OGL. Fallback: a captured frame of each figure (WebP).',
    words: { a: 'Blue', b: 'pink', w: 'Indigo' },
  },
  {
    id: 'clay',
    name: 'Clay',
    phrase: 'Soft clay models in a lavender studio, lit and turning.',
    library: 'three.js with React Three Fiber and drei',
    note: 'Each figure is a small physical model: tubulin as clay beads on a real 13-strand, 3-start helical lattice, the Wigner function as a lit relief, spacetime as a rubber sheet dented by a ball in two places, neurons as beads that pop on a shelf. three.js and React Three Fiber (MIT) with two drei helpers (contact shadows, rounded box): 256 KB gzipped, loaded only with this set. Fallback: a captured frame of each model.',
    words: { a: 'Apricot', b: 'teal', w: 'Violet' },
  },
  {
    id: 'spectral',
    name: 'Spectral',
    phrase: 'Interference light: wave fields in iridescent colour on midnight.',
    library: 'OGL with hand-written GLSL',
    note: 'Each figure is one full-frame fragment shader, so the picture is computed per pixel as a field: superposition literally interferes in thin-film colour, coherence shows as fringes that wash out, spacetime as a lensed grid, firing as a pulsing tissue. OGL (Unlicense), a minimal WebGL wrapper, plus six hand-written shaders: 26 KB gzipped in all. Fallback: a captured frame of each field.',
    words: { a: 'Magenta', b: 'cyan', w: 'White' },
  },
  {
    id: 'engraved',
    name: 'Engraved',
    phrase: 'A hand-coloured engraved plate from an old scientific atlas.',
    library: 'd3-contour on Canvas 2D',
    note: 'Each figure is a plate from an old atlas: sepia line engraving (hatching, cross-hatching, stipple, contour terraces from d3-contour) with madder and Prussian-blue watercolour washes, plate numbers and italic labels in IM Fell English. Canvas 2D with d3-contour (ISC): 18 KB gzipped, no WebGL needed. Fallback: a captured frame of each plate.',
    words: { a: 'Red', b: 'blue', w: 'Sepia' },
  },
  {
    id: 'micrograph',
    name: 'Micrograph',
    phrase: 'A false-colour electron micrograph: grey relief, painted chartreuse and violet.',
    library: 'three.js with React Three Fiber and postprocessing',
    note: 'Each figure is an electron micrograph: grey secondary-electron relief (rim-lit, ambient occlusion via N8AO, film noise, depth of field) with false colour painted only where it means something, plus a scale bar and an instrument strip. three.js and React Three Fiber with @react-three/postprocessing: 360 KB gzipped (three.js is shared with Clay when both load). Fallback: a captured frame of each micrograph.',
    words: { a: 'Chartreuse', b: 'violet', w: 'White' },
  },
];

export const SET_INFO = Object.fromEntries(SETS.map((s) => [s.id, s])) as Record<SetId, SetInfo>;
