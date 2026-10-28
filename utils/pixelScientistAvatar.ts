type Cell = [x: number, y: number, code: string];
type CodeGrid = string[][];
type Tint = { tint: string; alpha: number };
type Palette = Record<string, string | Tint>;
type Span = [left: number, right: number];

interface Sprite {
  start: number;
  rows: string[];
}

type Drawing = Sprite | { cells: Cell[] };
type ColoredDrawing = Drawing & { colors: Palette };

interface LayerOptions {
  rim?: 'hair' | 'skin';
  features?: Cell[];
}

// Parts are authored on the 24 grid and upscaled to the 48 grid; face features are drawn at 48.
const GRID = 24;
const HI_RES = GRID * 2;
const OUTLINE = '#1b1b2f';
const WHITE = '#ffffff';
const LIT_SIDE_END = 26;
const UNOUTLINED_CODES = new Set(['w', 'g', 'i', 'I']);
const NEIGHBOR_OFFSETS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const HAIR_COLORS = ['#2b2b2b', '#4a3121', '#7b4a2a', '#a0452b', '#e3c16f', '#a8a8a8', '#f2f2f2'];
const BACKGROUND_COLORS = [
  '#8ecae6',
  '#ffb4a2',
  '#cdb4db',
  '#b9fbc0',
  '#ffd166',
  '#a0c4ff',
  '#f4a261',
  '#90be6d',
];

type HeadShape = 'oval' | 'round' | 'long' | 'square' | 'narrow';

// Each shape lists the face's left and right edge on the rows where the width changes.
const HEAD_SHAPES: Record<HeadShape, Record<number, Span>> = {
  oval: { 6: [8, 15], 7: [7, 16], 11: [6, 17], 14: [7, 16], 18: [8, 15], 19: [10, 13] },
  round: {
    6: [8, 15],
    7: [7, 16],
    11: [6, 17],
    14: [6, 17],
    17: [7, 16],
    18: [9, 14],
    19: [10, 13],
  },
  long: { 6: [8, 15], 7: [7, 16], 11: [6, 17], 14: [7, 16], 18: [8, 15], 19: [9, 14] },
  square: { 6: [8, 15], 7: [7, 16], 11: [6, 17], 14: [7, 16], 19: [10, 13] },
  narrow: { 6: [9, 14], 7: [8, 15], 11: [7, 16], 14: [8, 15], 18: [9, 14], 19: [10, 13] },
};

const drawLine = (y: number, fromX: number, toX: number, code: string): Cell[] =>
  Array.from({ length: toX - fromX + 1 }, (_, i) => [fromX + i, y, code]);

// The face centre sits between x=23 and x=24 on the 48 grid.
const mirrorAcrossFace = (cells: Cell[]): Cell[] =>
  cells.flatMap(([x, y, code]) => [
    [x, y, code],
    [HI_RES - 1 - x, y, code],
  ]);

// Eyes are copied rather than mirrored so both catchlights sit on the same side.
const copyToRightEye = (cells: Cell[]): Cell[] =>
  cells.flatMap(([x, y, code]) => [
    [x, y, code],
    [x + 10, y, code],
  ]);

