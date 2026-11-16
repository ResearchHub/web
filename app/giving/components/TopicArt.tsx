import type { CSSProperties, ReactNode } from 'react';
import { cn } from '@/utils/styles';
import type { Topic } from '@/app/giving/lib/topics';
import {
  TOPIC_PALETTES,
  TOPIC_SYMBOLS,
  type SymbolPart,
  type TopicPalette,
} from '@/app/giving/lib/topicSymbols';
import styles from './TopicArt.module.css';

type TopicId = Topic['id'];

/** Small dots in the topic's accent color, in the corners of the 400 by 300 canvas. */
const DOTS = [
  [64, 68, 5],
  [338, 244, 6],
  [350, 64, 4],
  [56, 236, 3.5],
] as const;

/** Mixes two #rrggbb colors; `amount` 0 is `from`, 1 is `to`. */
function mixColors(from: string, to: string, amount: number) {
  const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  const a = channels(from);
  const b = channels(to);
  return (
    '#' +
    a
      .map((value, i) =>
        Math.round(value + (b[i] - value) * amount)
          .toString(16)
          .padStart(2, '0')
      )
      .join('')
  );
}

function renderParts(parts: SymbolPart[], palette: TopicPalette): ReactNode[] {
  return parts.map((part, index) => {
    const motion = part.motion
      ? {
          className: cn(styles.moving, styles[part.motion]),
          style: part.delay ? ({ '--delay': `${part.delay}s` } as CSSProperties) : undefined,
        }
      : {};

    if (part.kind === 'group') {
      return (
        <g key={index} {...motion}>
          {renderParts(part.parts, palette)}
        </g>
      );
    }

    const color = palette[part.role] ?? palette.main;
    if (part.kind === 'shape') {
      return <path key={index} d={part.d} fill={color} transform={part.transform} {...motion} />;
    }
    return (
      <path
        key={index}
        d={part.d}
        fill="none"
        stroke={color}
        strokeWidth={part.width}
        strokeLinecap="round"
        strokeLinejoin="round"
        transform={part.transform}
        pathLength={part.motion === 'draw' ? 1 : undefined}
        {...motion}
      />
    );
  });
}

/**
 * A topic's flat illustration on its own background color. The symbol keeps its proportions and
 * sits centered in the box, and moves a little while the nearest `group` is hovered or focused.
 */
export function TopicArt({
  topicId,
  className,
}: Readonly<{ topicId: TopicId; className?: string }>) {
  const palette = TOPIC_PALETTES[topicId];
  const disc = mixColors(palette.background, '#ffffff', palette.isDark ? 0.1 : 0.55);

  return (
    <div
      className={cn('relative overflow-hidden', className)}
      style={{ background: palette.background }}
      aria-hidden
    >
      {/* Cropped to the disc, so the symbol stays large in short cards. */}
      <svg
        viewBox="50 20 300 260"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full"
      >
        <circle cx={200} cy={150} r={118} fill={disc} />
        {DOTS.map(([x, y, r]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={palette.accent} opacity={0.7} />
        ))}
        {renderParts(TOPIC_SYMBOLS[topicId], palette)}
      </svg>
    </div>
  );
}
