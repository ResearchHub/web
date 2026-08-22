'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Landmark, Radio } from 'lucide-react';
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
 * The pooled-funding view: one fund at the top, a live conduit, and the
 * proposals it feeds. Individual cards carry no funding control of their own —
 * the pool is the only action, and a contribution is spread behind the scenes.
 */
export function DoubleZeroProposals({ proposals }: Readonly<{ proposals: PoolProposal[] }>) {
  const { fallbackUrl } = usePoolFund();
  const totalGoal = proposals.reduce((sum, p) => sum + p.goalUsd, 0);

  return (
    <section className="dz-pool" id="proposals">
      <div className="dz-pool-inner">
        <div className="dz-pool-head">
          <p className="dz-pool-eyebrow">Live proposals</p>
          <h2 className="dz-pool-h2">Back the call, not one paper.</h2>
          <p className="dz-pool-sub">
            One contribution, spread across every open proposal in the call by remaining need.
          </p>
        </div>

        {proposals.length === 0 ? (
          <div className="dz-pool-empty">
            <p>Every proposal in this call is fully funded. The RFP is still open for new ones.</p>
            <Link href={fallbackUrl} className="dz-pool-btn">
              <Icon name="giveRSC" size={16} color="white" />
              Read the RFP
            </Link>
          </div>
        ) : (
          <>
            <div className="dz-pool-card">
              <div className="dz-pool-card-main">
                <span className="dz-pool-card-eyebrow">One fund · every proposal</span>
                <span className="dz-pool-card-name">The DoubleZero Science Fund</span>
              </div>
              <div className="dz-pool-card-side">
                <div className="dz-pool-stats">
                  <div className="dz-pool-stat">
                    <span className="dz-pool-stat-value">{proposals.length}</span>
                    <span className="dz-pool-stat-label">Proposals</span>
                  </div>
                  <span className="dz-pool-stat-div" aria-hidden />
                  <div className="dz-pool-stat">
                    <span className="dz-pool-stat-value">{formatGoal(totalGoal)}</span>
                    <span className="dz-pool-stat-label">Total sought</span>
                  </div>
                </div>
                <PoolFundCta className="dz-pool-btn">
                  <Icon name="giveRSC" size={20} color="white" />
                  Fund the pool
                </PoolFundCta>
              </div>
            </div>

            <div className="dz-pool-conduit" aria-hidden>
              <span className="dz-pool-particle" style={{ animationDelay: '0s' }} />
              <span className="dz-pool-particle" style={{ animationDelay: '0.55s' }} />
              <span className="dz-pool-particle" style={{ animationDelay: '1.1s' }} />
            </div>

            <ul className="dz-pool-grid">
              {proposals.map((p, i) => {
                const lead = p.authors[0];
                const extra = p.authors.length > 1 ? ` +${p.authors.length - 1}` : '';
                const progress = p.goalUsd > 0 ? Math.min(1, p.raisedUsd / p.goalUsd) : 0;
                const isFunded = remainingNeedUsd(p) <= 0;
                return (
                  <li key={p.id} className="dz-prop">
                    <div className="dz-prop-cover">
                      {p.imageUrl ? (
                        <Image
                          src={p.imageUrl}
                          alt=""
                          fill
                          sizes="(max-width: 900px) 92vw, 560px"
                          className="dz-prop-cover-img"
                          unoptimized
                        />
                      ) : (
                        <span className="dz-prop-cover-fallback" aria-hidden>
                          <Radio className="w-7 h-7" />
                        </span>
                      )}
                      <span className="dz-prop-index" aria-hidden>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <div className="dz-prop-body">
                      {p.nonprofitName && (
                        <span className="dz-prop-nonprofit">
                          <Landmark className="w-3.5 h-3.5" aria-hidden />
                          {p.nonprofitName}
                        </span>
                      )}
                      <h3 className="dz-prop-title">{p.title}</h3>

                      {lead && (
                        <div className="dz-prop-authors">
                          <span className="dz-prop-avatars">
                            {p.authors.slice(0, 3).map((a) =>
                              a.avatarUrl ? (
                                <Image
                                  key={a.name}
                                  src={a.avatarUrl}
                                  alt=""
                                  width={24}
                                  height={24}
                                  className="dz-prop-avatar"
                                  unoptimized
                                />
                              ) : (
                                <span
                                  key={a.name}
                                  className="dz-prop-avatar dz-prop-avatar-fallback"
                                >
                                  {initials(a.name)}
                                </span>
                              )
                            )}
                          </span>
                          <span className="dz-prop-author-name">
                            {lead.name}
                            {extra}
                          </span>
                        </div>
                      )}

                      <div className="dz-prop-meta">
                        <div className="dz-prop-meta-item">
                          <span className="dz-prop-meta-label">
                            {isFunded ? 'Funded' : 'Seeking'}
                          </span>
                          <span className="dz-prop-meta-value">{formatGoal(p.goalUsd)}</span>
                        </div>
                        {p.reviewCount > 0 && (
                          <div className="dz-prop-meta-item">
                            <span className="dz-prop-meta-label">Peer reviews</span>
                            <span className="dz-prop-meta-value">{p.reviewCount}</span>
                          </div>
                        )}
                      </div>

                      <div className="dz-prop-bar" aria-hidden>
                        <span
                          className="dz-prop-bar-fill"
                          style={{ width: `${Math.max(2, progress * 100)}%` }}
                        />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}

        <p className="dz-pool-more">
          <Link href={fallbackUrl} className="dz-pool-more-link">
            Read the full request for proposals
            <ArrowUpRight className="w-4 h-4" aria-hidden />
          </Link>
        </p>
      </div>

      {/* Global rather than scoped: styled-jsx only adds its scoping class to
          plain DOM elements, so `Link` anchors and `Image` tags would go
          unstyled. Every selector is `dz-pool-` / `dz-prop-` prefixed. */}
      <style jsx global>{`
        .dz-pool {
          padding: 100px 28px;
          background:
            radial-gradient(1000px 500px at 50% 0, rgba(57, 113, 255, 0.08), transparent 62%),
            #f8fafc;
        }
        .dz-pool-inner {
          max-width: 1120px;
          margin: 0 auto;
        }
        .dz-pool-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 44px;
        }
        .dz-pool-eyebrow {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #2563eb;
          margin: 0 0 18px;
        }
        .dz-pool-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 50px;
          line-height: 1.07;
          letter-spacing: -0.026em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 16px;
        }
        .dz-pool-sub {
          font-size: 17px;
          line-height: 1.6;
          color: #4b5563;
          margin: 0;
        }

        /* --- the fund ---------------------------------------------------- */
        .dz-pool-card {
          display: grid;
          grid-template-columns: 1fr auto;
          align-items: center;
          gap: 36px;
          padding: 28px 32px;
          background:
            radial-gradient(80% 140% at 8% 0%, rgba(66, 86, 255, 0.3), transparent 62%), #070b16;
          border: 1px solid rgba(66, 86, 255, 0.36);
          box-shadow: 0 36px 76px -40px rgba(11, 21, 48, 0.6);
        }
        .dz-pool-card-main {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }
        .dz-pool-card-eyebrow {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.13em;
          text-transform: uppercase;
          color: #8ea2ff;
        }
        .dz-pool-card-name {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 29px;
          font-weight: 700;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: #ffffff;
        }
        .dz-pool-card-side {
          display: flex;
          align-items: center;
          gap: 30px;
        }
        .dz-pool-stats {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        .dz-pool-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .dz-pool-stat-value {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 27px;
          font-weight: 700;
          line-height: 1;
          color: #ffffff;
        }
        .dz-pool-stat-label {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
          margin-top: 8px;
          white-space: nowrap;
        }
        .dz-pool-stat-div {
          width: 1px;
          height: 38px;
          background: rgba(255, 255, 255, 0.16);
        }
        .dz-pool-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          height: 54px;
          padding: 0 30px;
          flex-shrink: 0;
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          background: linear-gradient(to right, #4a7fff, #3971ff);
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.65);
          text-decoration: none;
          transition:
            transform 0.15s ease,
            background 0.15s ease,
            box-shadow 0.15s ease;
        }
        .dz-pool-btn:hover {
          background: linear-gradient(to right, #3971ff, #2563eb);
          box-shadow: 0 16px 32px -8px rgba(57, 113, 255, 0.8);
          transform: translateY(-1px);
          color: #ffffff;
        }

        /* --- conduit into the proposals ---------------------------------- */
        .dz-pool-conduit {
          position: relative;
          width: 2px;
          height: 68px;
          margin: 0 auto;
          background: linear-gradient(to bottom, rgba(66, 86, 255, 0.7), rgba(66, 86, 255, 0.04));
        }
        .dz-pool-particle {
          position: absolute;
          left: -2px;
          top: 0;
          width: 6px;
          height: 6px;
          background: #29f91f;
          box-shadow: 0 0 10px rgba(41, 249, 31, 0.9);
          animation: dzPoolFlow 1.65s linear infinite;
        }
        @keyframes dzPoolFlow {
          0% {
            top: -6px;
            opacity: 0;
          }
          14% {
            opacity: 1;
          }
          86% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .dz-pool-particle {
            animation: none;
            opacity: 0.9;
            top: 50%;
          }
        }

        /* --- proposal cards ---------------------------------------------- */
        .dz-pool-grid {
          list-style: none;
          margin: 28px 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 22px;
        }
        .dz-prop {
          display: flex;
          flex-direction: column;
          background: #ffffff;
          border: 1px solid #e3e8ef;
          box-shadow: 0 22px 44px -34px rgba(11, 21, 48, 0.4);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }
        .dz-prop:hover {
          transform: translateY(-3px);
          border-color: #bfd0ff;
          box-shadow: 0 30px 56px -32px rgba(11, 21, 48, 0.46);
        }
        /* Proposal artwork is often a figure on white, so the cover needs its
           own edge to stay distinct from the card. */
        .dz-prop-cover {
          position: relative;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          background: #070b16;
          border-bottom: 1px solid #e3e8ef;
        }
        .dz-prop-cover-img {
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .dz-prop:hover .dz-prop-cover-img {
          transform: scale(1.04);
        }
        .dz-prop-cover-fallback {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(148, 163, 184, 0.55);
        }
        .dz-prop-index {
          position: absolute;
          top: 0;
          left: 0;
          z-index: 2;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: #ffffff;
          background: rgba(7, 11, 22, 0.78);
          padding: 6px 10px;
        }
        .dz-prop-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          padding: 20px 22px 22px;
        }
        .dz-prop-nonprofit {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          align-self: flex-start;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #4b5563;
          background: #f1f5f9;
          padding: 5px 8px;
          margin-bottom: 12px;
        }
        .dz-prop-title {
          font-size: 17px;
          font-weight: 650;
          line-height: 1.36;
          letter-spacing: -0.011em;
          color: #0b1530;
          margin: 0 0 16px;
        }
        .dz-prop-authors {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
        }
        .dz-prop-avatars {
          display: inline-flex;
        }
        .dz-prop-avatar {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid #ffffff;
          background: #e2e8f0;
        }
        .dz-prop-avatar + .dz-prop-avatar {
          margin-left: -8px;
        }
        .dz-prop-avatar-fallback {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          font-weight: 700;
          color: #475569;
        }
        .dz-prop-author-name {
          font-size: 13px;
          color: #4b5563;
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .dz-prop-meta {
          display: flex;
          gap: 26px;
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #eef1f6;
        }
        .dz-prop-meta-item {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .dz-prop-meta-label {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 9.5px;
          letter-spacing: 0.11em;
          text-transform: uppercase;
          color: #8a95a8;
        }
        .dz-prop-meta-value {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 19px;
          font-weight: 700;
          line-height: 1;
          color: #0b1530;
        }
        .dz-prop-bar {
          height: 3px;
          margin-top: 16px;
          background: #eef1f6;
        }
        .dz-prop-bar-fill {
          display: block;
          height: 100%;
          background: #29f91f;
        }

        /* --- empty + footer ---------------------------------------------- */
        .dz-pool-empty {
          text-align: center;
          padding: 40px 24px;
          border: 1px dashed #cbd5e1;
        }
        .dz-pool-empty p {
          font-size: 16px;
          color: #4b5563;
          margin: 0 0 20px;
        }
        .dz-pool-more {
          margin: 40px 0 0;
          text-align: center;
        }
        .dz-pool-more-link {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 12.5px;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #2563eb;
          text-decoration: none;
          border-bottom: 1px solid rgba(37, 99, 235, 0.35);
          padding-bottom: 3px;
        }
        .dz-pool-more-link:hover {
          color: #1d4ed8;
          border-bottom-color: #1d4ed8;
        }

        @media (max-width: 900px) {
          .dz-pool-card {
            grid-template-columns: 1fr;
            gap: 24px;
          }
          .dz-pool-card-side {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
          }
          .dz-pool-stats {
            justify-content: center;
          }
          .dz-pool-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .dz-pool {
            padding: 72px 18px;
          }
          .dz-pool-h2 {
            font-size: 30px;
          }
          .dz-pool-card {
            padding: 24px 20px;
          }
          .dz-pool-card-name {
            font-size: 24px;
          }
        }
      `}</style>
    </section>
  );
}