const FACE_FEATURES = {
  eyes: {
    dot: copyToRightEye([
      [18, 22, 'W'],
      [19, 22, 'E'],
      ...drawLine(23, 18, 19, 'E'),
      ...drawLine(24, 18, 19, 'E'),
      ...drawLine(21, 17, 20, 'l'),
    ]),
    droopy: copyToRightEye([
      [18, 23, 'W'],
      [19, 23, 'E'],
      ...drawLine(24, 18, 19, 'E'),
      ...drawLine(22, 17, 20, 'l'),
      ...drawLine(26, 17, 20, 's'),
    ]),
  },
  brows: {
    thin: mirrorAcrossFace([...drawLine(19, 17, 20, 'B'), [16, 20, 'B']]),
    heavy: mirrorAcrossFace([...drawLine(18, 16, 20, 'B'), ...drawLine(19, 15, 21, 'B')]),
  },
  nose: {
    small: [[24, 26, 's'], [24, 27, 's'], ...drawLine(28, 23, 25, 's')],
    long: [
      [24, 22, 's'],
      [24, 23, 's'],
      [24, 24, 's'],
      [24, 25, 's'],
      [24, 26, 's'],
      [25, 27, 's'],
      ...drawLine(28, 22, 25, 's'),
    ],
    big: [
      [24, 23, 's'],
      [24, 24, 's'],
      [25, 25, 's'],
      [25, 26, 's'],
      [26, 27, 's'],
      [21, 27, 's'],
      [21, 28, 's'],
      [22, 28, 'n'],
      ...drawLine(28, 23, 24, 's'),
      [25, 28, 'n'],
      [26, 28, 's'],
    ],
    wide: [
      [24, 25, 's'],
      [24, 26, 's'],
      [20, 27, 's'],
      [27, 27, 's'],
      [20, 28, 's'],
      [21, 28, 'n'],
      ...drawLine(28, 22, 25, 's'),
      [26, 28, 'n'],
      [27, 28, 's'],
    ],
  },
  mouth: {
    line: [...drawLine(32, 20, 27, 'M'), ...drawLine(33, 22, 25, 's')],
    small: [...drawLine(32, 22, 25, 'M'), ...drawLine(33, 23, 24, 's')],
    smile: mirrorAcrossFace([
      [19, 30, 'M'],
      [20, 31, 'M'],
      ...drawLine(32, 21, 23, 'M'),
      ...drawLine(33, 22, 23, 'm'),
    ]),
  },
  extra: {
    wrinkles: mirrorAcrossFace([...drawLine(15, 19, 23, 's'), ...drawLine(17, 20, 23, 's')]),
    cheekbones: mirrorAcrossFace([
      [15, 29, 's'],
      [16, 30, 's'],
      [17, 31, 's'],
    ]),
    blush: mirrorAcrossFace([...drawLine(28, 15, 17, 'c'), ...drawLine(29, 15, 17, 'c')]),
    jowls: mirrorAcrossFace([
      [16, 33, 's'],
      [16, 34, 's'],
      [17, 35, 's'],
      [17, 36, 's'],
    ]),
  },
} satisfies Record<string, Record<string, Cell[]>>;

interface Head {
  skin: string;
  shape: HeadShape;
  eyes: keyof typeof FACE_FEATURES.eyes;
  brows: keyof typeof FACE_FEATURES.brows;
  nose: keyof typeof FACE_FEATURES.nose;
  mouth: keyof typeof FACE_FEATURES.mouth;
  extra?: (keyof typeof FACE_FEATURES.extra)[];
}

// Each head is one scientist's face; it sets the face shape, features, and skin tone.
const HEADS = Object.values<Head>({
  albertEinstein: {
    skin: '#f2d3bc',
    shape: 'round',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'big',
    mouth: 'line',
    extra: ['wrinkles'],
  },
  marieCurie: {
    skin: '#f6dccb',
    shape: 'narrow',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'small',
  },
  isaacNewton: {
    skin: '#f3d6c0',
    shape: 'long',
    eyes: 'dot',
    brows: 'thin',
    nose: 'long',
    mouth: 'small',
  },
  nikolaTesla: {
    skin: '#efd2bb',
    shape: 'narrow',
    eyes: 'droopy',
    brows: 'thin',
    nose: 'long',
    mouth: 'line',
    extra: ['cheekbones'],
  },
  charlesDarwin: {
    skin: '#f0cdb2',
    shape: 'oval',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'big',
    mouth: 'line',
    extra: ['wrinkles'],
  },
  rosalindFranklin: {
    skin: '#f5d9c6',
    shape: 'oval',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
  },
  adaLovelace: {
    skin: '#f8e0d0',
    shape: 'narrow',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'small',
    extra: ['blush'],
  },
  janeGoodall: {
    skin: '#f1cfb4',
    shape: 'long',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
  },
  richardFeynman: {
    skin: '#efcfb2',
    shape: 'square',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'long',
    mouth: 'smile',
  },
  galileoGalilei: {
    skin: '#e8c0a0',
    shape: 'long',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'long',
    mouth: 'line',
    extra: ['wrinkles'],
  },
  carlSagan: {
    skin: '#eecaa8',
    shape: 'square',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'big',
    mouth: 'smile',
  },
  thomasEdison: {
    skin: '#f0d0b8',
    shape: 'square',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'small',
    mouth: 'line',
  },
  benjaminFranklin: {
    skin: '#f2d0b8',
    shape: 'round',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'small',
    extra: ['blush', 'jowls'],
  },
  katherineJohnson: {
    skin: '#8a5a3c',
    shape: 'round',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
  },
  georgeWashingtonCarver: {
    skin: '#5e3a24',
    shape: 'long',
    eyes: 'dot',
    brows: 'thin',
    nose: 'long',
    mouth: 'line',
    extra: ['cheekbones'],
  },
  srinivasaRamanujan: {
    skin: '#8c5a3a',
    shape: 'round',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'wide',
    mouth: 'small',
  },
  cvRaman: {
    skin: '#9a6644',
    shape: 'oval',
    eyes: 'droopy',
    brows: 'thin',
    nose: 'big',
    mouth: 'smile',
  },
  chienShiungWu: {
    skin: '#f1cfa4',
    shape: 'oval',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'small',
    extra: ['blush'],
  },
  hidekiYukawa: {
    skin: '#eec79c',
    shape: 'long',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'small',
    mouth: 'line',
  },
  abdusSalam: {
    skin: '#a87450',
    shape: 'round',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'wide',
    mouth: 'line',
    extra: ['jowls'],
  },
  percyJulian: {
    skin: '#6d4430',
    shape: 'oval',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
    extra: ['cheekbones'],
  },
});

