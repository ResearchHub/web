'use client';

import Image from 'next/image';

interface Step {
  num: string;
  image: string;
  alt: string;
  title: string;
  body: string;
}

const STEPS: ReadonlyArray<Step> = [
  {
    num: '01',
    image: '/referral/share_your_link.webp',
    alt: 'Person sharing referral link from laptop',
    title: 'Share your link',
    body: 'Send your unique referral link to potential funders, big or small.',
  },
  {
    num: '02',
    image: '/referral/user_funds_research.webp',
    alt: 'Person funding research with flask',
    title: 'They fund research',
    body: 'Your referred funder backs a preregistered proposal on ResearchHub.',
  },
  {
    num: '03',
    image: '/referral/you_both_rewarded.webp',
    alt: 'Two people holding reward coins',
    title: 'You both get rewarded',
    body: 'You each receive 10% of their funded amount in credits to support more research.',
  },
];

export function ReferralHowItWorks() {
  return (
    <section id="referral-how" className="referral-how">
      <div className="referral-how-inner referral-how-head">
        <h2 className="referral-how-h2">
          How referrals <span className="referral-how-accent">work.</span>
        </h2>
        <p className="referral-how-lead">
          Three simple steps turn your network into funding for open science.
        </p>
      </div>

      <div className="referral-how-inner">
        <div className="referral-how-grid">
          {STEPS.map((step) => (
            <div key={step.num} className="referral-how-card">
              <div className="referral-how-art">
                <Image
                  src={step.image}
                  alt={step.alt}
                  width={200}
                  height={200}
                  className="referral-how-img"
                />
                <span className="referral-how-num">{step.num}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .referral-how {
          padding: 96px 28px;
          background: #fff;
        }
        .referral-how-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .referral-how-head {
          text-align: center;
          max-width: 760px;
        }
        .referral-how-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .referral-how-accent {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .referral-how-lead {
          font-size: 19px;
          color: #4b5563;
          line-height: 1.6;
          margin: 0 auto;
        }
        .referral-how-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 56px;
        }
        @media (max-width: 1100px) {
          .referral-how-h2 {
            font-size: 38px;
          }
        }
        @media (max-width: 900px) {
          .referral-how-grid {
            grid-template-columns: 1fr;
            gap: 20px;
            max-width: 460px;
            margin-left: auto;
            margin-right: auto;
          }
        }
        @media (max-width: 640px) {
          .referral-how {
            padding: 64px 16px;
          }
          .referral-how-h2 {
            font-size: 30px;
          }
          .referral-how-lead {
            font-size: 16px;
          }
        }
      `}</style>
      <style jsx global>{`
        .referral-how-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 28px 24px;
          box-shadow: 0 18px 40px -24px rgba(13, 30, 80, 0.15);
          transition:
            transform 0.25s ease,
            box-shadow 0.25s ease,
            border-color 0.25s ease;
        }
        .referral-how-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 26px 50px -22px rgba(57, 113, 255, 0.22);
          border-color: #bfdbfe;
        }
        .referral-how-art {
          position: relative;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .referral-how-art .referral-how-img {
          width: 160px;
          height: 160px;
          object-fit: contain;
        }
        .referral-how-num {
          position: absolute;
          top: 0;
          right: 8px;
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 48px;
          font-weight: 700;
          line-height: 1;
          color: #eff4ff;
          letter-spacing: -0.04em;
          pointer-events: none;
        }
        .referral-how-card h3 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-size: 21px;
          font-weight: 700;
          color: #0b1530;
          margin: 0 0 8px;
          letter-spacing: -0.018em;
        }
        .referral-how-card p {
          font-size: 15px;
          color: #4b5563;
          line-height: 1.55;
          margin: 0;
        }
      `}</style>
    </section>
  );
}
