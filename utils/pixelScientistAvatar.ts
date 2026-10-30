import { colors as themeColors } from '@/app/styles/colors';

type Cell = [x: number, y: number, code: string];
// Square grid of code character codes stored row by row; 0 is an empty cell.
type CodeGrid = Uint8Array;
type Tint = { tint: string; alpha: number };
type Palette = Record<string, string | Tint>;
type Span = [left: number, right: number];

interface Sprite {
  start: number;
  rows: string[];
}

// Sprite art is written one row per line; rows are split on whitespace, so indentation is free.
const art = ([rows]: TemplateStringsArray) => rows.trim().split(/\s+/);

type Drawing = Sprite | { cells: Cell[] };
type ColoredDrawing = Drawing & { colors: Palette };

interface LayerOptions {
  rim?: 'hair' | 'skin';
}

// Parts are authored on the 24 grid and upscaled to the 48 grid; face features are drawn at 48.
const GRID = 24;
const HI_RES = GRID * 2;
const OUTLINE = '#1b1b2f';
const WHITE = '#ffffff';
const LIT_SIDE_END = 26;
const charCode = (code: string) => code.codePointAt(0) ?? 0;
const EMPTY = 0;
const HAIR = charCode('H');
const HAIR_HIGHLIGHT = charCode('L');
const SKIN = charCode('S');
const SKIN_SHADOW = charCode('s');
const UNOUTLINED_CODES = new Set(['w', 'g', 'i', 'I'].map(charCode));

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
  '#f3e9d8',
  themeColors.rhBlue[500],
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
  paulDirac: {
    skin: '#f1d4be',
    shape: 'narrow',
    eyes: 'dot',
    brows: 'thin',
    nose: 'long',
    mouth: 'small',
    extra: ['cheekbones'],
  },
  vannevarBush: {
    skin: '#eecdb4',
    shape: 'long',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'big',
    mouth: 'line',
    extra: ['wrinkles'],
  },
  robertOppenheimer: {
    skin: '#f0d2bc',
    shape: 'narrow',
    eyes: 'dot',
    brows: 'thin',
    nose: 'long',
    mouth: 'line',
    extra: ['cheekbones'],
  },
  liseMeitner: {
    skin: '#f4d8c4',
    shape: 'oval',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'small',
  },
  erwinSchrodinger: {
    skin: '#f2d2b6',
    shape: 'round',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'small',
    mouth: 'smile',
  },
  maxPlanck: {
    skin: '#efd0b8',
    shape: 'long',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'long',
    mouth: 'line',
    extra: ['wrinkles'],
  },
  nielsBohr: {
    skin: '#f0cfb6',
    shape: 'long',
    eyes: 'droopy',
    brows: 'heavy',
    nose: 'big',
    mouth: 'small',
    extra: ['jowls'],
  },
  graceHopper: {
    skin: '#f3d5c2',
    shape: 'oval',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
    extra: ['wrinkles'],
  },
  wernerHeisenberg: {
    skin: '#f5d7c0',
    shape: 'oval',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
  },
  dorothyHodgkin: {
    skin: '#f6dac8',
    shape: 'round',
    eyes: 'dot',
    brows: 'thin',
    nose: 'small',
    mouth: 'smile',
    extra: ['blush'],
  },
  ernestRutherford: {
    skin: '#efc9ad',
    shape: 'round',
    eyes: 'dot',
    brows: 'heavy',
    nose: 'big',
    mouth: 'line',
    extra: ['jowls'],
  },
});