const HAIRSTYLES: Sprite[] = [
  // Albert Einstein's wild hair
  {
    start: 2,
    rows: [
      '.....H..H..HH..H..H.....',
      '....HHH.HHHHHHHH.HHH....',
      '...HHHHHHHHHHHHHHHHHH...',
      '..HHHHHhhHHHHHHhhHHHHH..',
      '..HHHHHH........HHHHHH..',
      '.HHHHHh..........hHHHHH.',
      '..HHHHh..........hHHHH..',
      '.HHHHHh..........hHHHHH.',
      '..HHHhh..........hhHHH..',
      '...HHhh..........hhHH...',
      '..HHHh............hHHH..',
      '...HH..............HH...',
    ],
  },
  // Marie Curie's top bun
  {
    start: 1,
    rows: [
      '..........HHHH..........',
      '.........HHhhHH.........',
      '........HHHHHHHH........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '.....HHHHhhhhhhHHHH.....',
      '.....HHH........HHH.....',
      '.....HH..........HH.....',
      '......H..........H......',
    ],
  },
  // Isaac Newton's curly wig
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHhhHHHH.......',
      '......HHHHHhhHHHHH......',
      '.....HHHHHhhhhHHHHH.....',
      '....HHHh........hHHH....',
      '....HhHH........HHhH....',
      '...HHHh..........hHHH...',
      '...HhHH..........HHhH...',
      '...HHHh..........hHHH...',
      '...HhHH..........HHhH...',
      '...HHHh..........hHHH...',
      '...HhHH..........HHhH...',
      '...HHHh..........hHHH...',
      '...HhHH..........HHhH...',
      '...HHHh..........hHHH...',
      '....HhH..........HhH....',
      '....HH............HH....',
    ],
  },
  // Nikola Tesla's centre part
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHhhHHHH.......',
      '......HHHHHhhHHHHH......',
      '......HHHHhhhhHHHH......',
      '......HH........HH......',
      '......HH........HH......',
      '......H..........H......',
    ],
  },
  // Charles Darwin's shiny dome
  {
    start: 7,
    rows: [
      '.........ww.............',
      '......HH........HH......',
      '.....HHH........HHH.....',
      '.....HHh........hHH.....',
      '.....Hh..........hH.....',
    ],
  },
  // Rosalind Franklin's side-swept bob
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '......HHHHHHHHHhhHH.....',
      '......HHHHHh.....HHH....',
      '......HHHh........HH....',
      '......HH..........HH....',
      '......HH.........HHH....',
      '.....HHH.........HHH....',
      '.....HH...........HH....',
    ],
  },
  // Ada Lovelace's ringlets
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHhhHHHH.......',
      '......HHHHHhhHHHHH......',
      '.....HHHHHHhhHHHHHH.....',
      '.....HHH........HHH.....',
      '....HHHH........HHHH....',
      '...HHhHH........HHhHH...',
      '...HhHh..........hHhH...',
      '...HHhH..........HhHH...',
      '...HhHh..........hHhH...',
      '....HH............HH....',
    ],
  },
  // Jane Goodall's ponytail
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '......HHHhhhhhhHHHH.....',
      '......HH........HHHHH...',
      '......HH.........HHHHH..',
      '......H...........HhHH..',
      '..................HHhH..',
      '...................HHH..',
      '...................HhH..',
      '....................HH..',
      '....................H...',
    ],
  },
  // Richard Feynman's swept-back waves
  {
    start: 2,
    rows: [
      '........HH..HHH.........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '.....HHHHhHHHHhHHHH.....',
      '.....HHHhhhhhhhhHHH.....',
      '.....HHH........HHH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '......H..........H......',
    ],
  },
  // Katherine Johnson's short curls
  {
    start: 3,
    rows: [
      '.........HhHhHH.........',
      '.......HhHhHhHhHh.......',
      '......hHhHhHhHhHhH......',
      '......HhHhHhHhHhHh......',
      '......hH........Hh......',
      '......Hh........hH......',
      '......h..........h......',
    ],
  },
  // Srinivasa Ramanujan's side part
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHHHHHHH.......',
      '......HHHhHHHHHHHH......',
      '......HHhhHHHHHHHHH.....',
      '......HH........HHH.....',
      '......HH.........HH.....',
      '......H..........H......',
    ],
  },
  // George Washington Carver's close crop
  {
    start: 4,
    rows: [
      '.........HhHhHh.........',
      '.......hHhHhHhHhH.......',
      '......HhHhHhHhHhHh......',
      '......Hh........hH......',
      '......h..........h......',
    ],
  },
  // Chien-Shiung Wu's tucked bob
  {
    start: 3,
    rows: [
      '.........HHHHHH.........',
      '.......HHHHHHHHHH.......',
      '......HHHHHHHHHHHH......',
      '.....HHHHhhhHHHHHHH.....',
      '.....HHH........HHH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '.....HH..........HH.....',
      '.....hHH........HHh.....',
      '......hh........hh......',
    ],
  },
];

