'use client';

import { useState, type ReactNode } from 'react';
import { Play } from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface Step {
  num: string;
  icon: ReactNode;
  title: string;
  body: string;
}

const STEPS: ReadonlyArray<Step> = [
  {
    num: '01',
    icon: <Icon name="wallet1" size={32} />,
    title: 'Deposit ResearchCoin',
    body: 'Deposit RSC into your ResearchHub account. Your principal is fully revocable, so you can withdraw any time with no lockups.',
  },
  {
    num: '02',
    icon: <ResearchCoinIcon size={32} outlined color="#434343" strokeWidth={1.0} />,
    title: 'Earn Funding Credits',
    body: 'Credits are distributed daily and boosted the longer you hold.',
  },
  {
    num: '03',
    icon: <Icon name="fund" size={32} />,
    title: 'Fund Science',
    body: 'Direct your Funding Credits to preregistered research proposals you believe in. Credits can only fund science.',
  },
];

const VIDEO_SRC = 'https://assets.prod.researchhub.com/videos/researchHub-endowments.MP4#t=2';

function VideoBlock() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="endowment-video-block">
      {isPlaying ? (
        <video
          className="endowment-video-el"
          controls
          autoPlay
          preload="metadata"
          src={VIDEO_SRC}
        />
      ) : (
        <button
          type="button"
          className="endowment-video-poster"
          onClick={() => setIsPlaying(true)}
          aria-label="Play how it works video"
        >
          <span className="endowment-video-pill">
            <Play className="w-3 h-3" aria-hidden /> Watch · 3 min
          </span>
          <span className="endowment-play-cluster">
            <span className="endowment-play-btn">
              <span className="endowment-play-icon" aria-hidden />
            </span>
            <span className="endowment-video-text">
              <span className="endowment-video-title">How the ResearchHub Endowment works</span>
              <span className="endowment-video-sub">
                From RSC deposit to funded research, the full mechanism in 3 minutes.
              </span>
            </span>
          </span>
        </button>
      )}

      <style jsx>{`
        .endowment-video-block {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          background: linear-gradient(135deg, #0b1530, #1e3a8a);
          aspect-ratio: 16 / 9;
          box-shadow: 0 40px 80px -30px rgba(13, 30, 80, 0.4);
        }
        .endowment-video-el {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
        }
        .endowment-video-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background: transparent;
          border: 0;
          padding: 36px 44px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          color: #fff;
          text-align: left;
          cursor: pointer;
          z-index: 2;
        }
        .endowment-video-poster::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(ellipse 60% 50% at 30% 30%, rgba(91, 141, 255, 0.35), transparent 60%),
            radial-gradient(ellipse 50% 40% at 70% 70%, rgba(252, 211, 77, 0.18), transparent 60%);
          pointer-events: none;
        }
        .endowment-video-poster::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0.18;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .endowment-video-pill {
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          align-self: flex-start;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 9999px;
          padding: 6px 14px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #c7d6ff;
          backdrop-filter: blur(4px);
        }
        .endowment-play-cluster {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .endowment-play-btn {
          width: 88px;
          height: 88px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.96);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.4);
          transition: transform 0.2s;
          flex-shrink: 0;
        }
        .endowment-video-poster:hover .endowment-play-btn {
          transform: scale(1.06);
        }
        .endowment-play-icon {
          width: 0;
          height: 0;
          margin-left: 6px;
          border-left: 22px solid #3971ff;
          border-top: 14px solid transparent;
          border-bottom: 14px solid transparent;
        }
        .endowment-video-text {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .endowment-video-title {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 36px;
          font-weight: 700;
          letter-spacing: -0.022em;
          line-height: 1.1;
        }
        .endowment-video-sub {
          color: #c7d6ff;
          font-size: 16px;
          font-weight: 400;
        }
        @media (max-width: 768px) {
          .endowment-video-poster {
            padding: 18px 18px;
          }
          .endowment-video-pill {
            font-size: 10px;
            padding: 4px 10px;
            gap: 6px;
            letter-spacing: 0.06em;
          }
          .endowment-video-pill :global(svg) {
            width: 10px;
            height: 10px;
          }
          .endowment-play-cluster {
            flex-direction: column;
            gap: 12px;
            align-items: center;
            text-align: center;
            width: 100%;
          }
          .endowment-video-text {
            align-items: center;
          }
          .endowment-video-title {
            font-size: 18px;
            line-height: 1.2;
          }
          /* On tablet and below the title alone communicates enough; hiding
             the sub keeps the cluster compact inside the 16:9 poster. */
          .endowment-video-sub {
            display: none;
          }
          .endowment-play-btn {
            width: 52px;
            height: 52px;
          }
          .endowment-play-icon {
            border-left-width: 14px;
            border-top-width: 9px;
            border-bottom-width: 9px;
          }
        }
      `}</style>
    </div>
  );
}

