'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const ITEMS: ReadonlyArray<FAQItem> = [
  {
    q: 'How do referral rewards work?',
    a: 'When a funder joins through your link and backs research, you both earn 10% of their contribution as Funding Credits. The more they fund, the more credits you each receive.',
  },
  {
    q: 'What can I do with my referral credits?',
    a: 'Funding Credits are non-extractive: they can only be used to fund research on ResearchHub. Direct them to your own proposal or back any open, preregistered proposal you believe in.',
  },
  {
    q: 'When do referral rewards expire?',
    a: 'The 10% bonus applies to everything your referred funder contributes during their first six months on ResearchHub. We flag referrals that are expiring soon so you never miss the window.',
  },
  {
    q: 'Who can I refer?',
    a: 'Anyone who wants to fund science. Share your link with individual donors, foundations, lab partners, or your wider network. Every funder you bring in helps move open science forward.',
  },
  {
    q: 'How do I share my link?',
    a: 'Copy your personal link, show a QR code, or post straight to X, LinkedIn, or Bluesky from the share card above. Each contains your unique referral code so your rewards are tracked automatically.',
  },
  {
    q: 'Do my referrals get anything?',
    a: 'Yes. Your referred funders receive the same 10% bonus in Funding Credits, so joining through your link stretches their impact further too.',
  },
];

export function ReferralFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="referral-faq">
      <div className="referral-faq-inner referral-faq-head">
        <h2 className="referral-faq-h2">
          Referrals, <span className="referral-faq-accent">explained.</span>
        </h2>
      </div>

      <div className="referral-faq-inner">
        <div className="referral-faq-list">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`referral-faq-item${isOpen ? ' referral-faq-open' : ''}`}
              >
                <button
                  type="button"
                  className="referral-faq-q"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="referral-faq-chev" aria-hidden>
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </button>
                {isOpen && <div className="referral-faq-a">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .referral-faq {
          padding: 96px 28px;
          background: #fff;
        }
        .referral-faq-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .referral-faq-head {
          text-align: center;
        }
        .referral-faq-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .referral-faq-accent {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .referral-faq-list {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (max-width: 1100px) {
          .referral-faq-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 640px) {
          .referral-faq {
            padding: 64px 16px;
          }
          .referral-faq-h2 {
            font-size: 30px;
          }
        }
      `}</style>
      <style jsx global>{`
        .referral-faq-item {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .referral-faq-item:hover {
          border-color: #bfdbfe;
        }
        .referral-faq-open {
          border-color: #3971ff;
          box-shadow: 0 8px 24px -12px rgba(57, 113, 255, 0.25);
        }
        .referral-faq-q {
          width: 100%;
          padding: 22px 24px;
          background: transparent;
          border: 0;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          font-size: 17px;
          font-weight: 600;
          color: #0b1530;
          cursor: pointer;
        }
        .referral-faq-chev {
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #4b5563;
          font-weight: 700;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .referral-faq-open .referral-faq-chev {
          background: #3971ff;
          color: #fff;
          transform: rotate(45deg);
        }
        .referral-faq-a {
          padding: 0 24px 22px;
          font-size: 15px;
          color: #4b5563;
          line-height: 1.65;
          max-width: 800px;
        }
      `}</style>
    </section>
  );
}