const HAIRSTYLES = Object.values<Sprite>({
  // Albert Einstein's wild hair
  albertEinstein: {
    start: 2,
    rows: art`
      .....H..H..HH..H..H.....
      ....HHH.HHHHHHHH.HHH....
      ...HHHHHHHHHHHHHHHHHH...
      ..HHHHHhhHHHHHHhhHHHHH..
      ..HHHHHH........HHHHHH..
      .HHHHHh..........hHHHHH.
      ..HHHHh..........hHHHH..
      .HHHHHh..........hHHHHH.
      ..HHHhh..........hhHHH..
      ...HHhh..........hhHH...
      ..HHHh............hHHH..
      ...HH..............HH...
    `,
  },
  // Marie Curie's top bun
  marieCurie: {
    start: 1,
    rows: art`
      ..........HHHH..........
      .........HHhhHH.........
      ........HHHHHHHH........
      .......HHHHHHHHHH.......
      ......HHHHHHHHHHHH......
      .....HHHHhhhhhhHHHH.....
      .....HHH........HHH.....
      .....HH..........HH.....
      ......H..........H......
    `,
  },
  // Isaac Newton's curly wig
  isaacNewton: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHhhHHHH.......
      ......HHHHHhhHHHHH......
      .....HHHHHhhhhHHHHH.....
      ....HHHh........hHHH....
      ....HhHH........HHhH....
      ...HHHh..........hHHH...
      ...HhHH..........HHhH...
      ...HHHh..........hHHH...
      ...HhHH..........HHhH...
      ...HHHh..........hHHH...
      ...HhHH..........HHhH...
      ...HHHh..........hHHH...
      ...HhHH..........HHhH...
      ...HHHh..........hHHH...
      ....HhH..........HhH....
      ....HH............HH....
    `,
  },
  // Nikola Tesla's centre part
  nikolaTesla: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHhhHHHH.......
      ......HHHHHhhHHHHH......
      ......HHHHhhhhHHHH......
      ......HH........HH......
      ......HH........HH......
      ......H..........H......
    `,
  },
  // Charles Darwin's shiny dome
  charlesDarwin: {
    start: 7,
    rows: art`
      .........ww.............
      ......HH........HH......
      .....HHH........HHH.....
      .....HHh........hHH.....
      .....Hh..........hH.....
    `,
  },
  // Rosalind Franklin's side-swept bob
  rosalindFranklin: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHHHHHHH.......
      ......HHHHHHHHHHHH......
      ......HHHHHHHHHhhHH.....
      ......HHHHHh.....HHH....
      ......HHHh........HH....
      ......HH..........HH....
      ......HH.........HHH....
      .....HHH.........HHH....
      .....HH...........HH....
    `,
  },
  // Ada Lovelace's ringlets
  adaLovelace: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHhhHHHH.......
      ......HHHHHhhHHHHH......
      .....HHHHHHhhHHHHHH.....
      .....HHH........HHH.....
      ....HHHH........HHHH....
      ...HHhHH........HHhHH...
      ...HhHh..........hHhH...
      ...HHhH..........HhHH...
      ...HhHh..........hHhH...
      ....HH............HH....
    `,
  },
  // Jane Goodall's ponytail
  janeGoodall: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHHHHHHH.......
      ......HHHHHHHHHHHH......
      ......HHHhhhhhhHHHH.....
      ......HH........HHHHH...
      ......HH.........HHHHH..
      ......H...........HhHH..
      ..................HHhH..
      ...................HHH..
      ...................HhH..
      ....................HH..
      ....................H...
    `,
  },
  // Richard Feynman's swept-back waves
  richardFeynman: {
    start: 2,
    rows: art`
      ........HH..HHH.........
      .......HHHHHHHHHH.......
      ......HHHHHHHHHHHH......
      .....HHHHhHHHHhHHHH.....
      .....HHHhhhhhhhhHHH.....
      .....HHH........HHH.....
      .....HH..........HH.....
      .....HH..........HH.....
      ......H..........H......
    `,
  },
  // Katherine Johnson's short curls
  katherineJohnson: {
    start: 3,
    rows: art`
      .........HhHhHH.........
      .......HhHhHhHhHh.......
      ......hHhHhHhHhHhH......
      ......HhHhHhHhHhHh......
      ......hH........Hh......
      ......Hh........hH......
      ......h..........h......
    `,
  },
  // Srinivasa Ramanujan's side part
  srinivasaRamanujan: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHHHHHHH.......
      ......HHHhHHHHHHHH......
      ......HHhhHHHHHHHHH.....
      ......HH........HHH.....
      ......HH.........HH.....
      ......H..........H......
    `,
  },
  // George Washington Carver's close crop
  georgeWashingtonCarver: {
    start: 4,
    rows: art`
      .........HhHhHh.........
      .......hHhHhHhHhH.......
      ......HhHhHhHhHhHh......
      ......Hh........hH......
      ......h..........h......
    `,
  },
  // Chien-Shiung Wu's tucked bob
  chienShiungWu: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHHHHHHH.......
      ......HHHHHHHHHHHH......
      .....HHHHhhhHHHHHHH.....
      .....HHH........HHH.....
      .....HH..........HH.....
      .....HH..........HH.....
      .....HH..........HH.....
      .....HH..........HH.....
      .....HH..........HH.....
      .....HH..........HH.....
      .....HH..........HH.....
      .....hHH........HHh.....
      ......hh........hh......
    `,
  },
  // Paul Dirac's slicked-back hair
  paulDirac: {
    start: 3,
    rows: art`
      ..........HHHH..........
      ........HHHHHHHH........
      .......HhhhhhhhhH.......
      ......HHHHHHHHHHHH......
      ......HH........HH......
      ......H..........H......
    `,
  },
  // J. Robert Oppenheimer's porkpie hat
  robertOppenheimer: {
    start: 2,
    rows: art`
      ........KKKKKKKK........
      .......KKKKKKKKKK.......
      .......kkkkkkkkkk.......
      ....KKKKKKKKKKKKKKKK....
      ......HH........HH......
      ......H..........H......
    `,
  },
  // Lise Meitner's neat swept-back hair
  liseMeitner: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHHHHHHH.......
      ......HHHhhHHhhHHH......
      .....HHHHHHHHHHHHHH.....
      .....HHH........HHH.....
      .....HH..........HH.....
      .....HH..........HH.....
      ......H..........H......
    `,
  },
  // Werner Heisenberg's pompadour
  wernerHeisenberg: {
    start: 1,
    rows: art`
      ........HHHHHH..........
      ......HHHHHHHHHH........
      .....HHHHhhHHHHHHH......
      .....HHHHHHHHHHHHHH.....
      ......HHHHhhhhhHHHH.....
      ......HHH.......HHH.....
      ......HH.........HH.....
      ......H..........H......
    `,
  },
  // Dorothy Hodgkin's soft waves
  dorothyHodgkin: {
    start: 3,
    rows: art`
      .........HHHHHH.........
      .......HHHHHHHHHH.......
      ......HHHhHHHHhHHH......
      .....HHHhhHHHHhhHHH.....
      .....HHH........HHH.....
      ....HHhH........HhHH....
      ....HHHh........hHHH....
      ....HhHH........HHhH....
      ....HHHh........hHHH....
      .....HH..........HH.....
    `,
  },
});