const FACIAL_HAIR: Sprite[] = [
  // Albert Einstein's walrus moustache
  {
    start: 15,
    rows: ['........HHHHHHHH........', '.......HHhHHHHhHH.......', '.......HH......HH.......'],
  },
  // Nikola Tesla's neat moustache
  { start: 15, rows: ['.........HHHHHH.........'] },
  // Charles Darwin's great beard
  {
    start: 13,
    rows: [
      '......H..........H......',
      '......HH........HH......',
      '......HHHHHHHHHHHH......',
      '......HHHH....HHHH......',
      '......HHHHHHHHHHHH......',
      '......HHhHHHHHHhHH......',
      '.......HHHhHHhHHH.......',
      '........HHHHHHHH........',
      '.........HHhhHH.........',
      '..........HHHH..........',
    ],
  },
  // Galileo Galilei's pointed beard
  {
    start: 15,
    rows: [
      '........HHHHHHHH........',
      '........HH....HH........',
      '.........HHHHHH.........',
      '.........HHHHHH.........',
      '..........HhhH..........',
      '...........HH...........',
    ],
  },
  // George Washington Carver's trim moustache
  { start: 15, rows: ['..........HHHH..........'] },
];

// Drawn directly on the 48 grid: two rounded lenses, a bridge, and a strap.
const drawGoggles = (): Cell[] => {
  const lens = [
    '..FFFFFF..',
    '.FffffffF.',
    'FfGGGGGGfF',
    'FfgGGGGGfF',
    'FfGgGGGGfF',
    'FfGGGGGGfF',
    'FfGGGGGGfF',
    'FfGGGGGGfF',
    '.FffffffF.',
    '..FFFFFF..',
  ];
  const cells: Cell[] = [];
  for (const left of [13, 25]) {
    lens.forEach((row, dy) =>
      [...row].forEach((code, dx) => {
        if (code !== '.') cells.push([left + dx, 19 + dy, code]);
      })
    );
  }
  for (let y = 22; y <= 24; y++) {
    cells.push(
      ...drawLine(y, 23, 24, 'F'),
      ...drawLine(y, 9, 12, 'T'),
      ...drawLine(y, 35, 38, 'T')
    );
  }
  return cells;
};

