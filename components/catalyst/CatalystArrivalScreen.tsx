'use client';

import { useEffect, useRef, useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { CatalystNyc } from './CatalystNyc';

// Simple (non-compounded) yield: 56.1% of the original $500 each year, years 0..10.
const RATE = 0.561;
const BASE = 500;
const MAX = BASE * (1 + RATE * 10);
const BAR_COUNT = 11;

const HEADLINE = "We want you to fund science — here's some ResearchCoin to get started.";

function money(n: number): string {
  return '$' + Math.round(n).toLocaleString('en-US');
}

interface CatalystArrivalScreenProps {
  onClaim: () => void;
}

export function CatalystArrivalScreen({ onClaim }: CatalystArrivalScreenProps) {
  const [yr, setYr] = useState(0);
  const holdRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      setYr((prev) => {
        // Linger a few ticks on the starting balance before climbing.
        if (prev === 0 && holdRef.current < 3) {
          holdRef.current += 1;
          return prev;
        }
        holdRef.current = 0;
        return prev >= 10 ? 0 : prev + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, []);

  const value = BASE * (1 + RATE * yr);
  const yrText =
    (yr === 0 ? 'Your starting balance today' : `After ${yr} ${yr === 1 ? 'year' : 'years'}`) +
    ' · 56.1% / yr';

  return (
    <div className="catalyst-arrival">
      <main className="screen">
        <div className="screen__bg" />
        <div className="screen__grid" />
        <div className="content">
          <div className="lockup">
            <Logo variant="white" size={25} />
            <span className="lockup__div" />
            <span className="lockup__cat">
              <b>Catalyst</b>
              <CatalystNyc fill="#FFFFFF" height={15} />
            </span>
          </div>

          <section className="growth">
            <div className="balance">{money(value)}</div>
            <div className="yrline">{yrText}</div>
            <div className="bars">
              {Array.from({ length: BAR_COUNT }).map((_, i) => {
                const barValue = BASE * (1 + RATE * i);
                const height = Math.max(3, (barValue / MAX) * 100);
                const active = i <= yr;
                return (
                  <i
                    key={i}
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

          <h1 className="headline">{HEADLINE}</h1>

          <div className="offer">
            <button className="cta" type="button" onClick={onClaim}>
              Claim my $500
            </button>
            <div className="foot">Catalyst NYC promotional event</div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .catalyst-arrival {
          font-family:
            var(--font-geist-sans),
            -apple-system,
            system-ui,
            sans-serif;
          background: #11121a;
          display: flex;
          justify-content: center;
          -webkit-font-smoothing: antialiased;
          min-height: 100vh;
          min-height: 100dvh;
        }
        .screen {
          position: relative;
          width: 100%;
          /* Full-bleed on phones; only frame as a centered column on larger screens. */
          max-width: none;
          min-height: 100vh;
          min-height: 100dvh;
          background: #0c0720;
          overflow: hidden;
          color: #fff;
        }
        @media (min-width: 640px) {
          .screen {
            max-width: 393px;
          }
        }
        .screen__bg {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            108% 86% at 24% 22%,
            #7b43be 0%,
            #5a2db0 24%,
            #3a1f86 46%,
            #20104e 72%,
            #0c0720 100%
          );
        }
        .screen__grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 22px 22px;
          -webkit-mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
          mask-image: radial-gradient(120% 100% at 30% 20%, transparent 35%, #000 100%);
        }
        .content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 100vh;
          min-height: 100dvh;
          padding: 56px 30px 40px;
        }
        .lockup {
          display: flex;
          align-items: center;
          gap: 13px;
        }
        .lockup__div {
          width: 1px;
          height: 22px;
          background: rgba(255, 255, 255, 0.32);
        }
        .lockup__cat {
          display: flex;
          align-items: baseline;
          gap: 9px;
        }
        .lockup__cat b {
          font-size: 21px;
          font-weight: 600;
          letter-spacing: -0.04em;
        }
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
        .bars > :global(i) {
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
        .foot {
          text-align: center;
          margin-top: 16px;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  );
}
