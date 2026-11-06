'use client';

import { useId } from 'react';

const BRAND_BLUE = '#3971FF';
const OUTER_PATH =
  'M273.74 393.245L176.196 237.833V160.49H188.548C195.369 160.49 200.9 154.965 200.9 148.151C200.9 141.337 195.369 135.812 188.548 135.812H89.3324C82.5113 135.812 76.9804 141.337 76.9804 148.151C76.9804 154.965 82.5113 160.49 89.3324 160.49H101.684V237.833L4.14084 393.245C-2.29232 402.944 -1.23139 416.141 7.32362 424.687C12.1669 429.525 18.5001 431.962 24.8451 432.003H253.035C259.38 431.962 265.717 429.525 270.557 424.687C279.112 416.141 280.173 402.942 273.74 393.245Z';
const INNER_PATH =
  'M126.388 160.49V244.932L35.33 390Q25.5 407 46 407H231.88Q252.38 407 242.55 390L151.492 244.932V160.49Z';

const CENTER_X = 138.94;
const SHOULDER_Y = 244.932;
const BASE_CURVE_Y = 390;
const FULL_Y = 252;
const BOTTOM_Y = 407;
const NECK_WIDTH = 25.104;
const STEP = 0.25;

function getInnerWidth(y: number) {
  if (y < SHOULDER_Y) return NECK_WIDTH;
  if (y <= BASE_CURVE_Y) return NECK_WIDTH + 1.2554 * (y - SHOULDER_Y);
  const curve = (y - BASE_CURVE_Y) / (BOTTOM_Y - BASE_CURVE_Y);
  return 207.22 - 21.34 * curve * curve;
}

const TOTAL_AREA = Array.from(
  { length: (BOTTOM_Y - FULL_Y) / STEP },
  (_, step) => getInnerWidth(BOTTOM_Y - step * STEP) * STEP
).reduce((total, area) => total + area, 0);

/** Fills the interior from the bottom up by area, so levels match volume rather than height. */
function getLevelY(fraction: number) {
  let remainingArea = fraction * TOTAL_AREA;
  let y = BOTTOM_Y;
  while (remainingArea > 0 && y > FULL_Y) {
    remainingArea -= getInnerWidth(y) * STEP;
    y -= STEP;
  }
  return y;
}

interface FlaskProps {
  capacity: number;
  amount: number;
  width: number;
  hasBubbles?: boolean;
}

export function Flask({ capacity, amount, width, hasBubbles = false }: FlaskProps) {
  const clipId = useId();
  const liquidY = getLevelY(amount / capacity);
  const ticks = Array.from({ length: capacity - 1 }, (_, index) => {
    const y = getLevelY((index + 1) / capacity);
    const left = CENTER_X - getInnerWidth(y) / 2;
    return <line key={index} x1={left + 12} y1={y} x2={left + 36} y2={y} />;
  });

  return (
    <svg width={width} height={(width * 446) / 306} viewBox="-14 -14 306 446" aria-hidden>
      <defs>
        <clipPath id={`${clipId}-inner`}>
          <path d={INNER_PATH} />
        </clipPath>
        <clipPath id={`${clipId}-liquid`}>
          <rect y={liquidY} width="278" height={432 - liquidY} />
        </clipPath>
      </defs>
      <path d={INNER_PATH} fill="#fff" />
      <g stroke="#CAD8FF" strokeWidth="6" strokeLinecap="round">
        {ticks}
      </g>
      {amount > 0 && (
        <>
          <g clipPath={`url(#${clipId}-inner)`}>
            <rect y={liquidY} width="278" height={432 - liquidY} fill={BRAND_BLUE} />
            <rect y={liquidY} width="278" height="8" fill="#7FA2FF" />
          </g>
          <g
            clipPath={`url(#${clipId}-liquid)`}
            stroke="rgba(255,255,255,.55)"
            strokeWidth="6"
            strokeLinecap="round"
          >
            {ticks}
          </g>
        </>
      )}
      <path d={`${OUTER_PATH} ${INNER_PATH}`} fill={BRAND_BLUE} fillRule="evenodd" />
      {hasBubbles && (
        <g fill={BRAND_BLUE}>
          <circle cx="138.94" cy="16.08" r="16.08" />
          <circle cx="78.69" cy="78.63" r="23.06" />
          <circle cx="199.23" cy="78.63" r="23.06" />
        </g>
      )}
    </svg>
  );
}
