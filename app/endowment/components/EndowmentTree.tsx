'use client';

interface RSCFruitProps {
  x: number;
  y: number;
  size?: number;
}

function RSCFruit({ x, y, size = 44 }: RSCFruitProps) {
  const stroke = '#C2410C';
  const fill = '#F97316';
  const coinFill = '#FFF7ED';
  const s = size / 14;
  return (
    <g transform={`translate(${x - size / 2}, ${y - size / 2}) scale(${s})`}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.96539 1.07912C11.2355 1.61221 13.4541 4.6951 12.9209 7.96525C12.3877 11.2355 9.30472 13.454 6.03461 12.9209C2.7645 12.3876 0.545902 9.30493 1.07911 6.03456C1.61231 2.7643 4.69517 0.545903 7.96539 1.07912Z"
        stroke={stroke}
        strokeWidth="0.9"
        fill={coinFill}
      />
      <g transform="translate(1, 1)" fill={fill}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M6.76253 6.13023L8.5816 9.00106C8.71656 9.21596 8.74249 9.39999 8.65926 9.55317C8.57612 9.70644 8.40678 9.78308 8.15131 9.78308H3.98532C3.7298 9.78308 3.56043 9.70644 3.47725 9.55317C3.39407 9.39999 3.42 9.21591 3.55497 9.00102L5.37393 6.13019V4.68565L5.37955 4.2511H6.75815L6.76253 4.68564V6.13023ZM5.76572 6.37631L4.90355 7.64457H7.23656L6.37316 6.37631L6.30086 6.26405V6.13013V4.68559H5.83803V6.13013V6.26405L5.76572 6.37631Z"
        />
        <path d="M5.36161 6.42662L4.71875 7.92663L7.71875 8.1409L6.43304 6.21233V4.49805H5.57589V4.92662L5.36161 6.42662Z" />
        <rect x="4.89844" y="4.19885" width="2.33301" height="0.530231" rx="0.265115" />
        <rect x="4.64062" y="2.3689" width="1.1" height="1.1" rx="0.55" />
        <rect x="6.5" y="2.3689" width="1.1" height="1.1" rx="0.55" />
        <rect x="5.70469" y="1.2854" width="0.85" height="0.85" rx="0.425" />
      </g>
    </g>
  );
}

const STROKE = '#0b1530';
const TRUNK = '#1e3a8a';
const LEAF_LIGHT = '#93c5fd';
const LEAF_MID = '#60a5fa';
const LEAF_DARK = '#3971FF';

const FRUITS = [
  { x: 215, y: 130, size: 45, delay: 0 },
  { x: 290, y: 110, size: 51, delay: 0.4 },
  { x: 365, y: 140, size: 43, delay: 0.8 },
  { x: 175, y: 200, size: 38, delay: 0.2 },
  { x: 260, y: 195, size: 46, delay: 1.0 },
  { x: 345, y: 215, size: 40, delay: 0.6 },
  { x: 410, y: 195, size: 40, delay: 1.2 },
  { x: 220, y: 260, size: 35, delay: 0.5 },
  { x: 360, y: 270, size: 35, delay: 0.9 },
];

const SPROUTS = [
  { x: 80, y: 540, s: 0.9, flip: 1 },
  { x: 145, y: 528, s: 1.15, flip: -1 },
  { x: 200, y: 516, s: 0.85, flip: 1 },
  { x: 345, y: 510, s: 1.2, flip: -1 },
  { x: 415, y: 524, s: 1.0, flip: 1 },
  { x: 470, y: 534, s: 0.8, flip: -1 },
];

interface EndowmentTreeProps {
  /**
   * When true, the tree omits its own ground halo / grass mound / sprouts / tufts.
   * Useful when an external full-width <EndowmentGround> is rendered behind it
   * so the soil can extend edge-to-edge across the section.
   */
  hideGround?: boolean;
}

