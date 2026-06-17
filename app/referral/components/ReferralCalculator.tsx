'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserTie, faUser } from '@fortawesome/pro-light-svg-icons';

export function ReferralCalculator() {
  const [fundingAmount, setFundingAmount] = useState(7100);
  const referralBonus = fundingAmount * 0.1;

  const handleSliderChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFundingAmount(Number(event.target.value));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '') {
      setFundingAmount(0);
      return;
    }
    const numValue = Number(value.replace(/,/g, ''));
    if (!isNaN(numValue)) {
      setFundingAmount(numValue);
    }
  };

  const formattedBonus = referralBonus.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Slider fill: percentage of the 0–50k track that is "active", used to paint
  // the blue progress portion of the range input.
  const fillPercent = Math.max(0, Math.min(100, (fundingAmount / 50000) * 100));

  return (
    <section className="referral-calc">
      <div className="referral-calc-inner">
        <div className="referral-calc-head">
          <h2 className="referral-calc-h2">
            Estimate your <span className="referral-calc-accent">referral bonus.</span>
          </h2>
          <p className="referral-calc-lead">
            See how much you and your referred funder each earn in Funding Credits.
          </p>
        </div>

        <div className="referral-calc-card">
          <div className="referral-calc-blob" aria-hidden />
          <div className="referral-calc-field">
            <label htmlFor="referralFundingAmount" className="referral-calc-label">
              If your referred funder contributes
            </label>
            <div className="referral-calc-amount">
              <span className="referral-calc-currency">$</span>
              <input
                type="text"
                id="referralFundingAmount"
                value={fundingAmount.toLocaleString('en-US')}
                onChange={handleInputChange}
                className="referral-calc-input"
                placeholder="1,000"
                inputMode="numeric"
              />
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="100"
              value={fundingAmount}
              onChange={handleSliderChange}
              className="referral-calc-slider"
              style={{
                background: `linear-gradient(to right, #5b8dff 0%, #3971ff ${fillPercent}%, rgba(255,255,255,0.14) ${fillPercent}%, rgba(255,255,255,0.14) 100%)`,
              }}
              aria-label="Funding amount"
            />
          </div>

          <div className="referral-calc-results">
            <div className="referral-calc-result">
              <FontAwesomeIcon icon={faUser} className="referral-calc-result-icon" />
              <span className="referral-calc-result-label">You receive</span>
              <span className="referral-calc-result-val">${formattedBonus}</span>
            </div>
            <div className="referral-calc-result">
              <FontAwesomeIcon icon={faUserTie} className="referral-calc-result-icon" />
              <span className="referral-calc-result-label">Funder receives</span>
              <span className="referral-calc-result-val">${formattedBonus}</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .referral-calc {
          padding: 96px 28px;
          background: #fff;
        }
        .referral-calc-inner {
          max-width: 900px;
          margin: 0 auto;
        }
        .referral-calc-head {
          text-align: center;
          max-width: 720px;
          margin: 0 auto 48px;
        }
        .referral-calc-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .referral-calc-accent {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .referral-calc-lead {
          font-size: 19px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0;
        }
        .referral-calc-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 40px;
          background:
            radial-gradient(circle at 78% 12%, rgba(67, 56, 202, 0.4), transparent 55%),
            linear-gradient(168deg, #0b1238 0%, #101a45 55%, #1a235e 100%);
          box-shadow: 0 40px 80px -30px rgba(13, 30, 80, 0.5);
          color: #e2e8f0;
        }
        .referral-calc-blob {
          position: absolute;
          width: 360px;
          height: 360px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(57, 113, 255, 0.22), transparent 70%);
          filter: blur(40px);
          pointer-events: none;
          top: -140px;
          right: -120px;
        }
        .referral-calc-field {
          position: relative;
          z-index: 1;
          text-align: center;
          margin-bottom: 36px;
        }
        .referral-calc-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #c7d2fe;
          margin-bottom: 14px;
        }
        .referral-calc-amount {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .referral-calc-currency {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 36px;
          font-weight: 700;
          color: #93c5fd;
        }
        .referral-calc-input {
          width: 240px;
          background: transparent;
          border: 0;
          border-bottom: 2px solid rgba(147, 197, 253, 0.4);
          color: #fff;
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 44px;
          font-weight: 700;
          text-align: center;
          padding-bottom: 6px;
          transition: border-color 0.15s ease;
        }
        .referral-calc-input:focus {
          outline: none;
          border-bottom-color: #3971ff;
        }
        .referral-calc-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 8px;
          border-radius: 9999px;
          margin-top: 28px;
          cursor: pointer;
        }
        .referral-calc-results {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .referral-calc-result {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 16px;
          padding: 18px 20px;
        }
        .referral-calc-result-label {
          font-size: 15px;
          font-weight: 600;
          color: #e2e8f0;
        }
        .referral-calc-result-val {
          margin-left: auto;
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          white-space: nowrap;
        }
        @media (max-width: 1100px) {
          .referral-calc-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .referral-calc {
            padding: 64px 16px;
          }
          .referral-calc-h2 {
            font-size: 30px;
          }
          .referral-calc-lead {
            font-size: 16px;
          }
          .referral-calc-card {
            padding: 28px 20px;
          }
          .referral-calc-input {
            width: 180px;
            font-size: 34px;
          }
          .referral-calc-results {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      <style jsx global>{`
        .referral-calc-result-icon {
          width: 22px;
          height: 22px;
          color: #93c5fd;
          flex-shrink: 0;
        }
        .referral-calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #3971ff;
          box-shadow: 0 4px 12px -2px rgba(57, 113, 255, 0.7);
          cursor: pointer;
        }
        .referral-calc-slider::-moz-range-thumb {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #3971ff;
          box-shadow: 0 4px 12px -2px rgba(57, 113, 255, 0.7);
          cursor: pointer;
        }
        .referral-calc-slider:focus-visible {
          outline: 2px solid #93c5fd;
          outline-offset: 4px;
        }
      `}</style>
    </section>
  );
}