const FACIAL_HAIR = Object.values<Sprite>({
  // Albert Einstein's walrus moustache
  albertEinstein: {
    start: 15,
    rows: art`
      ........HHHHHHHH........
      .......HHhHHHHhHH.......
      .......HH......HH.......
    `,
  },
  // Nikola Tesla's neat moustache
  nikolaTesla: {
    start: 15,
    rows: art`
      .........HHHHHH.........
    `,
  },
  // Charles Darwin's great beard
  charlesDarwin: {
    start: 13,
    rows: art`
      ......H..........H......
      ......HH........HH......
      ......HHHHHHHHHHHH......
      ......HHHH....HHHH......
      ......HHHHHHHHHHHH......
      ......HHhHHHHHHhHH......
      .......HHHhHHhHHH.......
      ........HHHHHHHH........
      .........HHhhHH.........
      ..........HHHH..........
    `,
  },
  // Galileo Galilei's pointed beard
  galileoGalilei: {
    start: 15,
    rows: art`
      ........HHHHHHHH........
      ........HH....HH........
      .........HHHHHH.........
      .........HHHHHH.........
      ..........HhhH..........
      ...........HH...........
    `,
  },
  // George Washington Carver's trim moustache
  georgeWashingtonCarver: {
    start: 15,
    rows: art`
      ..........HHHH..........
    `,
  },
  // Ernest Rutherford's bushy moustache
  ernestRutherford: {
    start: 15,
    rows: art`
      .......HHHHHHHHHH.......
      ......HHHhHHHHhHHH......
      .......HHH....HHH.......
    `,
  },
});

