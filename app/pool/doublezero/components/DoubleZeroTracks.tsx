'use client';

import { DoubleZeroGlyph, type DoubleZeroGlyphName } from './DoubleZeroGlyph';

interface Track {
  glyph: DoubleZeroGlyphName;
  number: string;
  title: string;
  summary: string;
  items: string[];
}

const TRACKS: Track[] = [
  {
    glyph: 'circle',
    number: '01',
    title: 'Neutrino communication',
    summary: 'From a one-word proof to higher rates, longer baselines and a deployable link.',
    items: [
      'Comms demos on collider neutrino experiments',
      'Detector sensitivity and miniaturization',
      'Compact, relocatable surface or underwater receivers',
      'High-flux collimated beams, including laser-driven',
      'Cosmic-ray and near-horizon muon backgrounds',
      'Encoding and error correction at ultra-low rates',
      'End-to-end link modeling, pole to pole',
    ],
  },
  {
    glyph: 'square',
    number: '02',
    title: 'Other exotic modalities',
    summary: 'Neutrinos are the clearest first example, not the only one.',
    items: [
      'Muon sensing and signaling, detectors and timing',
      'Other weakly-interacting particles or fields as carriers',
      'Transmitter concepts that shrink the beam source',
      'Synchronization and signal recovery for any low-rate channel',
    ],
  },
  {
    glyph: 'triangle',
    number: '03',
    title: 'Systems, theory and feasibility',
    summary: 'The rigor underneath: whether the numbers actually close.',
    items: [
      'Latency modeling against real fiber and microwave routes',
      'Information-theoretic limits for exotic channels',
      'Protocol design at the edge of detectability',
      'Engineering and cost pathways to deployable systems',
    ],
  },
];

export function DoubleZeroTracks() {
  return (
    <section className="dz-tracks">
      <div className="dz-tracks-inner">
        <div className="dz-tracks-head">
          <p className="dz-tracks-eyebrow">Where your money goes</p>
          <h2 className="dz-tracks-h2">The experiments you&rsquo;re funding.</h2>
          <p className="dz-tracks-test">
            <span>The bar</span>
            more bandwidth <i>·</i> less latency <i>·</i> or both
          </p>
        </div>

        <ol className="dz-tracks-list">
          {TRACKS.map((track) => (
            <li key={track.number} className={`dz-track dz-track-${track.glyph}`}>
              <div className="dz-track-top">
                <DoubleZeroGlyph name={track.glyph} size={54} />
                <span className="dz-track-num">Track {track.number}</span>
              </div>
              <h3 className="dz-track-title">{track.title}</h3>
              <p className="dz-track-summary">{track.summary}</p>
              <ul className="dz-track-items">
                {track.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="dz-tracks-foot">
          No major technology company is pursuing this. Infrastructure this new does not come from
          incumbents.
        </p>
      </div>

      <style jsx>{`
        .dz-tracks {
          padding: 100px 28px;
          background:
            radial-gradient(1000px 520px at 50% 0, rgba(66, 86, 255, 0.14), transparent 64%),
            #05070f;
          color: #e6ecf7;
        }
        .dz-tracks-inner {
          max-width: 1200px;
          margin: 0 auto;
        }
        .dz-tracks-head {
          text-align: center;
          margin-bottom: 54px;
        }
        .dz-tracks-eyebrow {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #5bff50;
          margin: 0 0 18px;
        }
        .dz-tracks-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 50px;
          line-height: 1.06;
          letter-spacing: -0.028em;
          color: #ffffff;
          margin: 0 0 26px;
        }
        .dz-tracks-test {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
          margin: 0;
          padding: 9px 16px 9px 9px;
          border: 1px solid rgba(148, 163, 184, 0.24);
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 12.5px;
          letter-spacing: 0.03em;
          color: #c3cddd;
        }
        .dz-tracks-test span {
          background: #29f91f;
          color: #04120a;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-size: 10.5px;
          padding: 5px 8px;
        }
        .dz-tracks-test i {
          color: #46516a;
          font-style: normal;
        }

        .dz-tracks-list {
          list-style: none;
          margin: 0;
          padding: 0;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: rgba(148, 163, 184, 0.2);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }
        .dz-track {
          background: #080d1a;
          padding: 30px 28px 34px;
          transition: background-color 0.2s ease;
        }
        .dz-track:hover {
          background: #0b1224;
        }
        .dz-track-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 24px;
        }
        .dz-track-num {
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 10.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: #6d7893;
        }
        .dz-track-title {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 24px;
          font-weight: 700;
          line-height: 1.18;
          letter-spacing: -0.018em;
          color: #ffffff;
          margin: 0 0 12px;
          /* Two lines' worth, so the summaries and lists line up across the
             three cards whether or not a title wraps. */
          min-height: 2.36em;
        }
        .dz-track-summary {
          font-size: 15px;
          line-height: 1.58;
          color: #98a4ba;
          margin: 0 0 22px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(148, 163, 184, 0.14);
        }
        .dz-track-items {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 11px;
        }
        .dz-track-items li {
          position: relative;
          padding-left: 17px;
          font-family: var(--font-geist-mono), ui-monospace, 'SF Mono', monospace;
          font-size: 12px;
          line-height: 1.5;
          letter-spacing: 0.01em;
          color: #b3bdd0;
        }
        /* Bullet takes the colour of the glyph that heads the track. */
        .dz-track-items li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 6px;
          width: 5px;
          height: 5px;
        }
        .dz-track-circle .dz-track-items li::before {
          background: #29f91f;
        }
        .dz-track-square .dz-track-items li::before {
          background: #ff2f2f;
        }
        .dz-track-triangle .dz-track-items li::before {
          background: #4256ff;
        }
        .dz-tracks-foot {
          margin: 46px auto 0;
          max-width: 720px;
          text-align: center;
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 23px;
          font-weight: 700;
          line-height: 1.34;
          letter-spacing: -0.018em;
          color: #ffffff;
          text-wrap: balance;
        }

        @media (max-width: 1060px) {
          .dz-tracks-list {
            grid-template-columns: 1fr;
          }
          .dz-tracks-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .dz-tracks {
            padding: 72px 18px;
          }
          .dz-tracks-h2 {
            font-size: 32px;
          }
          .dz-track {
            padding: 26px 22px 30px;
          }
          .dz-tracks-foot {
            font-size: 19px;
          }
        }
      `}</style>
    </section>
  );
}
