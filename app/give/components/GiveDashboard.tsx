'use client';

import { useRef, type ReactNode } from 'react';
import Image from 'next/image';
import { LineChart, MessageSquare, BarChart3, ChevronLeft, ChevronRight, Play } from 'lucide-react';

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

type VideoUpdate = {
  avatar: string;
  name: string;
  date: string;
  title: string;
  duration: string;
  poster: string;
};

const UPDATES: ReadonlyArray<VideoUpdate> = [
  {
    avatar: '/globe-avatars/2.png',
    name: 'Dr. Sarah Chen',
    date: 'Mar 13, 2026',
    title: 'Breathwork Lab: first cohort results',
    duration: '2:14',
    poster: 'linear-gradient(135deg, #38bdf8, #6366f1)',
  },
  {
    avatar: '/globe-avatars/9.png',
    name: 'Marcus Okonkwo, PhD',
    date: 'Mar 10, 2026',
    title: 'Walking you through the latest fMRI findings',
    duration: '3:48',
    poster: 'linear-gradient(135deg, #34d399, #0ea5e9)',
  },
  {
    avatar: '/globe-avatars/15.png',
    name: 'Priya Nair',
    date: 'Jun 1, 2026',
    title: 'Field update from the healthcare study',
    duration: '1:32',
    poster: 'linear-gradient(135deg, #f0abfc, #7c3aed)',
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
              <div className="give-dash-mock-title">Welcome back, Jennifer.</div>
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
                  <div className="give-dash-avatars give-dash-avatars-full">
                    {STACK_AVATARS.map((src) => (
                      <span key={src} className="give-dash-avatar">
                        <Image src={src} alt="" width={28} height={28} />
                      </span>
                    ))}
                    <span className="give-dash-avatar give-dash-avatar-more">+15</span>
                  </div>
                  <div className="give-dash-avatars give-dash-avatars-compact">
                    <span className="give-dash-avatar">
                      <Image src={STACK_AVATARS[0]} alt="" width={28} height={28} />
                    </span>
                    <span className="give-dash-avatar give-dash-avatar-more">+21</span>
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
            <div className="give-dash-act-sub">Video updates from the researchers you fund</div>

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
                {UPDATES.map((u) => (
                  <div key={u.name + u.date} className="give-dash-vid-card">
                    <button
                      type="button"
                      className="give-dash-vid-thumb"
                      style={{ background: u.poster }}
                      aria-label={`Play update from ${u.name}`}
                    >
                      <span className="give-dash-vid-play">
                        <Play size={14} fill="currentColor" />
                      </span>
                      <span className="give-dash-vid-duration">{u.duration}</span>
                    </button>
                    <div className="give-dash-vid-meta">
                      <span className="give-dash-act-avatar">
                        <Image src={u.avatar} alt="" width={26} height={26} />
                      </span>
                      <div className="give-dash-vid-text">
                        <span className="give-dash-vid-title">{u.title}</span>
                        <span className="give-dash-act-date">
                          {u.name} &middot; {u.date}
                        </span>
                      </div>
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
          padding: 64px 28px;
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
          font-size: 40px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 14px;
        }
        .give-dash-accent {
          color: #3971ff;
        }
        .give-dash-lead {
          font-size: 17px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0 0 24px;
          max-width: 520px;
        }
        .give-dash-features {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 16px;
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
            padding: 48px 16px;
          }
          .give-dash-h2 {
            font-size: 30px;
          }
        }
      `}</style>
      <style jsx global>{`
        .give-dash-feature {
          display: grid;
          grid-template-columns: 40px 1fr;
          gap: 14px;
          align-items: start;
        }
        .give-dash-feature-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: transparent;
          color: #3971ff;
          display: inline-flex;
          align-items: center;
          justify-content: flex-start;
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
          border: 1px solid #eef2f7;
          border-radius: 18px;
          padding: 22px 22px 24px;
          box-shadow: 0 24px 60px -44px rgba(13, 30, 80, 0.28);
          min-width: 0;
        }
        .give-dash-carousel-wrap {
          min-width: 0;
        }
        .give-dash-mock-title {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 20px;
          font-weight: 700;
          color: #0b1530;
          margin-bottom: 12px;
        }
        .give-dash-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
          background: transparent;
          border: 1px solid #eef2f7;
          border-radius: 14px;
          padding: 18px;
        }
        .give-dash-stat-block-right {
          border-left: 1px solid #eef2f7;
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
        .give-dash-avatars-compact {
          display: none;
        }
        @media (max-width: 1024px) {
          .give-dash-avatars-full {
            display: none;
          }
          .give-dash-avatars-compact {
            display: flex;
          }
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
        .give-dash-vid-card {
          flex: 0 0 220px;
          scroll-snap-align: start;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .give-dash-vid-thumb {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 9;
          border: none;
          border-radius: 12px;
          padding: 0;
          overflow: hidden;
          cursor: pointer;
          display: block;
        }
        .give-dash-vid-play {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.92);
          color: #0b1530;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding-left: 2px;
          box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.35);
          transition: transform 0.15s ease;
        }
        .give-dash-vid-thumb:hover .give-dash-vid-play {
          transform: translate(-50%, -50%) scale(1.08);
        }
        .give-dash-vid-duration {
          position: absolute;
          right: 6px;
          bottom: 6px;
          font-size: 9.5px;
          font-weight: 600;
          color: #fff;
          background: rgba(0, 0, 0, 0.6);
          padding: 1px 5px;
          border-radius: 5px;
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
        .give-dash-act-date {
          font-size: 10.5px;
          color: #9ca3af;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .give-dash-vid-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .give-dash-vid-text {
          min-width: 0;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .give-dash-vid-title {
          font-size: 12px;
          font-weight: 700;
          color: #0b1530;
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .give-dash-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid #eef2f7;
          color: #6b7280;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 3;
          transition:
            color 0.15s ease,
            border-color 0.15s ease;
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
          border: 1px solid #eef2f7;
          border-radius: 12px;
          overflow: hidden;
        }
        .give-dash-opp-banner {
          position: relative;
          padding: 14px 16px;
          background: #fff;
          border-left: 3px solid #7c3aed;
          color: #0b1530;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .give-dash-opp-eyebrow {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9ca3af;
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
          color: #9ca3af;
        }
        .give-dash-opp-meta b {
          font-size: 13px;
          color: #0b1530;
        }
      `}</style>
    </section>
  );
}