const EYEWEAR: ColoredDrawing[] = [
  // Benjamin Franklin's wire spectacles
  {
    colors: { F: '#c9a227', g: WHITE },
    start: 10,
    rows: [
      '........FFF..FFF........',
      '......FFg..FFg..FF......',
      '.......F...FF...F.......',
      '........FFF..FFF........',
    ],
  },
  // Katherine Johnson's cat-eye glasses
  {
    colors: { F: '#5a2d2d', g: WHITE },
    start: 9,
    rows: [
      '......F..........F......',
      '......FFFFF..FFFFF......',
      '.......Fg..FFg..F.......',
      '.......F...FF...F.......',
      '........FFF..FFF........',
    ],
  },
  // Safety goggles; the tinted lenses let the eyes show through.
  {
    colors: {
      F: '#2f3e4e',
      f: '#6b8fb3',
      T: '#3a3a42',
      G: { tint: '#c8ecff', alpha: 0.45 },
      g: WHITE,
    },
    cells: drawGoggles(),
  },
  // Hideki Yukawa's round glasses
  {
    colors: { F: '#222222', g: WHITE },
    start: 10,
    rows: [
      '.......FFFF..FFFF.......',
      '......FFg..FFg..FF......',
      '.......F...FF...F.......',
      '.......FFFF..FFFF.......',
    ],
  },
];

const COLLARED_CUT: Sprite = {
  start: 20,
  rows: [
    '.....CCCCcTssTcCCCC.....',
    '....CCCCCCcTTcCCCCCC....',
    '...CCCCCCCCXXCCCCCCCC...',
    '...CCCCCCCCXXCCCCCCCC...',
  ],
};
const TURTLENECK_CUT: Sprite = {
  start: 19,
  rows: [
    '..........TTTT..........',
    '.....CCCCcTTTTcCCCC.....',
    '....CCCCCCcTTcCCCCCC....',
    '...CCCCCCCCTTCCCCCCCC...',
    '...CCCCCCCCTTCCCCCCCC...',
  ],
};
const QIPAO_CUT: Sprite = {
  start: 19,
  rows: [
    '..........TTTT..........',
    '.....CCCCCTTTTCCCCC.....',
    '....CCCCCCCCCXCCCCCC....',
    '...CCCCCCCCCCCXCCCCCC...',
    '...CCCCCCCCCCCCXCCCCC...',
  ],
};

const OUTFITS: ColoredDrawing[] = [
  // Lab coat
  { ...COLLARED_CUT, colors: { C: '#f4f4f6', c: '#c4c4d0', T: '#7aa6c2', X: '#c4c4d0' } },
  // Albert Einstein's grey cardigan
  { ...COLLARED_CUT, colors: { C: '#8a7f72', c: '#6b6157', T: '#f4f4f4', X: '#6b6157' } },
  // Nikola Tesla's suit and tie
  { ...COLLARED_CUT, colors: { C: '#2b2d42', c: '#15162a', T: '#f4f4f4', X: '#9d2235' } },
  // Marie Curie's black dress
  { ...COLLARED_CUT, colors: { C: '#33333d', c: '#1e1e26', T: '#e9e4d8', X: '#1e1e26' } },
  // Carl Sagan's turtleneck and blazer
  { ...TURTLENECK_CUT, colors: { C: '#8b5a2b', c: '#6b431e', T: '#8e2c3a' } },
  // Isaac Newton's crimson robe
  { ...COLLARED_CUT, colors: { C: '#9b2335', c: '#6e1826', T: '#f4f4f4', X: '#f4f4f4' } },
  // Ada Lovelace's violet gown
  { ...COLLARED_CUT, colors: { C: '#6247aa', c: '#4a3485', T: '#e8dff5', X: '#4a3485' } },
  // Chien-Shiung Wu's qipao
  { ...QIPAO_CUT, colors: { C: '#1f7a8c', T: '#16596a', X: '#f2c14e' } },
];

