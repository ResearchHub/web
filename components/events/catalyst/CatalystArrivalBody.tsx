'use client';

import { useEffect, useRef, useState } from 'react';
import { useStakingYieldStats } from '@/hooks/useStakingYield';
import { CATALYST_NYC_EVENT, formatMoney } from './constants';

const { creditAmount, barCount, maxYears, animationIntervalMs, arrival, footer } =
  CATALYST_NYC_EVENT;

interface CatalystArrivalBodyProps {
  onClaim: () => void;
  compact?: boolean;
}

export function CatalystArrivalBody({
  onClaim,
  compact = false,
}: Readonly<CatalystArrivalBodyProps>) {
  const { stats, isLoading, error } = useStakingYieldStats();
  const [yr, setYr] = useState(0);
  const holdRef = useRef(0);

  const apy = stats?.apy;
  const isReady = !isLoading && !error && typeof apy === 'number' && Number.isFinite(apy);
  const yieldRate = isReady ? apy / 100 : null;
  const yieldLabel = isReady ? `${apy.toFixed(1)}% / yr` : null;

  const max = yieldRate !== null ? creditAmount * (1 + yieldRate * maxYears) : null;
  const bars =
    yieldRate !== null && max !== null
      ? Array.from({ length: barCount }, (_, i) => ({
          year: i,
          heightPct: Math.max(3, ((creditAmount * (1 + yieldRate * i)) / max) * 100),
        }))
      : null;

  useEffect(() => {
    if (!isReady) {
      return undefined;
    }

    const prefersReducedMotion = globalThis.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return undefined;
    }

    const id = setInterval(() => {
      setYr((prev) => {
        if (prev === 0 && holdRef.current < 2) {
          holdRef.current += 1;
          return prev;
        }
        holdRef.current = 0;
        return prev >= maxYears ? 0 : prev + 1;
      });
    }, animationIntervalMs);

    return () => clearInterval(id);
  }, [isReady]);

  const value = yieldRate !== null ? creditAmount * (1 + yieldRate * yr) : null;
  const yearWord = yr === 1 ? 'year' : 'years';
  const phaseLabel = yr === 0 ? 'Your starting balance today' : `After ${yr} ${yearWord}`;
  let yrText: string | null = null;
  if (isReady) {
    yrText = yr === 0 && yieldLabel !== null ? `${phaseLabel} · ${yieldLabel}` : phaseLabel;
  }

  return (
    <>
      <section className={`growth ${compact ? 'growth--compact' : ''}`}>
        {isReady && value !== null && yrText !== null && bars !== null ? (
          <>
            <div className="balance">{formatMoney(value)}</div>
            <div className="yrline">{yrText}</div>
            <div className="bars">
              {bars.map(({ year, heightPct }) => {
                const active = year <= yr;
                return (
                  <span
                    key={year}
                    aria-hidden="true"
                    style={{
                      height: `${heightPct}%`,
                      background: active
                        ? 'linear-gradient(180deg,#86efac,#22c55e)'
                        : 'rgba(255,255,255,.13)',
                      boxShadow: year === yr ? '0 0 0 2px rgba(134,239,172,.55)' : 'none',
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
          </>
        ) : (
          <div className="yield-status" aria-busy={isLoading} aria-live="polite">
            {isLoading ? 'Loading yield…' : 'Yield unavailable'}
          </div>
        )}
      </section>

      <h1 className={`headline ${compact ? 'headline--compact' : ''}`}>{arrival.headline}</h1>

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
        .growth--compact .balance {
          font-size: 42px;
        }
        .yrline {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 26px;
        }
        .growth--compact .yrline {
          margin-bottom: 18px;
        }
        .bars {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 92px;
        }
        .growth--compact .bars {
          height: 72px;
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
        .yield-status {
          display: flex;
          align-items: center;
          min-height: 140px;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.65);
        }
        .growth--compact .yield-status {
          min-height: 110px;
        }
        .headline {
          font-size: 29px;
          line-height: 1.18;
          font-weight: 600;
          letter-spacing: -0.02em;
        }
        .headline--compact {
          font-size: 24px;
          margin-top: 20px;
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
    </>
  );
}
