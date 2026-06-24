'use client';

import { useEffect, useRef, useState } from 'react';
import { CATALYST_NYC_EVENT, formatMoney } from './constants';
import { CatalystLockup } from './CatalystLockup';
import { CatalystScreenShell } from './CatalystScreenShell';

const {
  creditAmount,
  yieldRate,
  yieldLabel,
  barCount,
  maxYears,
  animationIntervalMs,
  arrival,
  footer,
} = CATALYST_NYC_EVENT;

const MAX = creditAmount * (1 + yieldRate * maxYears);

interface CatalystArrivalScreenProps {
  onClaim: () => void;
}

export function CatalystArrivalScreen({ onClaim }: CatalystArrivalScreenProps) {
  const [yr, setYr] = useState(0);
  const holdRef = useRef(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return undefined;
    }

    const id = setInterval(() => {
      setYr((prev) => {
        if (prev === 0 && holdRef.current < 3) {
          holdRef.current += 1;
          return prev;
        }
        holdRef.current = 0;
        return prev >= maxYears ? 0 : prev + 1;
      });
    }, animationIntervalMs);

    return () => clearInterval(id);
  }, []);

  const value = creditAmount * (1 + yieldRate * yr);
  const yrText =
    (yr === 0 ? 'Your starting balance today' : `After ${yr} ${yr === 1 ? 'year' : 'years'}`) +
    ` · ${yieldLabel}`;

  return (
    <CatalystScreenShell contentLayout="spread">
      <CatalystLockup variant="arrival" />

      <section className="growth">
        <div className="balance">{formatMoney(value)}</div>
        <div className="yrline">{yrText}</div>
        <div className="bars">
          {Array.from({ length: barCount }).map((_, i) => {
            const barValue = creditAmount * (1 + yieldRate * i);
            const height = Math.max(3, (barValue / MAX) * 100);
            const active = i <= yr;
            return (
              <span
                key={i}
                aria-hidden="true"
                style={{
                  height: `${height}%`,
                  background: active
                    ? 'linear-gradient(180deg,#86efac,#22c55e)'
                    : 'rgba(255,255,255,.13)',
                  boxShadow: i === yr ? '0 0 0 2px rgba(134,239,172,.55)' : 'none',
                }}
              />
            );
          })}
        </div>
        <div className="axis">
          <span>Now</span>
          <span>5 years</span>
          <span>10 years</span>
        </div>
      </section>

      <h1 className="headline">{arrival.headline}</h1>

      <div className="offer">
        <button className="cta" type="button" onClick={onClaim}>
          {arrival.cta}
        </button>
        <div className="foot">{footer}</div>
      </div>

      <style jsx>{`
        .balance {
          font-size: 54px;
          font-weight: 700;
          letter-spacing: -0.03em;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          margin-bottom: 6px;
        }
        .yrline {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 26px;
        }
        .bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 92px;
        }
        .bars > :global(span) {
          flex: 1;
          display: block;
          border-radius: 3px 3px 0 0;
          transition:
            background 0.3s,
            box-shadow 0.3s;
        }
        .axis {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
          font-size: 11px;
          color: #c8b6f2;
        }
        .headline {
          font-size: 29px;
          line-height: 1.18;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .cta {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 16px;
          background: #fff;
          color: #0c0720;
          font-family: inherit;
          font-size: 17px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 30px -8px rgba(0, 0, 0, 0.5);
          transition: background 0.15s;
        }
        .cta:hover {
          background: #f1ecfb;
        }
        .cta:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
        .foot {
          text-align: center;
          margin-top: 16px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </CatalystScreenShell>
  );
}
