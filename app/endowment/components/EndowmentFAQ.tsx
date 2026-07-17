'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const ITEMS: ReadonlyArray<FAQItem> = [
  {
    q: 'Where does the yield come from?',
    a: 'New RSC is emitted by the protocol on a decaying schedule (9.5M RSC in year one, halving every 64 years). Each day, that emission is distributed to RSC holders proportional to their share of total RSC held on the platform, paid out as Funding Credits.',
  },
  {
    q: 'Can I withdraw my principal?',
    a: 'Yes. Your RSC stays in your ResearchHub account and is fully revocable. There are no lockups, no gas fees, and no slashing. Withdraw at any time.',
  },
  {
    q: 'What can I do with Funding Credits?',
    a: 'Funding Credits can only be used to fund research by directing them to preregistered proposals on ResearchHub. They are non-transferable, which keeps the capital flowing into science.',
  },
  {
    q: 'How are credits distributed?',
    a: 'Distribution happens daily. A proportional share of the annual emission is calculated and credited to each eligible RSC holder, based on their balance at the time of distribution.',
  },
  {
    q: 'Is this only for institutions?',
    a: 'No. Anyone holding RSC in a ResearchHub account is automatically earning Funding Credits. Institutions, foundations, and individual donors can all participate.',
  },
];

export function EndowmentFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="endowment-section endowment-section-white">
      <div className="endowment-section-narrow endowment-text-center">
        <h2 className="endowment-section-title">
          The mechanism, <span className="endowment-gradient-text">explained.</span>
        </h2>
      </div>

      <div className="endowment-section-narrow">
        <div className="endowment-faq-list">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={`endowment-faq-item${isOpen ? ' endowment-faq-open' : ''}`}
              >
                <button
                  type="button"
                  className="endowment-faq-q"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="endowment-faq-chev" aria-hidden>
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </button>
                {isOpen && <div className="endowment-faq-a">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .endowment-section {
          padding: 96px 28px;
        }
        .endowment-section-white {
          background: #fff;
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
        .endowment-gradient-text {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .endowment-faq-list {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (max-width: 1100px) {
          .endowment-section-title {
            font-size: 38px;
          }
        }
      `}</style>
      <style jsx global>{`
        .endowment-faq-item {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .endowment-faq-item:hover {
          border-color: #bfdbfe;
        }
        .endowment-faq-open {
          border-color: #3971ff;
          box-shadow: 0 8px 24px -12px rgba(57, 113, 255, 0.25);
        }
        .endowment-faq-q {
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
        .endowment-faq-chev {
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
        .endowment-faq-open .endowment-faq-chev {
          background: #3971ff;
          color: #fff;
          transform: rotate(45deg);
        }
        .endowment-faq-a {
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