// Drawn directly on the 48 grid: two rounded lenses, a bridge, and a strap.
const drawGoggles = (): Cell[] => {
  const lens = art`
    ..FFFFFF..
    .FffffffF.
    FfGGGGGGfF
    FfgGGGGGfF
    FfGgGGGGfF
    FfGGGGGGfF
    FfGGGGGGfF
    FfGGGGGGfF
    .FffffffF.
    ..FFFFFF..
  `;
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

const EYEWEAR = Object.values<ColoredDrawing>({
  // Benjamin Franklin's wire spectacles
  benjaminFranklin: {
    colors: { F: '#c9a227', g: WHITE },
    start: 10,
    rows: art`
      ........FFF..FFF........
      ......FFg..FFg..FF......
      .......F...FF...F.......
      ........FFF..FFF........
    `,
  },
  // Katherine Johnson's cat-eye glasses
  katherineJohnson: {
    colors: { F: '#5a2d2d', g: WHITE },
    start: 9,
    rows: art`
      ......F..........F......
      ......FFFFF..FFFFF......
      .......Fg..FFg..F.......
      .......F...FF...F.......
      ........FFF..FFF........
    `,
  },
  // Safety goggles; the tinted lenses let the eyes show through.
  safetyGoggles: {
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
  hidekiYukawa: {
    colors: { F: '#222222', g: WHITE },
    start: 10,
    rows: art`
      .......FFFF..FFFF.......
      ......FFg..FFg..FF......
      .......F...FF...F.......
      .......FFFF..FFFF.......
    `,
  },
  // Vannevar Bush's rimless glasses
  vannevarBush: {
    colors: { F: '#b8bec6', G: { tint: '#dff3ff', alpha: 0.35 }, g: WHITE },
    start: 10,
    rows: art`
      .......GGGG..GGGG.......
      ......FGgGGFFGgGGF......
      .......GGGG..GGGG.......
    `,
  },
});

const LAB_COAT: ColoredDrawing = {
  start: 20,
  rows: art`
    .....CCCCcTssTcCCCC.....
    ....CCCCCCcTTcCCCCCC....
    ...CCCCCCCCXXCCCCCCCC...
    ...CCCCCCCCXXCCCCCCCC...
  `,
  colors: { C: '#f4f4f6', c: '#c4c4d0', T: '#7aa6c2', X: '#c4c4d0' },
};

// Props sit beside the head: inside the circle avatars are cropped to, and clear of the face.
const PROPS = Object.values<ColoredDrawing>({
  // Isaac Newton's apple
  isaacNewton: {
    colors: { R: '#d62828', r: '#9d1c1c', n: '#6b4423', L: '#4caf50', w: WHITE },
    start: 5,
    rows: art`
      ...................nL...
      ..................RRRR..
      ..................RwRR..
      ..................RRrR..
      ...................rr...
    `,
  },
  // Nikola Tesla's lightning bolt
  nikolaTesla: {
    colors: { Y: '#ffd60a' },
    start: 8,
    rows: art`
      ....................YYY.
      ...................YYY..
      ..................YYYYY.
      ....................YY..
      ...................YY...
      ...................Y....
    `,
  },
  // Marie Curie's glowing flask
  marieCurie: {
    colors: { n: '#8b5e3c', G: '#d8e2ef', V: '#7cff6b', w: WHITE },
    start: 9,
    rows: art`
      ....................nn..
      ....................GG..
      ....................GG..
      ...................GVVG.
      ...................VwVV.
      ...................VVVV.
      ...................GGGG.
    `,
  },
  // Charles Darwin's finch
  charlesDarwin: {
    colors: { B: '#8b5e3c', b: '#d9a066', y: '#e0b040', E: OUTLINE },
    start: 8,
    rows: art`
      ...................BBB..
      ..................yBEB..
      ...................BBBB.
      ...................bBBB.
      ....................BBB.
    `,
  },
  // Thomas Edison's light bulb
  thomasEdison: {
    colors: { Y: '#ffe066', w: WHITE, G: '#9aa0a6' },
    start: 7,
    rows: art`
      ...................YYY..
      ..................YwYYY.
      ..................YYYYY.
      ...................YYY..
      ...................GGG..
      ....................G...
    `,
  },
  // Galileo Galilei's telescope
  galileoGalilei: {
    colors: { T: '#d4a017', t: '#7a4b2a' },
    start: 14,
    rows: art`
      .....................TT.
      ....................TTT.
      ...................TTT..
      ..................ttt...
      .................ttt....
      ................ttt.....
      ................tt......
    `,
  },
  // Rosalind Franklin's DNA helix
  rosalindFranklin: {
    colors: { A: '#4895ef', B: '#f72585', i: '#dddddd' },
    start: 8,
    rows: art`
      .AiiB...................
      ..AB....................
      ..BA....................
      .BiiA...................
      ..BA....................
      ..AB....................
      .AiiB...................
    `,
  },
  // Carl Sagan's ringed planet
  carlSagan: {
    colors: { P: '#f4a261', p: '#c97c3d', O: '#e9c46a' },
    start: 8,
    rows: art`
      ...................PPP..
      ..................OPPPO.
      ...................pPp..
    `,
  },
  // Ada Lovelace's engine gear
  adaLovelace: {
    colors: { G: '#9aa0a6' },
    start: 7,
    rows: art`
      ..G.G...................
      .GGGGG..................
      .GG.GG..................
      .GGGGG..................
      ..G.G...................
    `,
  },
  // George Washington Carver's peanut
  georgeWashingtonCarver: {
    colors: { P: '#d9a86c', p: '#b5834a' },
    start: 10,
    rows: art`
      ....................PP..
      ...................PPPP.
      ...................PpPP.
      ....................PP..
      ...................PPPP.
      ...................PPpP.
      ....................PP..
    `,
  },
  // Srinivasa Ramanujan's infinity sign
  srinivasaRamanujan: {
    colors: { I: OUTLINE },
    start: 8,
    rows: art`
      ...................I.I..
      ..................I.I.I.
      ...................I.I..
    `,
  },
});

interface Traits {
  head: Head;
  hairColor: string;
  hair: Sprite;
  facialHair: Sprite | null;
  eyewear: ColoredDrawing | null;
  prop: ColoredDrawing | null;
  background: string;
}

const hashSeed = (seed: string) => {
  let hash = 2166136261;
  // Steps by code point, so a surrogate pair hashes as one character.
  for (let i = 0; i < seed.length; i++) {
    const codePoint = seed.codePointAt(i) ?? 0;
    if (codePoint > 0xffff) i++;
    hash ^= codePoint;
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
    hair: pick(HAIRSTYLES),
    facialHair: pickSometimes(0.45, FACIAL_HAIR),
    eyewear: pickSometimes(0.4, EYEWEAR),
    prop: pickSometimes(0.85, PROPS),
    background: pick(BACKGROUND_COLORS),
  };
};

const parsedChannels = new Map<string, number[]>();
const toChannels = (hex: string) => {
  let channels = parsedChannels.get(hex);
  if (!channels) {
    channels = [1, 3, 5].map((i) => Number.parseInt(hex.slice(i, i + 2), 16));
    parsedChannels.set(hex, channels);
  }
  return channels;
};

const toHex = (channels: number[]) =>
  '#' + channels.map((channel) => channel.toString(16).padStart(2, '0')).join('');

const clampChannel = (value: number) => Math.max(0, Math.min(255, Math.round(value)));

// Negative amounts darken toward black; positive amounts lighten toward white.
const shadedColors = new Map<string, string>();
const shade = (hex: string, amount: number) => {
  const key = `${hex}${amount}`;
  let shaded = shadedColors.get(key);
  if (!shaded) {
    shaded = toHex(
      toChannels(hex).map((channel) =>
        clampChannel(amount < 0 ? channel * (1 + amount) : channel + (255 - channel) * amount)
      )
    );
    shadedColors.set(key, shaded);
  }
  return shaded;
};

const blend = (base: string, tint: string, alpha: number) => {
  const tintChannels = toChannels(tint);
  return toHex(
    toChannels(base).map((channel, i) => Math.round(channel + (tintChannels[i] - channel) * alpha))
  );
};

const createGrid = (size: number): CodeGrid => new Uint8Array(size * size);

const isOnCanvas = (x: number, y: number) => x >= 0 && y >= 0 && x < HI_RES && y < HI_RES;

// Codes on the 48 grid, with the rows [top, bottom) that hold anything; all other rows are empty.
interface Upscaled {
  codes: CodeGrid;
  top: number;
  bottom: number;
}

// Avatars and layers are drawn one at a time, synchronously, so these scratch buffers are shared.
const spriteScratch = createGrid(GRID);
const outlineScratch = new Uint8Array(HI_RES * HI_RES);
const pixelScratch = new Uint8Array(HI_RES * HI_RES);

// The returned grid is scratch space, valid until the next call.
const placeSprite = ({ start, rows }: Sprite): CodeGrid => {
  const grid = spriteScratch.fill(EMPTY);
  rows.forEach((row, dy) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] !== '.') grid[(start + dy) * GRID + x] = row.codePointAt(x) ?? EMPTY;
    }
  });
  return grid;
};

