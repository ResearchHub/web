'use client';

import { useRef, type ReactNode } from 'react';
import Image from 'next/image';
import {
  LineChart,
  MessageSquare,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Bell,
  Star,
} from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter } from '@fortawesome/free-brands-svg-icons';

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

const FEATURES: ReadonlyArray<Feature> = [
  {
    icon: <LineChart size={22} strokeWidth={2} />,
    title: 'Track progress in real time',
    body: 'Watch funding goals fill and milestones complete across all the work you back.',
  },
  {
    icon: <MessageSquare size={22} strokeWidth={2} />,
    title: 'Updates straight from researchers',
    body: 'Results, datasets, and preprints posted by the scientists you fund.',
  },
  {
    icon: <BarChart3 size={22} strokeWidth={2} />,
    title: 'See your impact in metrics',
    body: 'Total committed, projects funded, reviews completed, and outputs produced.',
  },
];

const STACK_AVATARS = [
  '/globe-avatars/9.png',
  '/globe-avatars/2.png',
  '/globe-avatars/14.png',
  '/globe-avatars/15.png',
  '/globe-avatars/6.png',
];

type Activity = {
  avatar: string;
  name: string;
  date: string;
  kind: 'update' | 'review';
  from: string;
  preview:
    | { type: 'x'; title: string; handle: string }
    | { type: 'article'; source: string; title: string; desc: string; gradient: string }
    | { type: 'review'; stars: number; text: string };
};

const ACTIVITY: ReadonlyArray<Activity> = [
  {
    avatar: '/globe-avatars/2.png',
    name: 'Guy W. Fincham, PhD',
    date: 'Mar 13, 2026',
    kind: 'update',
    from: 'DeSci Fellowship x BreathworkLab',
    preview: {
      type: 'x',
      title: 'Newest member of the Breathwork Lab here, Dr. Evgenii Pashnin, M.D.,…',
      handle: '@breath_Guy',
    },
  },
  {
    avatar: '/globe-avatars/9.png',
    name: 'Fadel Zeidan',
    date: 'Mar 10, 2026',
    kind: 'update',
    from: 'Investigating the Neural and Cerebrovascular Effects of…',
    preview: {
      type: 'article',
      source: 'LOCALLYWELL',
      title: 'Wim Hof To Bring His Signature Breathwork and Ice Bath…',
      desc: 'The extreme endurance athlete to host an immersive one-day retreat in San Diego.',
      gradient: 'linear-gradient(135deg, #38bdf8, #6366f1)',
    },
  },
  {
    avatar: '/globe-avatars/15.png',
    name: 'Alfath Center',
    date: 'Jun 1, 2026',
    kind: 'review',
    from: 'The Cost-Quality Equation in Universal Healthcare…',
    preview: {
      type: 'review',
      stars: 5,
      text: 'This proposal addresses a key question in health economics by examining quality and affordability, especially for healthcare in…',
    },
  },
  {
    avatar: '/globe-avatars/14.png',
    name: 'Brahmani Bajra',
    date: 'Mar 8, 2026',
    kind: 'review',
    from: 'System Dynamics and Configurational Analysis of UHC Policy…',
    preview: {
      type: 'review',
      stars: 4,
      text: 'A methodologically innovative, well-theorized proposal that bridges an important gap between linear econometric findings and…',
    },
  },
];

