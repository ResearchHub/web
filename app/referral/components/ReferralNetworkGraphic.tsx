'use client';

interface Point {
  x: number;
  y: number;
}

interface Link {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

// Hub = "you"; inner ring = funders you refer; outer ring = the funders THEY
// refer. The radial branching reads as a referral network spreading outward,
// with RSC-orange pulses flowing along each connection.
const HUB: Point = { x: 280, y: 280 };

const INNER: ReadonlyArray<Point> = [
  { x: 405, y: 280 },
  { x: 342.5, y: 388.3 },
  { x: 217.5, y: 388.3 },
  { x: 155, y: 280 },
  { x: 217.5, y: 171.7 },
  { x: 342.5, y: 171.7 },
];

const OUTER: ReadonlyArray<Point> = [
  { x: 465.8, y: 366.6 },
  { x: 297.9, y: 484.2 },
  { x: 112.1, y: 397.6 },
  { x: 94.2, y: 193.4 },
  { x: 262.1, y: 75.8 },
  { x: 447.9, y: 162.4 },
];

// Links that carry an animated pulse: hub -> each inner node, then each inner
// node -> its outer node. Ordered start (closer to hub) -> end so the pulse
// travels outward.
const FLOW_LINKS: ReadonlyArray<Link> = [
  ...INNER.map((n) => ({ x1: HUB.x, y1: HUB.y, x2: n.x, y2: n.y })),
  ...INNER.map((n, i) => ({ x1: n.x, y1: n.y, x2: OUTER[i].x, y2: OUTER[i].y })),
];

// Faint connections between adjacent inner nodes so the graphic reads as an
// interconnected community rather than a pure radial tree.
const RING_LINKS: ReadonlyArray<Link> = INNER.map((n, i) => {
  const next = INNER[(i + 1) % INNER.length];
  return { x1: n.x, y1: n.y, x2: next.x, y2: next.y };
});

export function ReferralNetworkGraphic() {
  return (
    <div
      className="referral-ng"
      role="img"
      aria-label="An animated referral network spreading out from you to the funders you invite"
    >
      <svg viewBox="0 0 560 560" className="referral-ng-svg" aria-hidden="true">
        <defs>
          <radialGradient id="referralNgNodeGrad" cx="50%" cy="38%" r="65%">
            <stop offset="0%" stopColor="#f0f6ff" />
            <stop offset="55%" stopColor="#7da6ff" />
            <stop offset="100%" stopColor="#3971ff" />
          </radialGradient>
          <radialGradient id="referralNgHubGrad" cx="50%" cy="36%" r="68%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#6f9bff" />
            <stop offset="100%" stopColor="#2c5ee8" />
          </radialGradient>
          <radialGradient id="referralNgGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(91,141,255,0.55)" />
            <stop offset="100%" stopColor="rgba(91,141,255,0)" />
          </radialGradient>
          <radialGradient id="referralNgHubGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(99,142,255,0.55)" />
            <stop offset="45%" stopColor="rgba(251,146,60,0.18)" />
            <stop offset="100%" stopColor="rgba(99,142,255,0)" />
          </radialGradient>
        </defs>

        {/* Soft glow anchoring the whole network */}
        <circle cx={HUB.x} cy={HUB.y} r={250} fill="url(#referralNgHubGlow)" opacity={0.7} />

        {/* Faint community ring between inner nodes */}
        {RING_LINKS.map((l, i) => (
          <line
            key={`ring-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            className="referral-ng-ring"
          />
        ))}

        {/* Base connections */}
        {FLOW_LINKS.map((l, i) => (
          <line
            key={`base-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            className="referral-ng-link"
          />
        ))}

        {/* RSC-orange pulses flowing outward along each connection */}
        {FLOW_LINKS.map((l, i) => (
          <line
            key={`flow-${i}`}
            x1={l.x1}
            y1={l.y1}
            x2={l.x2}
            y2={l.y2}
            className="referral-ng-flow"
            pathLength={1}
            style={{ animationDelay: `${(i % 6) * 0.34 + (i >= 6 ? 0.6 : 0)}s` }}
          />
        ))}

        {/* Broadcast pulses emanating from the hub */}
        <circle cx={HUB.x} cy={HUB.y} r={34} className="referral-ng-pulse" />
        <circle
          cx={HUB.x}
          cy={HUB.y}
          r={34}
          className="referral-ng-pulse"
          style={{ animationDelay: '1.4s' }}
        />

        {/* Outer nodes (their referrals) */}
        {OUTER.map((n, i) => (
          <g
            key={`outer-${i}`}
            className="referral-ng-node"
            style={{ animationDelay: `${i * 0.4 + 0.8}s` }}
          >
            <circle cx={n.x} cy={n.y} r={26} fill="url(#referralNgGlow)" opacity={0.7} />
            <circle
              cx={n.x}
              cy={n.y}
              r={8.5}
              fill="url(#referralNgNodeGrad)"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth={1}
            />
          </g>
        ))}

        {/* Inner nodes (funders you refer) */}
        {INNER.map((n, i) => (
          <g
            key={`inner-${i}`}
            className="referral-ng-node"
            style={{ animationDelay: `${i * 0.35}s` }}
          >
            <circle cx={n.x} cy={n.y} r={34} fill="url(#referralNgGlow)" opacity={0.85} />
            <circle
              cx={n.x}
              cy={n.y}
              r={12.5}
              fill="url(#referralNgNodeGrad)"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.5}
            />
          </g>
        ))}

        {/* Hub = you */}
        <g className="referral-ng-hub">
          <circle cx={HUB.x} cy={HUB.y} r={60} fill="url(#referralNgGlow)" opacity={0.9} />
          <circle
            cx={HUB.x}
            cy={HUB.y}
            r={30}
            fill="url(#referralNgHubGrad)"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth={2}
          />
          <circle cx={HUB.x} cy={270} r={7.5} fill="#ffffff" />
          <path d="M267 295 Q267 281 280 281 Q293 281 293 295 Z" fill="#ffffff" />
        </g>
      </svg>

      <style jsx>{`
        .referral-ng {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .referral-ng-svg {
          width: 100%;
          height: auto;
          max-width: 520px;
          overflow: visible;
        }
      `}</style>
      <style jsx global>{`
        .referral-ng-link {
          stroke: rgba(147, 197, 253, 0.3);
          stroke-width: 1.4;
          stroke-linecap: round;
        }
        .referral-ng-ring {
          stroke: rgba(147, 197, 253, 0.14);
          stroke-width: 1.2;
          stroke-linecap: round;
        }
        .referral-ng-flow {
          stroke: #fb923c;
          stroke-width: 2.6;
          stroke-linecap: round;
          stroke-dasharray: 0.16 1;
          filter: drop-shadow(0 0 4px rgba(251, 146, 60, 0.7));
          animation: referralNgFlow 2.8s linear infinite;
        }
        @keyframes referralNgFlow {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -1.16;
          }
        }
        .referral-ng-node {
          transform-box: fill-box;
          transform-origin: center;
          animation: referralNgTwinkle 4.2s ease-in-out infinite;
        }
        @keyframes referralNgTwinkle {
          0%,
          100% {
            opacity: 0.78;
          }
          50% {
            opacity: 1;
          }
        }
        .referral-ng-hub {
          transform-box: fill-box;
          transform-origin: center;
          animation: referralNgHubFloat 5s ease-in-out infinite;
        }
        @keyframes referralNgHubFloat {
          0%,
          100% {
            transform: translateY(-2px);
          }
          50% {
            transform: translateY(2px);
          }
        }
        .referral-ng-pulse {
          fill: none;
          stroke: rgba(147, 197, 253, 0.6);
          stroke-width: 1.5;
          opacity: 0;
          animation: referralNgPulse 2.8s ease-out infinite;
        }
        @keyframes referralNgPulse {
          0% {
            r: 34px;
            opacity: 0.5;
          }
          100% {
            r: 150px;
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .referral-ng-flow,
          .referral-ng-node,
          .referral-ng-hub,
          .referral-ng-pulse {
            animation: none;
          }
          .referral-ng-pulse {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
