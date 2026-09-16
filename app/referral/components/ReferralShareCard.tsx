'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXTwitter, faLinkedin, faBluesky } from '@fortawesome/free-brands-svg-icons';
import { Copy, Check, QrCode } from 'lucide-react';
import { PixelBackdrop } from '@/app/endowment/components/PixelBackdrop';
import { CosmosPixelFade } from '@/app/give/components/CosmosPixelFade';
import { QRCodeModal } from '@/components/Referral/QRCodeModal';
import { useReferralShare } from './useReferralShare';

export function ReferralShareCard() {
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const {
    currentUser,
    isLoading,
    referralLink,
    isCopied,
    copyLink,
    logQrCodeClick,
    shareOnX,
    shareOnLinkedIn,
    shareOnBlueSky,
  } = useReferralShare();

  const handleQrCodeClick = () => {
    logQrCodeClick();
    setIsQrModalOpen(true);
  };

  return (
    <section id="referral-share" className="referral-share">
      <CosmosPixelFade height={120} />
      <PixelBackdrop side="bottom-left" className="referral-share-pixel" />
      <PixelBackdrop side="bottom-right" className="referral-share-pixel" />

      <div className="referral-share-inner">
        <h2 className="referral-share-h2">
          Your personal <span className="referral-share-accent">referral link.</span>
        </h2>
        <p className="referral-share-lead">
          Share it anywhere. Every funder who joins through your link earns you both a 10% bonus.
        </p>

        <div className="referral-share-card">
          {isLoading ? (
            <div className="referral-share-skeleton" aria-hidden>
              <div className="referral-share-skel-input" />
              <div className="referral-share-skel-row">
                <div className="referral-share-skel-btn" />
                <div className="referral-share-skel-btn" />
              </div>
            </div>
          ) : !currentUser ? (
            <p className="referral-share-signedout">Sign in to get your referral link.</p>
          ) : (
            <>
              <label htmlFor="referral-link-input" className="referral-share-label">
                Your link
              </label>
              <input
                id="referral-link-input"
                type="text"
                readOnly
                value={referralLink}
                className="referral-share-input"
                onFocus={(e) => e.currentTarget.select()}
              />

              <div className="referral-share-actions">
                <button type="button" onClick={copyLink} className="referral-share-copy">
                  {isCopied ? (
                    <Check className="w-[18px] h-[18px]" strokeWidth={2.5} aria-hidden />
                  ) : (
                    <Copy className="w-[18px] h-[18px]" aria-hidden />
                  )}
                  {isCopied ? 'Copied!' : 'Copy link'}
                </button>
                <button
                  type="button"
                  onClick={handleQrCodeClick}
                  className="referral-share-qr"
                  aria-label="Show QR code"
                >
                  <QrCode className="w-[18px] h-[18px]" aria-hidden />
                  QR code
                </button>
              </div>

              <div className="referral-share-divider" />

              <div className="referral-share-social">
                <span className="referral-share-social-label">Share on</span>
                <button
                  type="button"
                  onClick={shareOnX}
                  className="referral-share-social-btn"
                  aria-label="Share on X"
                >
                  <FontAwesomeIcon icon={faXTwitter} className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={shareOnLinkedIn}
                  className="referral-share-social-btn"
                  aria-label="Share on LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={shareOnBlueSky}
                  className="referral-share-social-btn"
                  aria-label="Share on Bluesky"
                >
                  <FontAwesomeIcon icon={faBluesky} className="h-5 w-5" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <QRCodeModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        referralLink={referralLink}
      />

      <style jsx>{`
        .referral-share {
          position: relative;
          z-index: 2;
          /* Pull up over the hero and round the top edge into a shallow dome so
             the cosmos peeks through the corners and the boundary slopes gently
             upward toward the middle. */
          margin-top: -46px;
          border-top-left-radius: 50% 46px;
          border-top-right-radius: 50% 46px;
          padding: 128px 28px 96px;
          background:
            radial-gradient(ellipse 90% 70% at 50% -10%, rgba(57, 113, 255, 0.1), transparent 60%),
            linear-gradient(180deg, #eef3ff 0%, #f4f7ff 45%, #ffffff 100%);
          color: #0b1530;
          overflow: hidden;
        }
        .referral-share :global(.referral-share-pixel) {
          z-index: 0;
          opacity: 0.4;
        }
        .referral-share-inner {
          position: relative;
          z-index: 2;
          max-width: 720px;
          margin: 0 auto;
          text-align: center;
        }
        .referral-share-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 48px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 14px;
        }
        .referral-share-accent {
          color: #3971ff;
        }
        .referral-share-lead {
          font-size: 18px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0 auto 36px;
          max-width: 560px;
        }
        .referral-share-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 28px 28px 26px;
          box-shadow: 0 30px 70px -36px rgba(13, 30, 80, 0.28);
          text-align: left;
        }
        .referral-share-label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #6b7280;
          margin-bottom: 8px;
        }
        .referral-share-input {
          width: 100%;
          height: 50px;
          padding: 0 16px;
          border: 1px solid #d1d5db;
          border-radius: 12px;
          background: #f9fafb;
          color: #0b1530;
          font-size: 15px;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }
        .referral-share-input:focus {
          outline: none;
          border-color: #3971ff;
          box-shadow: 0 0 0 3px rgba(57, 113, 255, 0.18);
        }
        .referral-share-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-top: 14px;
        }
        .referral-share-copy,
        .referral-share-qr {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          height: 50px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 0.15s ease,
            box-shadow 0.15s ease,
            border-color 0.15s ease,
            color 0.15s ease;
        }
        .referral-share-copy {
          color: #fff;
          background: linear-gradient(to right, #3971ff, #4a7fff);
          box-shadow: 0 8px 20px -8px rgba(57, 113, 255, 0.55);
          border: 0;
        }
        .referral-share-copy:hover {
          background: linear-gradient(to right, #2c5ee8, #3971ff);
          box-shadow: 0 12px 24px -8px rgba(57, 113, 255, 0.7);
        }
        .referral-share-qr {
          color: #1d4ed8;
          background: #eff4ff;
          border: 1px solid #dbeafe;
        }
        .referral-share-qr:hover {
          background: #dbeafe;
          border-color: #bfdbfe;
        }
        .referral-share-divider {
          height: 1px;
          background: #eef2f7;
          margin: 22px 0 18px;
        }
        .referral-share-social {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .referral-share-social-label {
          font-size: 13px;
          font-weight: 600;
          color: #6b7280;
          margin-right: 4px;
        }
        .referral-share-social-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          color: #374151;
          background: #f3f4f6;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition:
            background 0.15s ease,
            color 0.15s ease,
            border-color 0.15s ease,
            transform 0.15s ease;
        }
        .referral-share-social-btn:hover {
          background: #eff4ff;
          color: #3971ff;
          border-color: #bfdbfe;
          transform: translateY(-2px);
        }
        .referral-share-signedout {
          margin: 0;
          padding: 14px 0;
          text-align: center;
          color: #4b5563;
          font-size: 15px;
        }
        .referral-share-skeleton {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .referral-share-skel-input {
          height: 50px;
          border-radius: 12px;
          background: #eef2f7;
          animation: referralPulse 1.4s ease-in-out infinite;
        }
        .referral-share-skel-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .referral-share-skel-btn {
          height: 50px;
          border-radius: 12px;
          background: #eef2f7;
          animation: referralPulse 1.4s ease-in-out infinite;
        }
        @keyframes referralPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.55;
          }
        }
        @media (max-width: 640px) {
          .referral-share {
            padding: 120px 16px 64px;
          }
          .referral-share-h2 {
            font-size: 30px;
          }
          .referral-share-card {
            padding: 22px 18px 20px;
          }
          .referral-share-social {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </section>
  );
}
