import { CSSProperties, useEffect, useRef } from 'react';
import styles from './AnimatedProposal.module.css';

interface Props {
  /** Uniform scale applied to the whole composition. The natural size is
   *  ~320px wide; use this to fit it into a container. Default: 1 */
  scale?: number;
  /** Duration of the coin's side-to-side sway in seconds. Default: 5.2 */
  swayDuration?: number;
  /** Show sparkle motes around the composition. Default: true */
  motes?: boolean;
  /** Show the crowdfunding progress bar beneath the scene. Default: true */
  showProgressBar?: boolean;
  /** Continuously loop the progress bar fill instead of playing it once and
   *  settling on the "Funded" badge. Default: false */
  loop?: boolean;
  className?: string;
}

type ProposalCSSProperties = CSSProperties & {
  '--proposal-scale'?: string;
  '--sway-duration'?: string;
};

function CoinGlyph() {
  return (
    <svg
      className={styles.glyph}
      viewBox="0 0 80 80"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g fill="#fff">
        <circle cx="30" cy="16" r="5" />
        <circle cx="48" cy="16" r="5" />
        <circle cx="39" cy="5" r="3.4" />
      </g>
      <path fill="#fff" d="M24.8 62 L21 68 Q19.5 72 24 72 L56 72 Q60.5 72 59 68 L55.2 62 Z" />
      <g fill="none" stroke="#fff" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="31" y1="29" x2="49" y2="29" />
        <path d="M36 31 L36 44 L21 68 Q19.5 72 24 72 L56 72 Q60.5 72 59 68 L44 44 L44 31" />
      </g>
    </svg>
  );
}

export default function AnimatedProposal({
  scale = 1,
  swayDuration = 5.2,
  motes = true,
  showProgressBar = true,
  loop = false,
  className,
}: Props) {
  const rimRef = useRef<HTMLDivElement>(null);

  // Build the cylindrical coin rim from N radial strips.
  // Alternating brightness creates a reeded (milled) edge.
  useEffect(() => {
    const rim = rimRef.current;
    if (!rim) return;
    rim.innerHTML = '';

    const N = 100;
    const R = 56; // half of the 112px coin stage
    const arc = (2 * Math.PI * R) / N;
    const width = arc + 1.2;

    for (let i = 0; i < N; i++) {
      const strip = document.createElement('div');
      strip.className = styles.strip;
      const deg = (360 / N) * i;
      strip.style.width = `${width}px`;
      strip.style.marginLeft = `${-width / 2}px`;
      strip.style.transform = `rotateY(${deg}deg) translateZ(${R}px)`;
      strip.style.filter =
        i % 2 === 0 ? 'brightness(1.12) saturate(1.05)' : 'brightness(0.92) saturate(1.25)';
      rim.appendChild(strip);
    }
  }, []);

  const wrapperStyle: ProposalCSSProperties = {
    '--proposal-scale': `${scale}`,
  };

  return (
    <div
      className={`${styles.wrapper} ${className ?? ''}`}
      style={wrapperStyle}
      aria-label="Research proposal with ResearchCoin funding"
    >
      <div className={styles.scene}>
        <div className={styles.halo} />
        {motes && (
          <>
            <div className={`${styles.mote} ${styles.m1}`} />
            <div className={`${styles.mote} ${styles.m2}`} />
            <div className={`${styles.mote} ${styles.m3}`} />
            <div className={`${styles.mote} ${styles.m4}`} />
          </>
        )}

        {/* Paper (behind) */}
        <div className={styles.paperWrap}>
          <div className={styles.paper}>
            <div className={styles.paperFace}>
              <svg
                className={styles.paperSvg}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 182 234"
                width="182"
                height="234"
              >
                <text
                  x="22"
                  y="47"
                  fontFamily="Geist, system-ui, sans-serif"
                  fontSize="12"
                  fontWeight="700"
                  fill="#3971FF"
                  letterSpacing="0.03em"
                >
                  Proposal
                </text>
                <line
                  x1="22"
                  y1="72"
                  x2="158"
                  y2="72"
                  stroke="#94a3b8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <line
                  x1="22"
                  y1="96"
                  x2="158"
                  y2="96"
                  stroke="#94a3b8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <line
                  x1="22"
                  y1="120"
                  x2="158"
                  y2="120"
                  stroke="#94a3b8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <line
                  x1="22"
                  y1="144"
                  x2="158"
                  y2="144"
                  stroke="#94a3b8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <line
                  x1="22"
                  y1="168"
                  x2="158"
                  y2="168"
                  stroke="#94a3b8"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className={styles.paperEdgeL} />
            <div className={styles.paperEdgeB} />
          </div>
        </div>

        {/* Coin (in front) */}
        <div className={styles.coinWrap}>
          <div className={styles.coinStage}>
            <div
              className={styles.coin}
              style={{ '--sway-duration': `${swayDuration}s` } as ProposalCSSProperties}
            >
              <div className={styles.rim} ref={rimRef} />
              <div className={`${styles.coinFace} ${styles.front}`}>
                <CoinGlyph />
              </div>
              <div className={`${styles.coinFace} ${styles.back}`}>
                <CoinGlyph />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showProgressBar && (
        <div className={styles.barArea}>
          <div className={styles.barTrack}>
            <div className={`${styles.barFill} ${loop ? styles.loop : ''}`} />
          </div>
          {!loop && (
            <div className={styles.fundedBadge}>
              <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
                <circle cx="8" cy="8" r="8" fill="#16a34a" />
                <polyline
                  points="4.5,8.5 7,11 11.5,5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
              Funded
            </div>
          )}
        </div>
      )}
    </div>
  );
}