export function EndowmentTree({ hideGround = false }: Readonly<EndowmentTreeProps> = {}) {
  return (
    <div className="endowment-tree-wrap" aria-hidden="true">
      <div className="endowment-tree-glow" />
      <svg className="endowment-tree-svg" viewBox="0 0 540 545" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="endowmentGroundGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#eff4ff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#eff4ff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {!hideGround && (
          <>
            <ellipse cx="270" cy="540" rx="250" ry="22" fill="url(#endowmentGroundGrad)" />
            <path
              d="M 30 545 Q 270 500 510 545 L 510 600 L 30 600 Z"
              fill="#dbeafe"
              stroke={STROKE}
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <g stroke={STROKE} strokeWidth="2.2" strokeLinecap="round" fill="none">
              <path d="M 95 530 q 3 -8 6 0 M 100 530 q 0 -6 4 0" />
              <path d="M 420 528 q 3 -8 6 0 M 425 528 q 0 -6 4 0" />
              <path d="M 175 522 q 3 -7 6 0" />
              <path d="M 360 520 q 3 -7 6 0" />
            </g>

            {SPROUTS.map((sp, i) => (
              <g
                key={`sprout-${i}`}
                transform={`translate(${sp.x}, ${sp.y}) scale(${sp.s * sp.flip}, ${sp.s})`}
              >
                <path
                  d="M 0 0 C 2 -10, -2 -18, 0 -30"
                  stroke={STROKE}
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 0 C 2 -10, -2 -18, 0 -30"
                  stroke={TRUNK}
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                />
                <path
                  d="M 0 -14 C -8 -17, -14 -11, -12 -5 C -5 -7, 0 -11, 0 -14 Z"
                  fill={LEAF_DARK}
                  stroke={STROKE}
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
                <path
                  d="M 0 -26 C 8 -27, 14 -21, 12 -15 C 5 -17, 0 -22, 0 -26 Z"
                  fill={LEAF_MID}
                  stroke={STROKE}
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </g>
            ))}
          </>
        )}

        <g className="endowment-tree-sway" style={{ transformOrigin: '270px 540px' }}>
          <path
            d="M 240 540 C 238 480, 250 440, 246 390 C 243 350, 252 320, 252 290 L 288 290 C 288 320, 297 350, 294 390 C 290 440, 302 480, 300 540 Z"
            fill={TRUNK}
            stroke={STROKE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <path
            d="M 252 530 C 250 480, 258 430, 256 380 C 255 350, 260 320, 260 295"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.7"
          />

          <path
            d="M 252 350 C 220 335, 195 330, 175 330"
            stroke={TRUNK}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 252 350 C 220 335, 195 330, 175 330"
            stroke={STROKE}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 288 320 C 320 305, 350 300, 380 300"
            stroke={TRUNK}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 288 320 C 320 305, 350 300, 380 300"
            stroke={STROKE}
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />

          <path
            d="M 130 200
               C 90 200, 75 160, 105 135
               C 90 100, 130 70, 165 85
               C 175 50, 235 45, 255 75
               C 280 50, 335 55, 350 90
               C 395 75, 435 110, 420 150
               C 460 165, 460 220, 420 235
               C 430 275, 380 295, 350 275
               C 335 305, 280 305, 260 280
               C 235 305, 180 300, 165 270
               C 125 280, 90 245, 105 215
               C 95 215, 90 205, 130 200 Z"
            fill={LEAF_DARK}
            stroke={STROKE}
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          <path
            d="M 165 185
               C 135 185, 125 155, 150 135
               C 145 105, 185 90, 210 105
               C 225 80, 275 80, 290 105
               C 320 90, 360 110, 355 145
               C 385 155, 385 200, 350 210
               C 355 240, 310 255, 290 235
               C 275 260, 235 260, 220 235
               C 195 255, 155 240, 160 210
               C 140 205, 145 190, 165 185 Z"
            fill={LEAF_MID}
            stroke={STROKE}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <path
            d="M 195 175
               C 175 175, 170 150, 195 140
               C 200 115, 240 110, 255 130
               C 280 115, 315 130, 310 160
               C 335 170, 325 200, 300 200
               C 295 220, 255 225, 245 205
               C 225 220, 195 210, 200 190
               C 185 188, 185 178, 195 175 Z"
            fill={LEAF_LIGHT}
            stroke={STROKE}
            strokeWidth="3"
            strokeLinejoin="round"
          />

          <g fill={LEAF_DARK} stroke={STROKE} strokeWidth="2.5">
            <path d="M 175 330 q -10 -10 -22 -6 q 8 12 22 6 z" />
            <path d="M 380 300 q 10 -10 22 -6 q -8 12 -22 6 z" />
          </g>

          {FRUITS.map((f, i) => (
            <g
              key={`fruit-${i}`}
              className="endowment-coin"
              style={{
                transformOrigin: `${f.x}px ${f.y}px`,
                animationDelay: `${f.delay}s`,
              }}
            >
              <path
                d={`M ${f.x} ${f.y - f.size / 2 + 2} q -2 -8, 4 -12`}
                stroke={STROKE}
                strokeWidth="2.2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d={`M ${f.x + 4} ${f.y - f.size / 2 - 10} q 8 -2 12 4 q -10 4 -12 -4 z`}
                fill={LEAF_LIGHT}
                stroke={STROKE}
                strokeWidth="1.6"
              />
              <ellipse
                cx={f.x}
                cy={f.y + f.size / 2 - 2}
                rx={f.size * 0.42}
                ry={3}
                fill="#0b1530"
                opacity="0.12"
              />
              <RSCFruit x={f.x} y={f.y} size={f.size} />
            </g>
          ))}

          <g
            className="endowment-sparkles"
            fill="#FCD34D"
            stroke={STROKE}
            strokeWidth="1.5"
            strokeLinejoin="round"
          >
            <path d="M 95 110 l 6 -12 l 6 12 l 12 6 l -12 6 l -6 12 l -6 -12 l -12 -6 z" />
            <path d="M 445 90 l 5 -10 l 5 10 l 10 5 l -10 5 l -5 10 l -5 -10 l -10 -5 z" />
            <path d="M 70 240 l 4 -8 l 4 8 l 8 4 l -8 4 l -4 8 l -4 -8 l -8 -4 z" />
          </g>
        </g>
      </svg>

      <style jsx>{`
        .endowment-tree-wrap {
          position: relative;
          width: 100%;
          max-width: 720px;
          margin: 0 auto;
          /* Aspect ratio matches the viewBox (540 × 545) so the wrap's bottom edge
             coincides with the trunk's bottom (no empty space below the trunk).
             This lets a small predictable negative margin plant the tree in the soil
             at every breakpoint. */
          aspect-ratio: 540 / 545;
        }
        .endowment-tree-glow {
          position: absolute;
          inset: 8% 6% 4% 6%;
          background:
            radial-gradient(ellipse at 50% 35%, rgba(57, 113, 255, 0.22), transparent 65%),
            radial-gradient(ellipse at 50% 90%, rgba(249, 115, 22, 0.18), transparent 60%);
          filter: blur(20px);
          pointer-events: none;
        }
        .endowment-tree-svg {
          position: relative;
          width: 100%;
          height: 100%;
          display: block;
        }
      `}</style>
      <style jsx global>{`
        @keyframes endowmentTreeSway {
          0%,
          100% {
            transform: rotate(-0.6deg);
          }
          50% {
            transform: rotate(0.6deg);
          }
        }
        .endowment-tree-sway {
          animation: endowmentTreeSway 7s ease-in-out infinite;
          transform-box: fill-box;
        }
        @keyframes endowmentCoinBob {
          0%,
          100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-3px) rotate(2deg);
          }
        }
        .endowment-coin {
          animation: endowmentCoinBob 4.5s ease-in-out infinite;
          transform-box: fill-box;
        }
        @keyframes endowmentSparkleTwinkle {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.1);
          }
        }
        .endowment-sparkles path {
          animation: endowmentSparkleTwinkle 3s ease-in-out infinite;
          transform-box: fill-box;
          transform-origin: center;
        }
        .endowment-sparkles path:nth-child(2) {
          animation-delay: 1s;
        }
        .endowment-sparkles path:nth-child(3) {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}
