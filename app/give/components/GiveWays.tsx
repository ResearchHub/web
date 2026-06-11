'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { HandCoins, Sprout } from 'lucide-react';
import AnimatedResearchCoin from '@/components/ResearchCoin/AnimatedResearchCoin/AnimatedResearchCoin';

interface Way {
  icon: ReactNode;
  tag: string;
  title: string;
  body: string;
}

const WAYS: ReadonlyArray<Way> = [
  {
    icon: <HandCoins size={26} strokeWidth={1.75} />,
    tag: 'Most direct',
    title: 'Make a one-time contribution',
    body: 'Back a peer-reviewed funding opportunity directly and follow it all the way from funded to published.',
  },
  {
    icon: (
      <span
        className="give-way-endaoment"
        role="img"
        aria-label="Endaoment"
        style={{
          width: 28,
          height: 28,
          display: 'inline-block',
          backgroundColor: 'currentColor',
          WebkitMaskImage: 'url(/logos/endaoment.svg)',
          maskImage: 'url(/logos/endaoment.svg)',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
      />
    ),
    tag: 'Tax-advantaged',
    title: 'Give through your DAF',
    body: 'Recommend a grant from your donor-advised fund in a few clicks through our Endaoment integration.',
  },
  {
    icon: <Sprout size={26} strokeWidth={1.75} />,
    tag: 'Earn, then give',
    title: 'Use Funding Credits',
    body: 'Deposit RSC into the ResearchHub Endowment, earn daily Funding Credits, and direct them to research.',
  },
];

export function GiveWays() {
  // The coin is CSS-sized in px, so measure its column and clamp for a large
  // but responsive presence.
  const coinWrapRef = useRef<HTMLDivElement>(null);
  const [coinSize, setCoinSize] = useState(340);

  useEffect(() => {
    const el = coinWrapRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      setCoinSize(Math.round(Math.max(200, Math.min(360, w * 0.82))));
    };
    measure();
    let ro: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      ro = new ResizeObserver(measure);
      ro.observe(el);
    } else {
      window.addEventListener('resize', measure);
    }
    return () => {
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', measure);
    };
  }, []);

  return (
    <section id="give-ways" className="give-ways">
      <div className="give-ways-inner give-ways-head">
        <h2 className="give-ways-h2">
          More than one way to <span className="give-ways-accent">fund a breakthrough.</span>
        </h2>
        <p className="give-ways-lead">
          However you give, every dollar is non-extractive and routed straight into open science.
          Pick the path that fits how you want to make an impact.
        </p>
      </div>

      <div className="give-ways-inner">
        <div className="give-ways-split">
          <div className="give-ways-grid">
            {WAYS.map((w) => (
              <div key={w.title} className="give-way-card">
                <div className="give-way-icon">{w.icon}</div>
                <div className="give-way-text">
                  <div className="give-way-top">
                    <h3>{w.title}</h3>
                    <span className="give-way-tag">{w.tag}</span>
                  </div>
                  <p>{w.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="give-ways-coin" ref={coinWrapRef}>
            <div className="give-ways-coin-glow" aria-hidden />
            <AnimatedResearchCoin size={coinSize} spinDuration={6} />
          </div>
        </div>
      </div>

      <style jsx>{`
        .give-ways {
          padding: 96px 28px;
          background: #fff;
        }
        .give-ways-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .give-ways-head {
          text-align: center;
          max-width: 760px;
        }
        .give-ways-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .give-ways-accent {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .give-ways-lead {
          font-size: 19px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0 auto;
        }
        .give-ways-split {
          display: grid;
          grid-template-columns: 1fr 0.8fr;
          gap: 80px;
          align-items: center;
          margin-top: 56px;
        }
        .give-ways-coin {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 360px;
        }
        .give-ways-coin-glow {
          position: absolute;
          inset: 10% 6%;
          background: radial-gradient(circle at 50% 45%, rgba(249, 115, 22, 0.22), transparent 62%);
          filter: blur(28px);
          pointer-events: none;
        }
        .give-ways-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        @media (max-width: 1100px) {
          .give-ways-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 900px) {
          .give-ways-split {
            grid-template-columns: minmax(0, 1fr);
            gap: 28px;
          }
          .give-ways-coin {
            min-height: 0;
          }
        }
        @media (max-width: 640px) {
          .give-ways {
            padding: 64px 16px;
          }
          .give-ways-h2 {
            font-size: 30px;
          }
          .give-ways-lead {
            font-size: 16px;
          }
        }
      `}</style>
      <style jsx global>{`
        .give-way-card {
          display: flex;
          align-items: flex-start;
          gap: 18px;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 22px 24px;
          box-shadow: 0 18px 40px -24px rgba(13, 30, 80, 0.15);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }
        .give-way-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 50px -22px rgba(57, 113, 255, 0.22);
          border-color: #bfdbfe;
        }
        .give-way-icon {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, #eff4ff 0%, #dbeafe 100%);
          border: 1px solid #dbeafe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #3971ff;
        }
        .give-way-text {
          min-width: 0;
        }
        .give-way-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 4px;
        }
        .give-way-tag {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #1d4ed8;
          background: #eff4ff;
          border-radius: 9999px;
          padding: 5px 10px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .give-way-card h3 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0b1530;
          margin: 0;
          letter-spacing: -0.018em;
        }
        .give-way-card p {
          font-size: 14.5px;
          color: #4b5563;
          line-height: 1.55;
          margin: 0;
        }
        @media (max-width: 480px) {
          .give-way-top {
            flex-direction: column;
            align-items: flex-start;
            gap: 6px;
          }
        }
      `}</style>
    </section>
  );
}
