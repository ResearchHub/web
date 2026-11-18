import { existsSync } from 'node:fs';
import { join } from 'node:path';
import Image from 'next/image';
import { cn } from '@/utils/styles';
import type { Question, QuestionSceneId, SceneId } from '../data/content';
import type { SetId } from '../theme';
import { isPosterOnly, type PosterFigureId } from '../sets/types';
import { DEFAULT_HERO, heroStillName, type HeroId } from '../sets/heroes';
import {
  HERO_STILL_T,
  SPRITE_STRIDE,
  heroCapacity,
  heroFrame,
  heroLayout,
} from '../visuals/heroModel';
import { SCENES } from '../visuals/scenes';
import { SvgPen } from '../visuals/svgPen';
import { FigureCanvas, HeroCanvas } from './LazyCanvases';
import { LiveLayer } from './LiveLayer';
import { Rich } from './Rich';

const STILL_W = 800;
const STILL_H = 600;

const TONE = {
  a: 'bg-[var(--o-gold)]',
  b: 'bg-[var(--o-ice)]',
  w: 'bg-[var(--o-white)]',
  f: 'bg-[var(--o-fire,var(--o-white))]',
} as const;

/**
 * A question's figure: the server-drawn still, the live canvas over it once
 * its script has loaded, and one line of legend and caption beneath.
 */
export function Figure({
  set = 'ink',
  sceneId,
  figure,
  className,
}: {
  set?: SetId;
  sceneId: QuestionSceneId;
  figure: Question['figure'];
  className?: string;
}) {
  return (
    <figure className={cn('m-0', className)}>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[6px] bg-[var(--o-ink)]">
        <FigureArt set={set} fig={sceneId} />
      </div>
      <figcaption className="mt-3 text-[13px] leading-[1.55] text-[var(--o-mute)]">
        <span className="flex flex-wrap gap-x-4 gap-y-1">
          {figure.legend.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 text-[var(--o-soft)]"
            >
              <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', TONE[item.tone])} />
              {item.label}
            </span>
          ))}
        </span>
        <span className="mt-1 block">
          <Rich>{figure.caption}</Rich>
        </span>
      </figcaption>
    </figure>
  );
}

function heroStill(w: number, h: number, prefix: string) {
  const data = new Float32Array(heroCapacity() * SPRITE_STRIDE);
  const n = heroFrame(data, w, h, HERO_STILL_T, { ...heroLayout(w, h), still: true });
  const pen = new SvgPen(w, h, prefix);
  pen.additive(true);
  for (let i = 0; i < n; i++) {
    const o = i * SPRITE_STRIDE;
    const c = [data[o + 4] * 255, data[o + 5] * 255, data[o + 6] * 255] as const;
    if (data[o + 3] > 0.5) pen.glow(data[o], data[o + 1], data[o + 2] * 0.6, c, data[o + 7]);
    else pen.circle(data[o], data[o + 1], data[o + 2] * 0.42, c, data[o + 7] * 0.9);
  }
  return pen.render();
}

/**
 * The hero microtubule: two server-drawn stills (wide and phone framing) and
 * the live WebGL canvas over them.
 */
export function HeroFigure({ set = 'ink', hero = DEFAULT_HERO }: { set?: SetId; hero?: HeroId }) {
  if (set !== 'ink') {
    // The art fades out under the text: from the bottom on phones (text
    // sits below the figure), from the left on wider screens.
    return (
      <div aria-hidden className="absolute inset-0 bg-[var(--o-ink)]">
        <div
          className={cn(
            'absolute inset-0',
            set === 'poster'
              ? '[mask-image:linear-gradient(180deg,#000_34%,transparent_50%)] tablet:[mask-image:linear-gradient(90deg,transparent_30%,#000_52%)]'
              : '[mask-image:linear-gradient(180deg,#000_30%,transparent_52%)] tablet:[mask-image:linear-gradient(90deg,transparent_24%,#000_56%)]'
          )}
        >
          <SetArt set={set} fig="hero" hero={hero} />
        </div>
      </div>
    );
  }
  return (
    <div aria-hidden className="absolute inset-0 bg-[var(--o-ink)]">
      <svg
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 hidden h-full w-full tablet:block"
      >
        {heroStill(1440, 900, 'hero-wide')}
      </svg>
      <svg
        viewBox="0 0 390 800"
        preserveAspectRatio="xMidYMin slice"
        className="absolute inset-0 h-full w-full tablet:hidden"
      >
        {heroStill(390, 800, 'hero-phone')}
      </svg>
      <HeroCanvas />
    </div>
  );
}

/** The original set's question figure: the SVG still and the live canvas. */
function InkArt({ sceneId }: { sceneId: SceneId }) {
  const scene = SCENES[sceneId];
  const pen = new SvgPen(STILL_W, STILL_H, `still-${sceneId}`);
  scene.draw(pen, scene.still);
  return (
    <>
      <svg
        viewBox={`0 0 ${STILL_W} ${STILL_H}`}
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        {pen.render()}
      </svg>
      <FigureCanvas sceneId={sceneId} />
    </>
  );
}

const hasStill = (set: SetId, file: string) =>
  existsSync(join(process.cwd(), 'public', 'consciousness', 'sets', set, file));

/**
 * A new set's figure: a static image (a frame captured from the live
 * figure, `public/consciousness/sets/<set>/<fig>.webp`) over a soft wash in the
 * set's colours, and the live layer over both. The static image is the
 * figure with reduced motion, without WebGL, or before the script loads.
 */
function SetArt({
  set,
  fig,
  hero = DEFAULT_HERO,
}: {
  set: Exclude<SetId, 'ink'>;
  fig: PosterFigureId;
  hero?: HeroId;
}) {
  // Only the Poster set has hero candidates; the others keep `hero.webp`.
  const file = fig === 'hero' && set === 'poster' ? heroStillName(hero) : fig;
  const base = `/consciousness/sets/${set}/${file}`;
  const phone = fig === 'hero' && hasStill(set, `${file}-phone.webp`);
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(60%_70%_at_70%_45%,rgb(var(--o-gold-rgb)/0.22),transparent_70%),radial-gradient(50%_60%_at_30%_60%,rgb(var(--o-ice-rgb)/0.2),transparent_70%)]"
      />
      {hasStill(set, `${file}.webp`) && (
        <Image
          src={`${base}.webp`}
          alt=""
          fill
          sizes={fig === 'hero' ? '100vw' : '(min-width: 768px) 60vw, 100vw'}
          className={cn('object-cover', phone && 'hidden tablet:block')}
        />
      )}
      {/* The phone still was drawn at 390 × 844, its art sized from the
          width (`phoneArt`), so it keeps that shape at the top rather than
          stretching to the hero's height, and lines up with the live figure. */}
      {phone && (
        <div className="absolute inset-x-0 top-0 aspect-[390/844] tablet:hidden">
          <Image
            src={`${base}-phone.webp`}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-top"
          />
        </div>
      )}
      <LiveLayer set={set} fig={fig} hero={hero} />
    </>
  );
}

/** Any set's art for one figure, filling a positioned box. */
export function FigureArt({ set, fig, hero }: { set: SetId; fig: PosterFigureId; hero?: HeroId }) {
  // A figure only the Poster set draws shows in its Poster version everywhere.
  if (isPosterOnly(fig)) return <SetArt set="poster" fig={fig} />;
  if (set !== 'ink') return <SetArt set={set} fig={fig} hero={hero} />;
  if (fig === 'hero') return <HeroFigure />;
  return <InkArt sceneId={fig} />;
}