const plotCells = (cells: Cell[]): Upscaled => {
  const codes = createGrid(HI_RES);
  let top = HI_RES;
  let bottom = 0;
  for (const [x, y, code] of cells) {
    codes[y * HI_RES + x] = charCode(code);
    top = Math.min(top, y);
    bottom = Math.max(bottom, y + 1);
  }
  return { codes, top, bottom };
};

// Off the grid, a cell's neighbor is the cell itself.
const codeAt = (grid: CodeGrid, x: number, y: number, fallback: number) =>
  x >= 0 && y >= 0 && x < GRID && y < GRID ? grid[y * GRID + x] : fallback;

// Writes the 2x2 block one 24-grid cell becomes on the 48 grid. EMPTY is 0, so the codes OR to 0
// only when the cell and its neighbors are all blank; that block stays blank, as the grid starts.
const scaleCell = (
  scaled: CodeGrid,
  topLeft: number,
  center: number,
  above: number,
  right: number,
  left: number,
  below: number
) => {
  if ((center | above | right | left | below) === EMPTY) return;
  const bottomLeft = topLeft + HI_RES;
  scaled[topLeft] = left === above && left !== below && above !== right ? above : center;
  scaled[topLeft + 1] = above === right && above !== left && right !== below ? right : center;
  scaled[bottomLeft] = below === left && below !== right && left !== above ? left : center;
  scaled[bottomLeft + 1] = right === below && right !== above && below !== left ? below : center;
};

