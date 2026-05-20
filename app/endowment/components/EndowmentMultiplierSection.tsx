'use client';

import { PixelBackdrop } from './PixelBackdrop';

interface Row {
  time: string;
  mult: string;
  boost: string;
  highlight: boolean;
  fill: number;
}

const ROWS: ReadonlyArray<Row> = [
  { time: '0–30 days', mult: '1×', boost: 'Baseline', highlight: false, fill: 16 },
  { time: '30–180 days', mult: '1.05×', boost: '+5%', highlight: false, fill: 28 },
  { time: '180–365 days', mult: '1.1×', boost: '+10%', highlight: false, fill: 44 },
  { time: '365+ days', mult: '1.25×', boost: '+25%', highlight: true, fill: 100 },
];

const AXIS_TICKS = [1.25, 1.1, 1.05, 1.0];

export function EndowmentMultiplierSection() {
  return (
    <section className="endowment-section endowment-section-white">
      <PixelBackdrop side="bottom-left" className="endowment-mult-pixel" />
      <PixelBackdrop side="bottom-right" className="endowment-mult-pixel" />
      <div className="endowment-section-narrow endowment-text-center endowment-section-content">
        <h2 className="endowment-section-title">
          The longer you hold,{' '}
          <span className="endowment-gradient-text">the more science you fund.</span>
        </h2>
        <p className="endowment-section-lead">
          ResearchCoin held for longer earns a higher share of daily distributions. Patient capital
          is rewarded, and turns into real research output.
        </p>
      </div>

      <div className="endowment-section-narrow endowment-section-content">
        <div className="endowment-multiplier-grid">
          <div className="endowment-multiplier-chart">
            <div className="endowment-chart-axis">
              {AXIS_TICKS.map((v) => (
                <div key={v} className="endowment-axis-line">
                  <span>{v.toFixed(2)}×</span>
                </div>
              ))}
            </div>
            <div className="endowment-chart-bars">
              {ROWS.map((r) => (
                <div
                  key={r.time}
                  className={`endowment-mbar${r.highlight ? ' endowment-mbar-on' : ''}`}
                >
                  <div className="endowment-mbar-fill" style={{ height: `${r.fill}%` }}>
                    <span className="endowment-mbar-val">{r.mult}</span>
                  </div>
                  <div className="endowment-mbar-label">{r.time}</div>
                </div>
              ))}
            </div>
            <div className="endowment-chart-caption">
              Multipliers apply to each deposit separately. Every deposit accrues its own holding
              age.
            </div>
          </div>

          <div className="endowment-multiplier-table">
            <table>
              <thead>
                <tr>
                  <th>Time held</th>
                  <th>Weight multiplier</th>
                  <th className="endowment-right">Relative yield boost</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr key={r.time} className={r.highlight ? 'endowment-highlight' : ''}>
                    <td>{r.time}</td>
                    <td>
                      <span
                        className={`endowment-mult-pill${r.highlight ? ' endowment-mult-pill-gold' : ''}`}
                      >
                        {r.mult}
                      </span>
                    </td>
                    <td className="endowment-right" style={{ fontWeight: r.highlight ? 700 : 500 }}>
                      {r.boost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style jsx>{`
        .endowment-section {
          position: relative;
          padding: 96px 28px;
          overflow: hidden;
        }
        .endowment-section-white {
          /* Matches the "Earn daily yield" stats band so this section reads as
             grouped with it visually, while the bookending hero / how-it-works
             sections stay pure white. */
          background: #dbeafe;
        }
        .endowment-section :global(.endowment-mult-pixel) {
          z-index: 1;
        }
        .endowment-section-content {
          position: relative;
          z-index: 2;
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
        .endowment-gradient-text {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .endowment-multiplier-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 48px;
          margin-top: 56px;
          align-items: stretch;
        }
        @media (max-width: 1100px) {
          .endowment-multiplier-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 28px;
          }
          .endowment-section-title {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .endowment-section {
            padding: 64px 16px;
          }
          .endowment-section-title {
            font-size: 30px;
          }
          .endowment-section-lead {
            font-size: 16px;
          }
        }
      `}</style>
      <style jsx global>{`
        .endowment-multiplier-chart {
          position: relative;
          min-height: 320px;
          display: grid;
          grid-template-columns: 56px 1fr;
          grid-template-rows: 1fr auto;
          gap: 16px;
          padding: 24px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #bfdbfe;
        }
        .endowment-chart-axis {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 8px 0;
        }
        .endowment-axis-line {
          position: relative;
          font-size: 11px;
          font-weight: 600;
          color: #9ca3af;
          font-variant-numeric: tabular-nums;
        }
        .endowment-axis-line::after {
          content: '';
          position: absolute;
          left: 100%;
          top: 50%;
          width: calc(100% + 240px);
          height: 1px;
          background: #e5e7eb;
          pointer-events: none;
        }
        .endowment-chart-bars {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          align-items: end;
          position: relative;
          z-index: 1;
        }
        .endowment-mbar {
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
          gap: 10px;
        }
        .endowment-mbar-fill {
          width: 100%;
          max-width: 60px;
          border-radius: 10px 10px 4px 4px;
          background: linear-gradient(180deg, #93c5fd, #3971ff);
          position: relative;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 8px;
          box-shadow: inset 0 -3px 0 rgba(0, 0, 0, 0.06);
        }
        .endowment-mbar-on .endowment-mbar-fill {
          background: linear-gradient(180deg, #fcd34d, #f59e0b);
          box-shadow:
            0 8px 20px -8px rgba(245, 158, 11, 0.5),
            inset 0 -3px 0 rgba(0, 0, 0, 0.06);
        }
        .endowment-mbar-val {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #fff;
          letter-spacing: -0.01em;
        }
        .endowment-mbar-on .endowment-mbar-val {
          color: #78350f;
        }
        .endowment-mbar-label {
          font-size: 11px;
          font-weight: 600;
          color: #6b7280;
          text-align: center;
          line-height: 1.3;
        }
        .endowment-chart-caption {
          grid-column: 1 / -1;
          font-size: 12.5px;
          color: #6b7280;
          line-height: 1.55;
          padding-top: 14px;
          margin-top: 8px;
          border-top: 1px dashed #e5e7eb;
        }

        .endowment-multiplier-table {
          background: #fff;
          border-radius: 18px;
          border: 1px solid #bfdbfe;
          overflow: hidden;
          width: 100%;
          min-width: 0;
          /* Make the card a column flex container so the table can stretch to
             fill the card's full height. Combined with align-items: stretch on
             the parent grid, this keeps the table card visually in sync with
             the chart card to its left even though the table content alone
             would be shorter. */
          display: flex;
          flex-direction: column;
        }
        .endowment-multiplier-table table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
          /* Flex-grow the table inside the card; rows will distribute the
             extra vertical space evenly so the card never has an empty white
             strip at the bottom. */
          flex: 1;
          height: 100%;
        }
        .endowment-multiplier-table thead th {
          background: #f8fafc;
          padding: 16px 20px;
          text-align: left;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          border-bottom: 1px solid #e5e7eb;
          word-break: break-word;
        }
        .endowment-multiplier-table thead th.endowment-right,
        .endowment-multiplier-table tbody td.endowment-right {
          text-align: right;
        }
        .endowment-multiplier-table tbody td {
          padding: 18px 20px;
          border-bottom: 1px solid #f1f5f9;
          font-size: 15px;
          color: #374151;
          font-variant-numeric: tabular-nums;
          word-break: break-word;
        }
        .endowment-multiplier-table tbody tr:last-child td {
          border-bottom: 0;
        }
        .endowment-multiplier-table tbody tr.endowment-highlight {
          background: linear-gradient(90deg, rgba(252, 211, 77, 0.12), rgba(252, 211, 77, 0.04));
        }
        .endowment-multiplier-table tbody tr.endowment-highlight td {
          color: #0b1530;
          font-weight: 600;
        }
        .endowment-mult-pill {
          display: inline-flex;
          padding: 4px 10px;
          border-radius: 9999px;
          background: #eff4ff;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 700;
        }
        .endowment-mult-pill-gold {
          background: #fef3c7;
          color: #b45309;
        }
        @media (max-width: 640px) {
          .endowment-multiplier-table thead th {
            padding: 12px 10px;
            font-size: 10px;
            letter-spacing: 0.06em;
          }
          .endowment-multiplier-table tbody td {
            padding: 14px 10px;
            font-size: 13px;
          }
          .endowment-mult-pill {
            padding: 3px 8px;
            font-size: 12px;
          }
        }
      `}</style>
    </section>
  );
}
