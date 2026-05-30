import { CSSProperties, useEffect, useRef } from 'react';
import styles from './AnimatedResearchCoin.module.css';

interface Props {
  /** Diameter of the coin in px. Default: 280 */
  size?: number;
  /** Base coin color. When set, the highlight/mid/shadow tones are derived
   *  from this via color-mix. When omitted, the default RSC orange scale
   *  (#fdba74 → #fb923c → #f97316) is used exactly. */
  color?: string;
  /** Spin duration in seconds. Default: 4.2 */
  spinDuration?: number;
  /** Float oscillation duration in seconds. Default: 4.4 */
  floatDuration?: number;
  /** Show sparkle motes around the coin. Default: true */
  motes?: boolean;
  className?: string;
}

type CoinCSSProperties = CSSProperties & {
  '--spin-duration'?: string;
  '--float-duration'?: string;
  '--rc-base'?: string;
  '--rc-highlight'?: string;
  '--rc-mid'?: string;
  '--rc-shadow'?: string;
  '--rc-glow'?: string;
};

function buildPalette(color: string): CoinCSSProperties {
  return {
    '--rc-base': color,
    '--rc-highlight': `color-mix(in srgb, ${color} 45%, white)`,
    '--rc-mid': `color-mix(in srgb, ${color} 75%, white)`,
    '--rc-shadow': `color-mix(in srgb, ${color} 55%, black)`,
    '--rc-glow': `color-mix(in srgb, ${color} 18%, white)`,
  };
}

export default function AnimatedResearchCoin({
  size = 280,
  color,
  spinDuration = 4.2,
  floatDuration = 4.4,
  motes = true,
  className,
}: Props) {
  const rimRef = useRef<HTMLDivElement>(null);

  // Build the cylindrical coin rim from N radial strips.
  // Alternating brightness creates a reeded (milled) edge.
  useEffect(() => {
    const rim = rimRef.current;
    if (!rim) return;
    rim.innerHTML = '';

    const N = 120;
    const R = size / 2;
    const arc = (2 * Math.PI * R) / N;
    const width = arc + 1.2;

    for (let i = 0; i < N; i++) {
      const strip = document.createElement('div');
      strip.className = styles.strip;
      const deg = (360 / N) * i;
      strip.style.width = `${width}px`;
      strip.style.height = '24px';
      strip.style.marginLeft = `${-width / 2}px`;
      strip.style.marginTop = '-12px';
      strip.style.transform = `rotateY(${deg}deg) translateZ(${R}px)`;
      strip.style.filter =
        i % 2 === 0 ? 'brightness(1.12) saturate(1.05)' : 'brightness(0.92) saturate(1.25)';
      rim.appendChild(strip);
    }
  }, [size]);

  const faceOffset = size * 0.043; // ~12px at 280px

  const sceneStyle: CoinCSSProperties = {
    width: size,
    height: size,
    ...(color ? buildPalette(color) : {}),
  };

  return (
    <div
      className={`${styles.scene} ${className ?? ''}`}
      style={sceneStyle}
      aria-label="Spinning ResearchCoin token"
    >
      {motes && (
        <>
          <div className={`${styles.mote} ${styles.m1}`} />
          <div className={`${styles.mote} ${styles.m2}`} />
          <div className={`${styles.mote} ${styles.m3}`} />
          <div className={`${styles.mote} ${styles.m4}`} />
        </>
      )}

      <div
        className={styles.coinStage}
        style={{ '--float-duration': `${floatDuration}s` } as CoinCSSProperties}
      >
        <div
          className={styles.coin}
          style={{ '--spin-duration': `${spinDuration}s` } as CoinCSSProperties}
        >
          <div className={styles.rim} ref={rimRef} />

          <div
            className={`${styles.face} ${styles.front}`}
            style={{ transform: `translateZ(${faceOffset}px)` }}
          >
            <FlaskGlyph />
          </div>

          <div
            className={`${styles.face} ${styles.back}`}
            style={{
              transform: `rotateY(180deg) translateZ(${faceOffset}px)`,
            }}
          >
            <FlaskGlyph />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlaskGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="#ffffff">
        <circle cx="30" cy="16" r="5" />
        <circle cx="48" cy="16" r="5" />
        <circle cx="39" cy="5" r="3.4" />
      </g>
      <path fill="#ffffff" d="M24.8 62 L21 68 Q19.5 72 24 72 L56 72 Q60.5 72 59 68 L55.2 62 Z" />
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="31" y1="29" x2="49" y2="29" />
        <path d="M36 31 L36 44 L21 68 Q19.5 72 24 72 L56 72 Q60.5 72 59 68 L44 44 L44 31" />
      </g>
    </svg>
  );
}