// Scale2x rounds corners and diagonals instead of doubling pixels into 2x2 blocks.
// Rows outside [fromRow, toRow) must be empty; they stay empty when scaled.
const scale2x = (grid: CodeGrid, fromRow: number, toRow: number): CodeGrid => {
  const scaled = createGrid(HI_RES);
  for (let y = fromRow; y < toRow; y++) {
    for (let x = 0; x < GRID; x++) {
      const center = grid[y * GRID + x];
      scaleCell(
        scaled,
        2 * y * HI_RES + 2 * x,
        center,
        codeAt(grid, x, y - 1, center),
        codeAt(grid, x + 1, y, center),
        codeAt(grid, x - 1, y, center),
        codeAt(grid, x, y + 1, center)
      );
    }
  }
  return scaled;
};

const upscale = (drawing: Drawing): Upscaled => {
  if ('cells' in drawing) return plotCells(drawing.cells);
  const end = drawing.start + drawing.rows.length;
  return {
    codes: scale2x(placeSprite(drawing), drawing.start, end),
    top: 2 * drawing.start,
    bottom: 2 * end,
  };
};

const drawHeadSilhouette = (spans: Record<number, Span>): Sprite => {
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

// BMP stores rows bottom-up, so painted pixels use that order and the encoder copies them as is.
const toBmpCell = (x: number, y: number) => (HI_RES - 1 - y) * HI_RES + x;

// A layer reduced to what painting needs: where its outline goes and which code fills each cell.
// Cells are BMP-order pixel indexes. Fills are runs of consecutive cells sharing a code, which
// each run names by position in `codes`. `filled` is the layer's code grid, in top-down order.
interface PreparedLayer {
  outline: Uint16Array;
  runStarts: Uint16Array;
  runLengths: Uint8Array;
  runCodes: Uint8Array;
  codes: string[];
  filled: Uint8Array;
}

// Fills must be added in painting order; a cell continues the last run when it is next in line.
const createFills = () => {
  const starts: number[] = [];
  const lengths: number[] = [];
  const runCodes: number[] = [];
  const codeIds = new Map<number, number>();
  let last = -1;
  let lastCode = -1;
  let id = -1;
  return {
    add: (cell: number, code: number) => {
      if (code !== lastCode) {
        lastCode = code;
        id = codeIds.get(code) ?? codeIds.size;
        codeIds.set(code, id);
      }
      if (last >= 0 && runCodes[last] === id && starts[last] + lengths[last] === cell) {
        lengths[last]++;
      } else {
        last = starts.push(cell) - 1;
        lengths.push(1);
        runCodes.push(id);
      }
    },
    finish: () => ({
      runStarts: Uint16Array.from(starts),
      runLengths: Uint8Array.from(lengths),
      runCodes: Uint8Array.from(runCodes),
      codes: [...codeIds.keys()].map((code) => String.fromCodePoint(code)),
    }),
  };
};

const RIM_CODES: Record<NonNullable<LayerOptions['rim']>, number> = { hair: HAIR, skin: SKIN };

const isFilledIn = (codes: CodeGrid, x: number, y: number) =>
  isOnCanvas(x, y) && codes[y * HI_RES + x] !== EMPTY;

// Hair catches light on its upper edge; skin falls into shadow on its right edge.
const shadeRim = (codes: CodeGrid, code: number, x: number, y: number) => {
  if (code === HAIR) {
    const isLit = !isFilledIn(codes, x, y - 1) && isFilledIn(codes, x, y + 2) && x < LIT_SIDE_END;
    return isLit ? HAIR_HIGHLIGHT : code;
  }
  const isShadowed = !isFilledIn(codes, x + 1, y) || !isFilledIn(codes, x + 2, y);
  return isShadowed ? SKIN_SHADOW : code;
};

// Collects the empty, on-canvas cells that border a layer, each once.
const createOutline = (codes: CodeGrid) => {
  const cells: number[] = [];
  const isOutlined = outlineScratch.fill(0);
  const add = (x: number, y: number) => {
    const cell = y * HI_RES + x;
    if (!isOnCanvas(x, y) || codes[cell] || isOutlined[cell]) return;
    isOutlined[cell] = 1;
    cells.push(toBmpCell(x, y));
  };
  return {
    // At the left and right edges, cell ± 1 is in the next or previous row. Skipping on it is
    // still safe: the neighbor it stands for is off the canvas, which `add` ignores anyway.
    addAround: (x: number, y: number) => {
      const cell = y * HI_RES + x;
      if (!codes[cell + 1]) add(x + 1, y);
      if (!codes[cell - 1]) add(x - 1, y);
      if (!codes[cell + HI_RES]) add(x, y + 1);
      if (!codes[cell - HI_RES]) add(x, y - 1);
    },
    finish: () => Uint16Array.from(cells),
  };
};

const prepareLayer = (drawing: Drawing, { rim }: LayerOptions = {}): PreparedLayer => {
  const { codes, top, bottom } = upscale(drawing);
  const outline = createOutline(codes);
  const fills = createFills();
  const rimCode = rim ? RIM_CODES[rim] : EMPTY;
  for (let y = top; y < bottom; y++) {
    for (let x = 0; x < HI_RES; x++) {
      const code = codes[y * HI_RES + x];
      if (code === EMPTY) continue;
      fills.add(toBmpCell(x, y), code === rimCode ? shadeRim(codes, code, x, y) : code);
      if (!UNOUTLINED_CODES.has(code)) outline.addAround(x, y);
    }
  }
  return { outline: outline.finish(), ...fills.finish(), filled: codes };
};

// Face features paint after the silhouette, only where it is filled, and add no outline.
const prepareFeatures = (features: Cell[], silhouette: PreparedLayer): PreparedLayer => {
  const fills = createFills();
  for (const [x, y, code] of features) {
    if (silhouette.filled[y * HI_RES + x]) fills.add(toBmpCell(x, y), charCode(code));
  }
  return { outline: new Uint16Array(0), ...fills.finish(), filled: silhouette.filled };
};

// Prepared layers are cached by shape (sprite rows, cell list, head spans, or head) and by
// everything else that changes the result, so parts that share a shape share its layer.
const preparedLayers = new WeakMap<object, Map<string, PreparedLayer>>();
const getPreparedLayer = (shape: object, variant: string, prepare: () => PreparedLayer) => {
  let variants = preparedLayers.get(shape);
  if (!variants) {
    variants = new Map();
    preparedLayers.set(shape, variants);
  }
  let layer = variants.get(variant);
  if (!layer) {
    layer = prepare();
    variants.set(variant, layer);
  }
  return layer;
};

// Uint8Array#toBase64 is newer than btoa, so older browsers and Node versions fall back to btoa.
const toBase64 = (bytes: Uint8Array) => {
  const withBase64 = bytes as Uint8Array & { toBase64?: () => string };
  return withBase64.toBase64 ? withBase64.toBase64() : btoa(String.fromCodePoint(...bytes));
};

const BMP_HEADER_SIZE = 54;
const BMP_INFO_HEADER_SIZE = 40;

const MAX_PALETTE_SIZE = 256;

// An 8-bit BMP holds at most 256 colors, so a color past that reuses the closest one already used.
// Index 0 is skipped because it marks empty pixels.
const nearestPaintedColorIndex = (color: string, colors: string[]) => {
  const [red, green, blue] = toChannels(color);
  let nearest = 1;
  let nearestDistance = Infinity;
  for (let i = 1; i < colors.length; i++) {
    const [r, g, b] = toChannels(colors[i]);
    const distance = (red - r) ** 2 + (green - g) ** 2 + (blue - b) ** 2;
    if (distance < nearestDistance) {
      nearest = i;
      nearestDistance = distance;
    }
  }
  return nearest;
};

// One buffer, sized for a full palette, holds each BMP while it is encoded. The header fields
// that are the same for every avatar are written once; size, pixel offset, and palette size vary.
const bmpBuffer = new Uint8Array(BMP_HEADER_SIZE + MAX_PALETTE_SIZE * 4 + HI_RES * HI_RES);
const bmpView = new DataView(bmpBuffer.buffer);
bmpBuffer[0] = 0x42;
bmpBuffer[1] = 0x4d;
bmpView.setUint32(14, BMP_INFO_HEADER_SIZE, true);
bmpView.setInt32(18, HI_RES, true);
bmpView.setInt32(22, HI_RES, true);
bmpView.setUint16(26, 1, true);
bmpView.setUint16(28, 8, true);

// An 8-bit palette BMP needs no compression or checksums, so it is cheap to write and to decode.
const encodeBmp = (pixels: Uint8Array, colors: string[]) => {
  const pixelOffset = BMP_HEADER_SIZE + colors.length * 4;
  const length = pixelOffset + pixels.length;
  const bytes = bmpBuffer;
  bmpView.setUint32(2, length, true);
  bmpView.setUint32(10, pixelOffset, true);
  bmpView.setUint32(46, colors.length, true);
  colors.forEach((color, i) => {
    const [red, green, blue] = toChannels(color);
    const entry = BMP_HEADER_SIZE + i * 4;
    bytes[entry] = blue;
    bytes[entry + 1] = green;
    bytes[entry + 2] = red;
  });
  bytes.set(pixels, pixelOffset);
  return toBase64(bytes.subarray(0, length));
};

const drawAvatarBitmap = ({
  head,
  hairColor,
  hair,
  facialHair,
  eyewear,
  prop,
  background,
}: Traits) => {
  // Pixels hold palette indexes; index 0 is an empty pixel, which shows the background.
  const pixels = pixelScratch.fill(EMPTY);
  const colors = [background];
  const colorIndexes = new Map<string, number>();
  const colorIndex = (color: string) => {
    let index = colorIndexes.get(color);
    if (index === undefined) {
      if (colors.length === MAX_PALETTE_SIZE) return nearestPaintedColorIndex(color, colors);
      index = colors.push(color) - 1;
      colorIndexes.set(color, index);
    }
    return index;
  };
  const outlineIndex = colorIndex(OUTLINE);
  const deepSkin = shade(head.skin, -0.3);
  const hairPalette: Palette = {
    H: hairColor,
    h: shade(hairColor, -0.25),
    L: shade(hairColor, 0.3),
    w: WHITE,
    K: '#5c5449',
    k: '#2e2a26',
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

  const paintLayer = (
    { outline, runStarts, runLengths, runCodes, codes }: PreparedLayer,
    palette: Palette,
    outlineOver: boolean
  ) => {
    for (const cell of outline) {
      if (outlineOver || pixels[cell] === 0) pixels[cell] = outlineIndex;
    }
    const fills = codes.map((code) => {
      const color = palette[code];
      if (color === undefined) return outlineIndex;
      return typeof color === 'string' ? colorIndex(color) : color;
    });
    for (let run = 0; run < runStarts.length; run++) {
      const start = runStarts[run];
      const end = start + runLengths[run];
      const fill = fills[runCodes[run]];
      if (typeof fill === 'number') {
        pixels.fill(fill, start, end);
        continue;
      }
      for (let cell = start; cell < end; cell++) {
        pixels[cell] = colorIndex(blend(colors[pixels[cell]], fill.tint, fill.alpha));
      }
    }
  };
  const paintPart = (part: Drawing, palette: Palette, outlineOver: boolean, rim?: 'hair') => {
    const [shape, start] = 'cells' in part ? [part.cells, ''] : [part.rows, part.start];
    paintLayer(
      getPreparedLayer(shape, `${start}:${rim ?? ''}`, () => prepareLayer(part, { rim })),
      palette,
      outlineOver
    );
  };

  paintPart(LAB_COAT, { ...LAB_COAT.colors, s: skinPalette.s }, false);
  const spans = HEAD_SHAPES[head.shape];
  const silhouette = getPreparedLayer(spans, 'skin', () =>
    prepareLayer(drawHeadSilhouette(spans), { rim: 'skin' })
  );
  paintLayer(silhouette, skinPalette, false);
  paintLayer(
    getPreparedLayer(head, 'features', () => prepareFeatures(listHeadFeatures(head), silhouette)),
    skinPalette,
    false
  );
  if (facialHair) paintPart(facialHair, hairPalette, true, 'hair');
  paintPart(hair, hairPalette, true, 'hair');
  if (eyewear) paintPart(eyewear, eyewear.colors, false);
  if (prop) paintPart(prop, prop.colors, true);

  return encodeBmp(pixels, colors);
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
  const uri = `data:image/bmp;base64,${drawAvatarBitmap(pickTraits(seed))}`;
  cachedAvatarUris.set(seed, uri);
  return uri;
};