const PROPS: ColoredDrawing[] = [
  // Isaac Newton's apple
  {
    colors: { R: '#d62828', r: '#9d1c1c', n: '#6b4423', L: '#4caf50', w: WHITE },
    start: 0,
    rows: [
      '....................nL..',
      '...................RRRR.',
      '...................RwRR.',
      '...................RRrR.',
      '....................rr..',
    ],
  },
  // Nikola Tesla's lightning bolt
  {
    colors: { Y: '#ffd60a' },
    start: 0,
    rows: [
      '....................YYY.',
      '...................YYY..',
      '..................YYYYY.',
      '....................YY..',
      '...................YY...',
      '...................Y....',
    ],
  },
  // Marie Curie's glowing flask
  {
    colors: { n: '#8b5e3c', G: '#d8e2ef', V: '#7cff6b', w: WHITE },
    start: 15,
    rows: [
      '...................nn...',
      '...................GG...',
      '...................GG...',
      '..................GVVG..',
      '.................GVVVVG.',
      '.................VVwVVV.',
      '.................VVVVVV.',
      '.................GGGGGG.',
    ],
  },
  // Charles Darwin's finch
  {
    colors: { B: '#8b5e3c', b: '#d9a066', y: '#e0b040', E: OUTLINE },
    start: 16,
    rows: [
      '..................BBB...',
      '.................yBEB...',
      '..................BBBB..',
      '..................bBBBB.',
      '...................BBBBB',
    ],
  },
  // Thomas Edison's light bulb
  {
    colors: { Y: '#ffe066', w: WHITE, G: '#9aa0a6' },
    start: 0,
    rows: [
      '...................YYY..',
      '..................YwYYY.',
      '..................YYYYY.',
      '...................YYY..',
      '...................GGG..',
      '....................G...',
    ],
  },
  // Galileo Galilei's telescope
  {
    colors: { T: '#d4a017', t: '#7a4b2a' },
    start: 14,
    rows: [
      '......................TT',
      '.....................TTT',
      '....................TTT.',
      '...................ttt..',
      '..................ttt...',
      '.................ttt....',
      '.................tt.....',
    ],
  },
  // Rosalind Franklin's DNA helix
  {
    colors: { A: '#4895ef', B: '#f72585', i: '#dddddd' },
    start: 13,
    rows: [
      '.AiiB...................',
      '..AB....................',
      '..BA....................',
      '.BiiA...................',
      '..BA....................',
      '..AB....................',
      '.AiiB...................',
      '..AB....................',
      '..BA....................',
      '.BiiA...................',
    ],
  },
  // Carl Sagan's ringed planet
  {
    colors: { P: '#f4a261', p: '#c97c3d', O: '#e9c46a' },
    start: 1,
    rows: [
      '...................PP...',
      '..................PPPP..',
      '................OOPPPPOO',
      '..................pPPp..',
      '...................pp...',
    ],
  },
  // Ada Lovelace's engine gear
  {
    colors: { G: '#9aa0a6' },
    start: 1,
    rows: [
      '..G.G...................',
      '.GGGGG..................',
      'GGG.GGG.................',
      '.GGGGG..................',
      '..G.G...................',
    ],
  },
  // George Washington Carver's peanut
  {
    colors: { P: '#d9a86c', p: '#b5834a' },
    start: 15,
    rows: [
      '...................PP...',
      '..................PPPP..',
      '..................PpPP..',
      '...................PP...',
      '..................PPPP..',
      '..................PPpP..',
      '...................PP...',
    ],
  },
  // Srinivasa Ramanujan's infinity sign
  {
    colors: { I: OUTLINE },
    start: 1,
    rows: [
      '...............II...II..',
      '..............I..I.I..I.',
      '..............I...I...I.',
      '..............I..I.I..I.',
      '...............II...II..',
    ],
  },
];

interface Traits {
  head: Head;
  hairColor: string;
  background: string;
  hair: Sprite;
  facialHair: Sprite | null;
  eyewear: ColoredDrawing | null;
  outfit: ColoredDrawing;
  prop: ColoredDrawing | null;
}

const hashSeed = (seed: string) => {
  let hash = 2166136261;
  for (const character of seed) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return hash >>> 0;
};