export function GiveDashboard() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollByCards = (dir: number) => {
    scrollRef.current?.scrollBy({ left: dir * 232, behavior: 'smooth' });
  };

  return (
    <section className="give-dash">
      <div className="give-dash-inner">
        <div className="give-dash-copy">
          <h2 className="give-dash-h2">
            Follow every dollar,{' '}
            <span className="give-dash-accent">all the way to the result.</span>
          </h2>
          <p className="give-dash-lead">
            Your funder dashboard brings every opportunity you support into one place.
          </p>

          <ul className="give-dash-features">
            {FEATURES.map((f) => (
              <li key={f.title} className="give-dash-feature">
                <span className="give-dash-feature-icon">{f.icon}</span>
                <div>
                  <strong>{f.title}</strong>
                  <p>{f.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="give-dash-mockwrap">
          <div className="give-dash-mock" role="img" aria-label="Funder dashboard preview">
            <div className="give-dash-mock-head">
              <div className="give-dash-mock-title">Welcome back, John.</div>
              <div className="give-dash-mock-sub">
                Here&rsquo;s where your funding stands today.
              </div>
            </div>

            <div className="give-dash-stats">
              <div className="give-dash-stat-block">
                <span className="give-dash-stat-label">You have given</span>
                <span className="give-dash-stat-big">$258K</span>
                <div className="give-dash-stat-row">
                  <span>
                    Community match <b>$20K</b>
                  </span>
                  <span className="give-dash-stat-divider" />
                  <span>
                    Total deployed <b>$278K</b>
                  </span>
                </div>
              </div>

              <div className="give-dash-stat-block give-dash-stat-block-right">
                <span className="give-dash-stat-label">Scientists supported</span>
                <div className="give-dash-supported">
                  <span className="give-dash-stat-count">22</span>
                  <div className="give-dash-avatars">
                    {STACK_AVATARS.map((src) => (
                      <span key={src} className="give-dash-avatar">
                        <Image src={src} alt="" width={28} height={28} />
                      </span>
                    ))}
                    <span className="give-dash-avatar give-dash-avatar-more">+15</span>
                  </div>
                </div>
                <span className="give-dash-stat-label give-dash-stat-label-mt">Total reviews</span>
                <span className="give-dash-stat-count">58</span>
              </div>
            </div>

            <div className="give-dash-act-head">
              <span className="give-dash-act-title">Recent activity</span>
              <span className="give-dash-act-count">28 updates</span>
            </div>
            <div className="give-dash-act-sub">Recent updates from authors and peer-reviewers</div>

            <div className="give-dash-carousel-wrap">
              <button
                type="button"
                className="give-dash-arrow give-dash-arrow-l"
                aria-label="Previous"
                onClick={() => scrollByCards(-1)}
              >
                <ChevronLeft size={16} />
              </button>

              <div className="give-dash-carousel" ref={scrollRef}>
                {ACTIVITY.map((a) => (
                  <div key={a.name + a.date} className="give-dash-act-card">
                    <div className="give-dash-act-card-head">
                      <span className="give-dash-act-avatar">
                        <Image src={a.avatar} alt="" width={26} height={26} />
                      </span>
                      <div className="give-dash-act-meta">
                        <span className="give-dash-act-name">{a.name}</span>
                        <span className="give-dash-act-date">{a.date}</span>
                      </div>
                      {a.kind === 'review' ? (
                        <span className="give-dash-act-badge give-dash-badge-review">
                          <Star size={10} fill="currentColor" /> Peer review
                        </span>
                      ) : (
                        <span className="give-dash-act-badge give-dash-badge-update">
                          <Bell size={10} /> Update
                        </span>
                      )}
                    </div>

                    {a.preview.type === 'review' ? (
                      <div className="give-dash-review">
                        <span className="give-dash-stars">
                          {'★'.repeat(a.preview.stars)}
                          <span className="give-dash-stars-empty">
                            {'★'.repeat(5 - a.preview.stars)}
                          </span>
                        </span>
                        <p>{a.preview.text}</p>
                      </div>
                    ) : (
                      <>
                        <div className="give-dash-act-line">
                          Shared content related to their proposal at
                        </div>
                        {a.preview.type === 'x' ? (
                          <div className="give-dash-embed give-dash-embed-x">
                            <span className="give-dash-x-logo">
                              <FontAwesomeIcon icon={faXTwitter} />
                            </span>
                            <div className="give-dash-embed-text">
                              <span className="give-dash-embed-title">{a.preview.title}</span>
                              <span className="give-dash-embed-handle">{a.preview.handle}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="give-dash-embed give-dash-embed-article">
                            <span
                              className="give-dash-embed-thumb"
                              style={{ background: a.preview.gradient }}
                            />
                            <div className="give-dash-embed-text">
                              <span className="give-dash-embed-source">{a.preview.source}</span>
                              <span className="give-dash-embed-title">{a.preview.title}</span>
                              <span className="give-dash-embed-desc">{a.preview.desc}</span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    <div className="give-dash-act-from">
                      From: <b>{a.from}</b>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="give-dash-arrow give-dash-arrow-r"
                aria-label="Next"
                onClick={() => scrollByCards(1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="give-dash-opps-label">My funding opportunities</div>
            <div className="give-dash-opp">
              <div className="give-dash-opp-banner">
                <span className="give-dash-opp-eyebrow">ResearchHub Foundation</span>
                <span className="give-dash-opp-name">Reproductive Longevity</span>
                <div className="give-dash-opp-meta">
                  <span>
                    <em>Available</em>
                    <b>$10K</b>
                  </span>
                  <span>
                    <em>Proposals</em>
                    <b>2</b>
                  </span>
                  <span>
                    <em>Duration</em>
                    <b>Rolling</b>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .give-dash {
          position: relative;
          padding: 96px 28px;
          background: linear-gradient(180deg, #eef3ff 0%, #f5f8ff 55%, #ffffff 100%);
          overflow: hidden;
        }
        .give-dash-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
          gap: 56px;
          align-items: center;
        }
        .give-dash-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 48px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .give-dash-accent {
          color: #3971ff;
        }
        .give-dash-lead {
          font-size: 18px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0 0 32px;
          max-width: 520px;
        }
        .give-dash-features {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 22px;
        }
        @media (max-width: 980px) {
          .give-dash-inner {
            grid-template-columns: minmax(0, 1fr);
            gap: 44px;
          }
          .give-dash-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .give-dash {
            padding: 64px 16px;
          }
          .give-dash-h2 {
            font-size: 30px;
          }
        }
      `}</style>
      <style jsx global>{`
        .give-dash-feature {
          display: grid;
          grid-template-columns: 44px 1fr;
          gap: 16px;
          align-items: start;
        }
        .give-dash-feature-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #e5edff;
          color: #3971ff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .give-dash-feature strong {
          display: block;
          font-size: 17px;
          font-weight: 700;
          color: #0b1530;
          margin-bottom: 3px;
        }
        .give-dash-feature p {
          margin: 0;
          font-size: 15px;
          color: #6b7280;
          line-height: 1.55;
        }

        .give-dash-mockwrap {
          min-width: 0;
        }
        .give-dash-mock {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 22px 22px 24px;
          box-shadow: 0 40px 90px -40px rgba(13, 30, 80, 0.4);
          min-width: 0;
        }
        .give-dash-carousel-wrap {
          min-width: 0;
        }
        .give-dash-mock-title {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #0b1530;
        }
        .give-dash-mock-sub {
          font-size: 13px;
          color: #9ca3af;
          margin-top: 2px;
          margin-bottom: 16px;
        }
        .give-dash-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          background: #f8faff;
          border: 1px solid #eef2ff;
          border-radius: 16px;
          padding: 18px;
        }
        .give-dash-stat-block-right {
          border-left: 1px solid #e5e9f5;
          padding-left: 18px;
        }
        .give-dash-stat-label {
          display: block;
          font-size: 10.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .give-dash-stat-label-mt {
          margin-top: 14px;
        }
        .give-dash-stat-big {
          display: block;
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 38px;
          font-weight: 700;
          color: #3971ff;
          line-height: 1.1;
          margin: 4px 0 10px;
        }
        .give-dash-stat-row {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 12px;
          color: #6b7280;
        }
        .give-dash-stat-row b {
          color: #0b1530;
          display: block;
          font-size: 14px;
        }
        .give-dash-stat-divider {
          width: 1px;
          height: 26px;
          background: #e5e9f5;
        }
        .give-dash-supported {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 4px;
        }
        .give-dash-stat-count {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #0b1530;
        }
        .give-dash-avatars {
          display: flex;
          align-items: center;
        }
        .give-dash-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          overflow: hidden;
          border: 2px solid #fff;
          margin-left: -8px;
          background: #eef4ff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .give-dash-avatar:first-child {
          margin-left: 0;
        }
        .give-dash-avatar :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .give-dash-avatar-more {
          font-size: 10px;
          font-weight: 700;
          color: #4b5563;
          background: #e5edff;
        }
        .give-dash-chips {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .give-dash-chip {
          font-size: 11px;
          font-weight: 600;
          color: #374151;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 4px 8px;
          white-space: nowrap;
        }
        .give-dash-chip-more {
          color: #3971ff;
          border-color: #dbe6ff;
          background: #f3f7ff;
        }

        /* Recent activity carousel */
        .give-dash-act-head {
          display: flex;
          align-items: baseline;
          gap: 8px;
          margin: 16px 0 2px;
        }
        .give-dash-act-title {
          font-size: 15px;
          font-weight: 700;
          color: #0b1530;
        }
        .give-dash-act-count {
          font-size: 12px;
          color: #9ca3af;
        }
        .give-dash-act-sub {
          font-size: 12.5px;
          color: #9ca3af;
          margin-bottom: 12px;
        }
        .give-dash-carousel-wrap {
          position: relative;
        }
        .give-dash-carousel {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          padding-bottom: 4px;
          scrollbar-width: none;
        }
        .give-dash-carousel::-webkit-scrollbar {
          display: none;
        }
        .give-dash-act-card {
          flex: 0 0 202px;
          scroll-snap-align: start;
          border: 1px solid #eef2ff;
          border-radius: 12px;
          background: #fff;
          padding: 10px 11px;
          box-shadow: 0 10px 24px -18px rgba(13, 30, 80, 0.25);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .give-dash-act-card-head {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .give-dash-act-avatar {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: #eef4ff;
        }
        .give-dash-act-avatar :global(img) {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .give-dash-act-meta {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .give-dash-act-name {
          font-size: 12px;
          font-weight: 700;
          color: #0b1530;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .give-dash-act-date {
          font-size: 10.5px;
          color: #9ca3af;
        }
        .give-dash-act-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 3px 6px;
          border-radius: 9999px;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .give-dash-badge-update {
          color: #6b7280;
          background: #f3f4f6;
        }
        .give-dash-badge-review {
          color: #b45309;
          background: #fef3c7;
        }
        .give-dash-act-line {
          font-size: 11.5px;
          color: #4b5563;
        }
        .give-dash-embed {
          display: flex;
          gap: 8px;
          border: 1px solid #eef2ff;
          border-radius: 10px;
          padding: 8px;
        }
        .give-dash-x-logo {
          width: 34px;
          height: 34px;
          border-radius: 7px;
          background: #000;
          color: #fff;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .give-dash-embed-thumb {
          width: 36px;
          height: 36px;
          border-radius: 7px;
          flex-shrink: 0;
        }
        .give-dash-embed-text {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .give-dash-embed-source {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #9ca3af;
        }
        .give-dash-embed-title {
          font-size: 11.5px;
          font-weight: 700;
          color: #0b1530;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .give-dash-embed-handle {
          font-size: 10.5px;
          color: #9ca3af;
        }
        .give-dash-embed-desc {
          font-size: 10px;
          color: #9ca3af;
          line-height: 1.35;
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .give-dash-review {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .give-dash-stars {
          font-size: 13px;
          color: #f59e0b;
          letter-spacing: 1px;
        }
        .give-dash-stars-empty {
          color: #e5e7eb;
        }
        .give-dash-review p {
          margin: 0;
          font-size: 11.5px;
          color: #374151;
          line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .give-dash-act-from {
          margin-top: auto;
          font-size: 10.5px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .give-dash-act-from b {
          color: #4b5563;
          font-weight: 600;
        }
        .give-dash-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #e5e7eb;
          color: #4b5563;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 16px -8px rgba(13, 30, 80, 0.4);
          cursor: pointer;
          z-index: 3;
        }
        .give-dash-arrow:hover {
          color: #3971ff;
          border-color: #bfdbfe;
        }
        .give-dash-arrow-l {
          left: -10px;
        }
        .give-dash-arrow-r {
          right: -10px;
        }

        .give-dash-opps-label {
          font-size: 14px;
          font-weight: 700;
          color: #0b1530;
          margin: 18px 0 10px;
        }
        .give-dash-opp {
          border: 1px solid #eef2ff;
          border-radius: 14px;
          overflow: hidden;
        }
        .give-dash-opp-banner {
          position: relative;
          padding: 14px 16px;
          background:
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.3), transparent 55%),
            linear-gradient(120deg, #f0abfc 0%, #a78bfa 45%, #7c3aed 100%);
          color: #fff;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .give-dash-opp-eyebrow {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.85;
        }
        .give-dash-opp-name {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 17px;
          font-weight: 700;
        }
        .give-dash-opp-meta {
          display: flex;
          gap: 18px;
          margin-top: 6px;
        }
        .give-dash-opp-meta em {
          display: block;
          font-style: normal;
          font-size: 9px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.8;
        }
        .give-dash-opp-meta b {
          font-size: 13px;
        }
      `}</style>
    </section>
  );
}
