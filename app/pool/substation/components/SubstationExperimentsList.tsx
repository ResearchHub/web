'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronLeft, ChevronRight, Landmark, Zap } from 'lucide-react';
import { PixelBackdrop } from '@/app/endowment/components/PixelBackdrop';
import { Icon } from '@/components/ui/icons';
import { PoolFundCta } from '../../components/PoolFundCta';
import { usePoolFund } from '../../components/PoolFundProvider';
import { formatGoal } from '../../lib/format';
import { remainingNeedUsd } from '../../lib/pool';
import type { PoolProposal } from '../../lib/proposals';

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

/**
 * Pooled-funding visual: a single central "pool" CTA with an animated conduit
 * streaming particles down into a full-width carousel of experiments. Funding
 * is abstracted — cards show only nonprofit, name, image and avatars; the pool
 * is the only funding action. The active card stays centered under the conduit
 * via scroll-snap, so the flow always lands on whichever experiment is in view.
 */
export function SubstationExperimentsList({ proposals }: Readonly<{ proposals: PoolProposal[] }>) {
  const { fallbackUrl } = usePoolFund();
  const trackRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef(0);
  const startIndex = proposals.length > 1 ? 1 : 0;
  const [activeIndex, setActiveIndex] = useState(startIndex);
  const totalGoal = proposals.reduce((sum, p) => sum + p.goalUsd, 0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const updateActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    Array.from(track.children).forEach((child, i) => {
      const r = (child as HTMLElement).getBoundingClientRect();
      const d = Math.abs(r.left + r.width / 2 - trackCenter);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setActiveIndex(best);
  };

  const handleScroll = () => {
    if (rafRef.current) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = 0;
      updateActive();
    });
  };

  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const clamped = Math.max(0, Math.min(proposals.length - 1, i));
    const el = track.children[clamped] as HTMLElement | undefined;
    if (!el) return;
    const trackRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const delta = elRect.left - trackRect.left - (trackRect.width - elRect.width) / 2;
    track.scrollTo({ left: track.scrollLeft + delta, behavior: reducedMotion ? 'auto' : 'smooth' });
  };

  // Open the carousel already centered on the second card.
  useEffect(() => {
    const track = trackRef.current;
    const el = track?.children[startIndex] as HTMLElement | undefined;
    if (!track || !el) return;
    const trackRect = track.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    track.scrollLeft += elRect.left - trackRect.left - (trackRect.width - elRect.width) / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="substation-exp" id="experiments">
      <div className="substation-exp-inner">
        <div className="substation-exp-head">
          <h2 className="substation-exp-h2">
            The experiments <span className="substation-exp-accent">we&apos;re funding.</span>
          </h2>
          <p className="substation-exp-sub">
            Contributions go into a pool and distributed across research proposals based on rigor.
          </p>
        </div>

        {proposals.length === 0 ? (
          <div className="substation-exp-fallback">
            <p>Every proposal is fully funded right now. Check the RFP for what&apos;s next.</p>
            <Link href={fallbackUrl} className="substation-exp-pool-btn">
              <Icon name="giveRSC" size={16} color="white" />
              View the RFP
            </Link>
          </div>
        ) : (
          <>
            <div className="substation-exp-pool">
              <div className="substation-exp-pool-card">
                <PixelBackdrop inverse side="bottom-right" className="substation-exp-pool-pixels" />
                <div className="substation-exp-pool-body">
                  <div className="substation-exp-pool-identity">
                    <div className="substation-exp-pool-eyebrow">
                      One pool &middot; Every experiment
                    </div>
                    <div className="substation-exp-pool-label">The Substation Fund</div>
                    <p className="substation-exp-pool-sub">
                      Pooled and distributed behind the scenes across every preregistered experiment
                      below.
                    </p>
                  </div>

                  <div className="substation-exp-pool-side">
                    <div className="substation-exp-pool-stats">
                      <div className="substation-exp-pool-stat">
                        <span className="substation-exp-pool-stat-value">{proposals.length}</span>
                        <span className="substation-exp-pool-stat-label">Experiments</span>
                      </div>
                      <span className="substation-exp-pool-stat-divider" aria-hidden />
                      <div className="substation-exp-pool-stat">
                        <span className="substation-exp-pool-stat-value">
                          {formatGoal(totalGoal)}
                        </span>
                        <span className="substation-exp-pool-stat-label">Total sought</span>
                      </div>
                    </div>
                    <PoolFundCta className="substation-exp-pool-btn">
                      <Icon name="giveRSC" size={20} color="white" />
                      Fund the pool
                    </PoolFundCta>
                  </div>
                </div>
              </div>
            </div>

            <div className="substation-exp-conduit" aria-hidden>
              <span className="substation-exp-conduit-dot" style={{ animationDelay: '0s' }} />
              <span className="substation-exp-conduit-dot" style={{ animationDelay: '0.6s' }} />
              <span className="substation-exp-conduit-dot" style={{ animationDelay: '1.2s' }} />
            </div>

            <div className="substation-exp-carousel">
              <button
                type="button"
                className="substation-exp-nav substation-exp-nav-prev"
                onClick={() => scrollToIndex(activeIndex - 1)}
                aria-label="Previous experiment"
                disabled={activeIndex === 0}
              >
                <ChevronLeft className="w-5 h-5" aria-hidden />
              </button>

              <div className="substation-exp-track" ref={trackRef} onScroll={handleScroll}>
                {proposals.map((p, i) => {
                  const shownAuthors = p.authors.slice(0, 3);
                  const lead = p.authors[0];
                  const extraAuthors = p.authors.length > 1 ? ` +${p.authors.length - 1}` : '';
                  const isActive = i === activeIndex;
                  const progress = p.goalUsd > 0 ? Math.min(1, p.raisedUsd / p.goalUsd) : 0;
                  const isFunded = remainingNeedUsd(p) <= 0;
                  return (
                    <article
                      key={p.id}
                      className={`substation-exp-card${isActive ? ' substation-exp-card-active' : ''}`}
                    >
                      <div className="substation-exp-cover">
                        {p.imageUrl ? (
                          <Image
                            src={p.imageUrl}
                            alt=""
                            fill
                            sizes="(max-width: 640px) 92vw, 84vw"
                            className="substation-exp-cover-img"
                            unoptimized
                          />
                        ) : (
                          <div className="substation-exp-cover-fallback" aria-hidden>
                            <Zap className="w-8 h-8" />
                          </div>
                        )}
                        <div className="substation-exp-cover-scrim" aria-hidden />
                        <div className="substation-exp-index" aria-hidden>
                          {String(i + 1).padStart(2, '0')}
                        </div>
                        <div className="substation-exp-frost">
                          <div className="substation-exp-frost-main">
                            {p.nonprofitName && (
                              <div className="substation-exp-nonprofit">
                                <Landmark className="w-4 h-4" aria-hidden />
                                {p.nonprofitName}
                              </div>
                            )}
                            <h3 className="substation-exp-title">{p.title}</h3>
                            {lead && (
                              <div className="substation-exp-author">
                                <div className="substation-exp-avatars">
                                  {shownAuthors.map((a) =>
                                    a.avatarUrl ? (
                                      <Image
                                        key={a.name}
                                        src={a.avatarUrl}
                                        alt=""
                                        width={26}
                                        height={26}
                                        className="substation-exp-avatar"
                                        unoptimized
                                      />
                                    ) : (
                                      <span
                                        key={a.name}
                                        className="substation-exp-avatar substation-exp-avatar-fallback"
                                      >
                                        {initials(a.name)}
                                      </span>
                                    )
                                  )}
                                </div>
                                <span className="substation-exp-author-name">
                                  {lead.name}
                                  {extraAuthors}
                                </span>
                              </div>
                            )}
                          </div>
                          {p.goalUsd > 0 && (
                            <div className="substation-exp-raising">
                              <div className="substation-exp-raising-label">
                                {isFunded ? 'Funded' : 'Raising'}
                              </div>
                              <div className="substation-exp-raising-value">
                                {formatGoal(p.goalUsd)}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="substation-exp-progress" aria-hidden>
                          <div
                            className="substation-exp-progress-fill"
                            style={{ width: `${Math.max(4, progress * 100)}%` }}
                          />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              <button
                type="button"
                className="substation-exp-nav substation-exp-nav-next"
                onClick={() => scrollToIndex(activeIndex + 1)}
                aria-label="Next experiment"
                disabled={activeIndex === proposals.length - 1}
              >
                <ChevronRight className="w-5 h-5" aria-hidden />
              </button>
            </div>

            {proposals.length > 1 && (
              <div className="substation-exp-dots" role="tablist" aria-label="Experiments">
                {proposals.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    role="tab"
                    aria-selected={i === activeIndex}
                    aria-label={`Experiment ${i + 1}`}
                    className={`substation-exp-dot${i === activeIndex ? ' substation-exp-dot-active' : ''}`}
                    onClick={() => scrollToIndex(i)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <div className="substation-exp-more">
          <Link href={fallbackUrl} className="substation-exp-more-link">
            Read the open RFP
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </div>
      </div>

      {/* Global rather than scoped: styled-jsx only adds its scoping class to
          plain DOM elements, so `Link`-rendered anchors would go unstyled.
          Every selector is `substation-exp-` prefixed to avoid leaking. */}
      <style jsx global>{`
        .substation-exp {
          padding: 96px 28px;
          background:
            radial-gradient(1100px 520px at 50% -40px, rgba(57, 113, 255, 0.09), transparent 62%),
            #f8fafc;
        }
        .substation-exp-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .substation-exp-head {
          text-align: center;
          max-width: 780px;
          margin: 0 auto 40px;
        }
        .substation-exp-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .substation-exp-accent {
          color: #2563eb;
        }
        .substation-exp-sub {
          font-size: 17px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }

        /* --- funding pool --- */
        .substation-exp-pool {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        .substation-exp-pool-card {
          position: relative;
          width: 100%;
          max-width: 880px;
          border-radius: 24px;
          overflow: hidden;
          background:
            radial-gradient(ellipse 70% 100% at 12% 0%, rgba(57, 113, 255, 0.28), transparent 62%),
            linear-gradient(150deg, #0b1530 0%, #16224a 60%, #0d1330 100%);
          border: 1px solid rgba(74, 127, 255, 0.35);
          box-shadow:
            0 36px 80px -34px rgba(11, 21, 48, 0.62),
            0 0 0 1px rgba(255, 255, 255, 0.04) inset;
        }
        .substation-exp-pool-card .substation-exp-pool-pixels {
          opacity: 0.35;
        }
        .substation-exp-pool-body {
          position: relative;
          z-index: 2;
          display: grid;
          grid-template-columns: 1.25fr auto;
          align-items: center;
          gap: 40px;
          padding: 34px 38px;
          text-align: left;
        }
        .substation-exp-pool-eyebrow {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 10px;
        }
        .substation-exp-pool-label {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 30px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: #f8fafc;
        }
        .substation-exp-pool-sub {
          font-size: 14.5px;
          line-height: 1.6;
          color: #aeb9cf;
          margin: 10px 0 0;
          max-width: 400px;
        }
        .substation-exp-pool-side {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 20px;
        }
        .substation-exp-pool-stats {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 26px;
        }
        .substation-exp-pool-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .substation-exp-pool-stat-value {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 30px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .substation-exp-pool-stat-label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 7px;
          white-space: nowrap;
        }
        .substation-exp-pool-stat-divider {
          width: 1px;
          height: 40px;
          background: rgba(255, 255, 255, 0.16);
        }
        .substation-exp-pool-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 56px;
          padding: 0 36px;
          border-radius: 15px;
          font-size: 18px;
          font-weight: 800;
          color: #ffffff;
          background: linear-gradient(to right, #4a7fff, #3971ff);
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.65);
          text-decoration: none;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }
        .substation-exp-pool-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow: 0 16px 32px -8px rgba(57, 113, 255, 0.8);
          transform: translateY(-1px);
          color: #ffffff;
        }

        /* --- animated conduit from pool into the active card --- */
        .substation-exp-conduit {
          position: relative;
          width: 3px;
          height: 74px;
          margin: 10px auto 18px;
          border-radius: 999px;
          background: linear-gradient(
            to bottom,
            rgba(57, 113, 255, 0.75),
            rgba(57, 113, 255, 0.06)
          );
        }
        .substation-exp-conduit-dot {
          position: absolute;
          left: 50%;
          top: -6px;
          width: 9px;
          height: 9px;
          margin-left: -4.5px;
          border-radius: 50%;
          background: #60a5fa;
          box-shadow: 0 0 10px rgba(96, 165, 250, 0.95);
          animation: substationExpConduit 1.8s linear infinite;
        }
        @keyframes substationExpConduit {
          0% {
            top: -6px;
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          88% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        /* --- carousel --- */
        .substation-exp-carousel {
          position: relative;
        }
        .substation-exp-track {
          display: flex;
          gap: 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding: 4px 11% 8px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .substation-exp-track::-webkit-scrollbar {
          display: none;
        }
        .substation-exp-card {
          position: relative;
          flex: 0 0 78%;
          scroll-snap-align: center;
          border: 1px solid #1e293b;
          border-radius: 20px;
          overflow: hidden;
          background: #0b1530;
          box-shadow: 0 24px 48px -24px rgba(2, 6, 23, 0.5);
          opacity: 0.5;
          transform: scale(0.96);
          filter: saturate(0.65) brightness(0.92);
          transition:
            opacity 0.4s ease,
            transform 0.4s ease,
            filter 0.4s ease,
            box-shadow 0.4s ease;
        }
        .substation-exp-card-active {
          opacity: 1;
          transform: scale(1);
          filter: none;
          box-shadow:
            0 34px 64px -26px rgba(2, 6, 23, 0.6),
            0 0 0 1.5px rgba(57, 113, 255, 0.55);
        }
        .substation-exp-card-active:hover {
          transform: scale(1.008);
          box-shadow:
            0 42px 76px -28px rgba(2, 6, 23, 0.66),
            0 0 0 1.5px rgba(57, 113, 255, 0.8);
        }
        .substation-exp-cover {
          position: relative;
          aspect-ratio: 2 / 1;
          overflow: hidden;
          background: #0b1530;
        }
        .substation-exp-cover-img {
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .substation-exp-card:hover .substation-exp-cover-img {
          transform: scale(1.045);
        }
        .substation-exp-cover-scrim {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(4, 8, 20, 0.6),
            rgba(4, 8, 20, 0.14) 46%,
            transparent 72%
          );
          pointer-events: none;
        }
        .substation-exp-index {
          position: absolute;
          top: 16px;
          left: 16px;
          z-index: 2;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: rgba(255, 255, 255, 0.9);
          background: rgba(4, 8, 20, 0.45);
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 999px;
          padding: 5px 11px;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }
        .substation-exp-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          z-index: 3;
          background: rgba(255, 255, 255, 0.14);
        }
        .substation-exp-progress-fill {
          height: 100%;
          border-radius: 0 3px 3px 0;
          background: linear-gradient(to right, #34d399, #6ee7b7);
          box-shadow: 0 0 8px rgba(52, 211, 153, 0.7);
        }
        .substation-exp-cover-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(148, 163, 184, 0.5);
          background:
            radial-gradient(ellipse at 30% 30%, rgba(99, 102, 241, 0.35), transparent 55%),
            linear-gradient(135deg, #0b1530 0%, #16224a 60%, #0d1330 100%);
        }
        .substation-exp-frost {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding: 16px 20px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(4, 8, 20, 0.55);
          backdrop-filter: blur(16px) saturate(1.4);
          -webkit-backdrop-filter: blur(16px) saturate(1.4);
        }
        .substation-exp-frost-main {
          min-width: 0;
          flex: 1;
        }
        .substation-exp-raising {
          flex-shrink: 0;
          text-align: right;
          padding-top: 3px;
        }
        .substation-exp-raising-label {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.5);
          white-space: nowrap;
          margin-bottom: 3px;
        }
        .substation-exp-raising-value {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 23px;
          font-weight: 800;
          line-height: 1;
          letter-spacing: -0.01em;
          color: #6ee7b7;
        }
        .substation-exp-nonprofit {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #93c5fd;
          margin-bottom: 9px;
        }
        .substation-exp-title {
          font-size: 19px;
          font-weight: 700;
          line-height: 1.35;
          color: #f8fafc;
          margin: 0 0 12px;
          text-shadow: 0 1px 8px rgba(0, 0, 0, 0.4);
        }
        .substation-exp-author {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }
        .substation-exp-avatars {
          display: flex;
          flex-shrink: 0;
        }
        .substation-exp-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid rgba(255, 255, 255, 0.25);
          background: #1e293b;
        }
        .substation-exp-avatar + .substation-exp-avatar {
          margin-left: -7px;
        }
        .substation-exp-avatar-fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #cbd5e1;
        }
        .substation-exp-author-name {
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        /* --- carousel nav --- */
        .substation-exp-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 3;
          width: 46px;
          height: 46px;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.14);
          background: rgba(11, 21, 48, 0.72);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #f8fafc;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition:
            background 0.15s ease,
            opacity 0.15s ease,
            transform 0.15s ease;
        }
        .substation-exp-nav:hover:not(:disabled) {
          background: rgba(57, 113, 255, 0.9);
          color: #ffffff;
        }
        .substation-exp-nav:disabled {
          opacity: 0.35;
          cursor: default;
        }
        .substation-exp-nav-prev {
          left: 12px;
        }
        .substation-exp-nav-next {
          right: 12px;
        }
        .substation-exp-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-top: 22px;
        }
        .substation-exp-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          border: 0;
          padding: 0;
          background: #cbd5e1;
          cursor: pointer;
          transition:
            width 0.2s ease,
            background 0.2s ease;
        }
        .substation-exp-dot-active {
          width: 26px;
          background: #3971ff;
        }

        .substation-exp-more {
          text-align: center;
          margin-top: 40px;
        }
        .substation-exp-more-link {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 15px;
          font-weight: 700;
          color: #1d4ed8;
          text-decoration: none;
        }
        .substation-exp-more-link:hover {
          text-decoration: underline;
        }
        .substation-exp-fallback {
          text-align: center;
          background: #fff;
          border: 1px dashed #e5e7eb;
          border-radius: 16px;
          padding: 48px 24px;
          color: #4b5563;
          font-size: 15px;
        }
        .substation-exp-fallback .substation-exp-pool-btn {
          display: inline-flex;
          margin-top: 18px;
          padding: 0 24px;
        }

        @media (prefers-reduced-motion: reduce) {
          .substation-exp-conduit-dot {
            animation: none;
            opacity: 0;
          }
        }

        @media (max-width: 1100px) {
          .substation-exp-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 860px) {
          .substation-exp-pool-body {
            grid-template-columns: 1fr;
            gap: 26px;
            text-align: center;
            padding: 30px 26px;
          }
          .substation-exp-pool-sub {
            margin-left: auto;
            margin-right: auto;
          }
        }
        @media (max-width: 640px) {
          .substation-exp {
            padding: 52px 16px;
          }
          .substation-exp-head {
            margin-bottom: 28px;
          }
          .substation-exp-h2 {
            font-size: 30px;
            margin-bottom: 10px;
          }
          .substation-exp-sub {
            font-size: 15px;
          }

          .substation-exp-pool-card {
            border-radius: 16px;
          }
          .substation-exp-pool-body {
            gap: 18px;
            padding: 22px 18px;
          }
          .substation-exp-pool-eyebrow {
            font-size: 10px;
            margin-bottom: 6px;
          }
          .substation-exp-pool-label {
            font-size: 23px;
          }
          .substation-exp-pool-sub {
            font-size: 13.5px;
            margin-top: 8px;
          }
          .substation-exp-pool-side {
            gap: 16px;
          }
          .substation-exp-pool-stat-value {
            font-size: 24px;
          }
          .substation-exp-pool-stat-label {
            margin-top: 5px;
          }
          .substation-exp-pool-btn {
            height: 48px;
            font-size: 16px;
            border-radius: 12px;
          }
          .substation-exp-conduit {
            height: 44px;
            margin: 8px auto 12px;
          }

          .substation-exp-card {
            flex-basis: 96%;
            border-radius: 14px;
          }
          /* Near-square on narrow screens: long titles wrap to 3+ lines, so the
             frame needs the height or the frosted bar swallows the whole card. */
          .substation-exp-cover {
            aspect-ratio: 1 / 1;
          }
          .substation-exp-track {
            gap: 12px;
            padding: 4px 4% 8px;
          }
          .substation-exp-nav {
            display: none;
          }
          .substation-exp-index {
            top: 10px;
            left: 10px;
            font-size: 10px;
            padding: 4px 8px;
          }
          .substation-exp-frost {
            gap: 8px;
            padding: 9px 11px 10px;
          }
          .substation-exp-nonprofit {
            font-size: 9px;
            gap: 4px;
            margin-bottom: 3px;
          }
          .substation-exp-title {
            font-size: 13px;
            line-height: 1.25;
            margin-bottom: 6px;
          }
          .substation-exp-avatar {
            width: 20px;
            height: 20px;
            border-width: 1.5px;
          }
          .substation-exp-avatar + .substation-exp-avatar {
            margin-left: -6px;
          }
          .substation-exp-author {
            gap: 7px;
          }
          .substation-exp-author-name {
            font-size: 11.5px;
          }
          .substation-exp-raising-label {
            font-size: 8px;
            margin-bottom: 2px;
          }
          .substation-exp-raising-value {
            font-size: 16px;
          }
          .substation-exp-dots {
            margin-top: 16px;
          }
          .substation-exp-more {
            margin-top: 28px;
          }
        }
      `}</style>
    </section>
  );
}