// Int32Array storage wraps the state to 32 bits on every write, which the generator relies on.
const createRandom = (seed: number) => {
  const state = new Int32Array([seed]);
  return () => {
    state[0] += 0x6d2b79f5;
    const current = state[0];
    let t = Math.imul(current ^ (current >>> 15), 1 | current);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pickTraits = (seed: string): Traits => {
  const random = createRandom(hashSeed(seed));
  const pick = <T>(options: T[]) => options[Math.floor(random() * options.length)];
  const pickSometimes = <T>(chance: number, options: T[]) =>
    random() < chance ? pick(options) : null;

  return {
    head: pick(HEADS),
    hairColor: pick(HAIR_COLORS),
    background: pick(BACKGROUND_COLORS),
    hair: pick(HAIRSTYLES),
    facialHair: pickSometimes(0.45, FACIAL_HAIR),
    eyewear: pickSometimes(0.4, EYEWEAR),
    outfit: pick(OUTFITS),
    prop: pickSometimes(0.85, PROPS),
  };
};

const toChannels = (hex: string) => [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));

const toHex = (channels: number[]) =>
  '#' + channels.map((channel) => channel.toString(16).padStart(2, '0')).join('');

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

// Negative amounts darken toward black; positive amounts lighten toward white.
const shade = (hex: string, amount: number) =>
  toHex(
    toChannels(hex).map((channel) =>
      clampChannel(amount < 0 ? channel * (1 + amount) : channel + (255 - channel) * amount)
    )
  );

const blend = (base: string, tint: string, alpha: number) => {
  const tintChannels = toChannels(tint);
  return toHex(
    toChannels(base).map((channel, i) => Math.round(channel + (tintChannels[i] - channel) * alpha))
  );
};

const createGrid = <T>(size: number, fill: T): T[][] =>
  Array.from({ length: size }, () => new Array<T>(size).fill(fill));

const isOnCanvas = (x: number, y: number) => x >= 0 && y >= 0 && x < HI_RES && y < HI_RES;

const placeSprite = ({ start, rows }: Sprite): CodeGrid => {
  const grid = createGrid(GRID, '.');
  rows.forEach((row, dy) =>
    [...row].forEach((code, x) => {
      grid[start + dy][x] = code;
    })
  );
  return grid;
};

const plotCells = (cells: Cell[]): CodeGrid => {
  const grid = createGrid(HI_RES, '.');
  for (const [x, y, code] of cells) grid[y][x] = code;
  return grid;
};

// Scale2x rounds corners and diagonals instead of doubling pixels into 2x2 blocks.
const scale2x = (grid: CodeGrid): CodeGrid => {
  const scaled = createGrid(HI_RES, '.');
  const codeAt = (x: number, y: number, fallback: string) => grid[y]?.[x] ?? fallback;
  grid.forEach((row, y) =>
    row.forEach((center, x) => {
      const above = codeAt(x, y - 1, center);
      const right = codeAt(x + 1, y, center);
      const left = codeAt(x - 1, y, center);
      const below = codeAt(x, y + 1, center);
      scaled[2 * y][2 * x] = left === above && left !== below && above !== right ? above : center;
      scaled[2 * y][2 * x + 1] =
        above === right && above !== left && right !== below ? right : center;
      scaled[2 * y + 1][2 * x] =
        below === left && below !== right && left !== above ? left : center;
      scaled[2 * y + 1][2 * x + 1] =
        right === below && right !== above && below !== left ? below : center;
    })
  );
  return scaled;
};

const upscale = (drawing: Drawing): CodeGrid =>
  'cells' in drawing ? plotCells(drawing.cells) : scale2x(placeSprite(drawing));

const drawHeadSilhouette = (head: Head): Sprite => {
  const spans = HEAD_SHAPES[head.shape];
  const rows: string[] = [];
  let span = spans[6];
  for (let y = 6; y <= 19; y++) {
    span = spans[y] ?? span;
    const [left, right] = span;
    let row = '';
    for (let x = 0; x < GRID; x++) {
      const isEdge = x === left || x === right;
      const isEar = y >= 11 && y <= 13 && isEdge;
      const isJaw = y >= 17 && (isEdge || (y >= 18 && (x === left + 1 || x === right - 1)));
      if (x < left || x > right) row += '.';
      else row += y === 19 || isEar || isJaw ? 's' : 'S';
    }
    rows.push(row);
  }
  return { start: 6, rows };
};

const listHeadFeatures = (head: Head): Cell[] => [
  ...FACE_FEATURES.eyes[head.eyes],
  ...FACE_FEATURES.brows[head.brows],
  ...FACE_FEATURES.nose[head.nose],
  ...FACE_FEATURES.mouth[head.mouth],
  ...(head.extra ?? []).flatMap((mark) => FACE_FEATURES.extra[mark]),
];

const drawAvatarSvg = ({
  head,
  hairColor,
  background,
  hair,
  facialHair,
  eyewear,
  outfit,
  prop,
}: Traits) => {
  const pixels = createGrid<string | null>(HI_RES, null);
  const deepSkin = shade(head.skin, -0.3);
  const hairPalette: Palette = {
    H: hairColor,
    h: shade(hairColor, -0.25),
    L: shade(hairColor, 0.3),
    w: WHITE,
  };
  const skinPalette: Palette = {
    S: head.skin,
    s: shade(head.skin, -0.12),
    n: deepSkin,
    E: OUTLINE,
    W: WHITE,
    l: deepSkin,
    M: shade(head.skin, -0.45),
    m: '#f4f4f4',
    B: shade(hairColor, -0.35),
    c: '#e8968a',
  };

  const paint = (x: number, y: number, color: Palette[string] | undefined) => {
    if (color === undefined) pixels[y][x] = OUTLINE;
    else if (typeof color === 'string') pixels[y][x] = color;
    else pixels[y][x] = blend(pixels[y][x] ?? background, color.tint, color.alpha);
  };

  const paintLayer = (
    drawing: Drawing,
    palette: Palette,
    outlineOver: boolean,
    { rim, features = [] }: LayerOptions = {}
  ) => {
    const codes = upscale(drawing);
    const isFilled = (x: number, y: number) => (codes[y]?.[x] ?? '.') !== '.';
    const shadeRim = (code: string, x: number, y: number) => {
      const isHairHighlight =
        rim === 'hair' &&
        code === 'H' &&
        !isFilled(x, y - 1) &&
        isFilled(x, y + 2) &&
        x < LIT_SIDE_END;
      if (isHairHighlight) return 'L';
      const isSkinShadow =
        rim === 'skin' && code === 'S' && (!isFilled(x + 1, y) || !isFilled(x + 2, y));
      return isSkinShadow ? 's' : code;
    };

    codes.forEach((row, y) =>
      row.forEach((code, x) => {
        if (code === '.' || UNOUTLINED_CODES.has(code)) return;
        for (const [dx, dy] of NEIGHBOR_OFFSETS) {
          const nx = x + dx;
          const ny = y + dy;
          if (!isOnCanvas(nx, ny) || isFilled(nx, ny)) continue;
          if (outlineOver || pixels[ny][nx] === null) pixels[ny][nx] = OUTLINE;
        }
      })
    );

    codes.forEach((row, y) =>
      row.forEach((code, x) => {
        if (code !== '.') paint(x, y, palette[shadeRim(code, x, y)]);
      })
    );

    for (const [x, y, code] of features) {
      if (isFilled(x, y)) paint(x, y, palette[code]);
    }
  };

  paintLayer(outfit, { ...outfit.colors, s: skinPalette.s }, false);
  paintLayer(drawHeadSilhouette(head), skinPalette, false, {
    rim: 'skin',
    features: listHeadFeatures(head),
  });
  if (facialHair) paintLayer(facialHair, hairPalette, true, { rim: 'hair' });
  paintLayer(hair, hairPalette, true, { rim: 'hair' });
  if (eyewear) paintLayer(eyewear, eyewear.colors, false);
  if (prop) paintLayer(prop, prop.colors, true);

  // One path per color, made of its horizontal runs, keeps the SVG small and quick to decode.
  // Runs bleed into empty cells below so no seam shows, but never over a cell another color fills.
  const runsByColor = new Map<string, string>();
  pixels.forEach((row, y) => {
    const heightAt = (x: number) => (pixels[y + 1]?.[x] ? 1 : 1.05);
    for (let x = 0; x < HI_RES; ) {
      const color = row[x];
      const height = heightAt(x);
      let width = 1;
      while (
        color &&
        x + width < HI_RES &&
        row[x + width] === color &&
        heightAt(x + width) === height
      ) {
        width++;
      }
      if (color) {
        runsByColor.set(
          color,
          `${runsByColor.get(color) ?? ''}M${x} ${y}h${width}v${height}H${x}z`
        );
      }
      x += width;
    }
  });
  let paths = `<rect width="${HI_RES}" height="${HI_RES}" fill="${background}"/>`;
  runsByColor.forEach((runs, color) => {
    paths += `<path fill="${color}" d="${runs}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${HI_RES} ${HI_RES}" shape-rendering="crispEdges">${paths}</svg>`;
};

const MAX_CACHED_AVATARS = 500;
const cachedAvatarUris = new Map<string, string>();

// The same seed always draws the same avatar, so each seed is drawn once and reused.
export const generatePixelScientistAvatarUri = (seed: string) => {
  const cachedUri = cachedAvatarUris.get(seed);
  if (cachedUri) return cachedUri;

  if (cachedAvatarUris.size === MAX_CACHED_AVATARS) {
    cachedAvatarUris.delete(cachedAvatarUris.keys().next().value as string);
  }
  // Only '#' must be escaped in an SVG data URI; it would otherwise start the URL fragment.
  const svg = drawAvatarSvg(pickTraits(seed));
  const uri = `data:image/svg+xml;charset=utf-8,${svg.replaceAll('#', '%23')}`;
  cachedAvatarUris.set(seed, uri);
  return uri;
};