export function EndowmentHowItWorks() {
  return (
    <section className="endowment-section endowment-section-white">
      <div className="endowment-section-narrow endowment-text-center">
        <h2 className="endowment-section-title">Earning Funding Credits is easy.</h2>
        <p className="endowment-section-lead">
          No fees or penalties, just hold tokens in your wallet to start earning.
        </p>
      </div>

      <div className="endowment-section-narrow">
        <div className="endowment-steps-cascade">
          {STEPS.map((step, i) => (
            <div key={step.num} className="endowment-cascade-step" style={{ ['--i' as any]: i }}>
              <div className="endowment-icon-tile">{step.icon}</div>
              <div className="endowment-step-num">{step.num}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="endowment-video" className="endowment-section-narrow endowment-video-wrap">
        <div className="endowment-video-divider" aria-hidden />
        <div className="endowment-video-eyebrow">See it in action</div>
        <VideoBlock />
      </div>

      <style jsx>{`
        .endowment-section {
          /* Less bottom padding because the next section (multiplier) has a
             distinct background, which provides its own visual separation. */
          padding: 96px 28px 72px;
        }
        .endowment-section-white {
          background: #fff;
        }
        .endowment-section-narrow {
          max-width: 1100px;
          margin: 0 auto;
        }
        .endowment-text-center {
          text-align: center;
        }
        .endowment-section-title {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .endowment-section-lead {
          font-size: 19px;
          color: #4b5563;
          line-height: 1.6;
          max-width: 720px;
          margin: 0 auto;
        }
        .endowment-steps-cascade {
          display: flex;
          flex-direction: column;
          margin-top: 56px;
          position: relative;
        }
        .endowment-video-wrap {
          margin-top: 96px;
          padding-top: 56px;
          text-align: center;
          position: relative;
        }
        .endowment-video-divider {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 4px;
          border-radius: 9999px;
          background: linear-gradient(90deg, #93c5fd, #3971ff);
        }
        .endowment-video-eyebrow {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 10px;
        }
        @media (max-width: 1100px) {
          .endowment-section {
            padding-bottom: 56px;
          }
          .endowment-section-title {
            font-size: 38px;
          }
          .endowment-video-wrap {
            margin-top: 72px;
            padding-top: 44px;
          }
        }
        @media (max-width: 640px) {
          .endowment-section {
            padding-bottom: 48px;
          }
        }
      `}</style>
      <style jsx global>{`
        .endowment-cascade-step {
          position: relative;
          width: 64%;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 28px 36px 28px 116px;
          box-shadow: 0 18px 40px -20px rgba(13, 30, 80, 0.15);
          margin-left: calc(var(--i, 0) * 18%);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }
        .endowment-cascade-step + .endowment-cascade-step {
          margin-top: -22px;
        }
        .endowment-cascade-step:hover {
          transform: translateY(-4px);
          box-shadow: 0 26px 50px -22px rgba(57, 113, 255, 0.25);
          border-color: #bfdbfe;
          z-index: 2;
        }
        .endowment-cascade-step .endowment-icon-tile {
          position: absolute;
          left: 28px;
          top: 50%;
          transform: translateY(-50%);
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: linear-gradient(135deg, #eff4ff 0%, #dbeafe 100%);
          border: 1px solid #dbeafe;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .endowment-cascade-step .endowment-step-num {
          position: absolute;
          top: 20px;
          right: 32px;
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 64px;
          font-weight: 700;
          line-height: 1;
          color: #eff4ff;
          letter-spacing: -0.04em;
          pointer-events: none;
        }
        .endowment-cascade-step h3 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0b1530;
          margin: 0 0 6px;
          letter-spacing: -0.018em;
        }
        .endowment-cascade-step p {
          font-size: 15px;
          color: #4b5563;
          line-height: 1.55;
          margin: 0;
          max-width: 460px;
        }
        @media (max-width: 1100px) {
          .endowment-cascade-step {
            width: 100%;
            margin-left: 0 !important;
          }
          .endowment-cascade-step + .endowment-cascade-step {
            margin-top: 16px;
          }
        }
        @media (max-width: 640px) {
          .endowment-cascade-step {
            padding: 24px 20px 24px 96px;
          }
          .endowment-cascade-step .endowment-icon-tile {
            left: 16px;
            width: 56px;
            height: 56px;
          }
          .endowment-cascade-step .endowment-step-num {
            font-size: 44px;
            top: 16px;
            right: 20px;
          }
          /* Reserve horizontal space for the absolutely-positioned step number
             so single-line titles like "Earn Funding Credits" (224px wide,
             reaches the card's right edge) wrap before colliding with the
             "02" glyph (~56px wide at 44px Cal Sans). Verified via runtime
             measurement: h3.right=349 vs num.left=293.73 → 55px overlap. */
          .endowment-cascade-step h3 {
            padding-right: 64px;
          }
        }
      `}</style>
    </section>
  );
}
