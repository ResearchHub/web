'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface FAQItem {
  q: string;
  a: string;
}

const ITEMS: ReadonlyArray<FAQItem> = [
  {
    q: 'Where does my gift actually go?',
    a: 'Gifts fund preregistered research proposals on ResearchHub. You can back a specific proposal, give to a research area, or deposit into the endowment. In every case the capital can only be spent on science.',
  },
  {
    q: 'How much of my gift reaches research?',
    a: 'Giving on ResearchHub is non-extractive. Funds are directed straight to the researchers carrying out the work, with no middlemen taking a cut of your donation.',
  },
  {
    q: 'What does it mean to endow a gift?',
    a: 'When you deposit into the ResearchHub Endowment, your principal stays fully revocable while the daily yield it earns is distributed as Funding Credits that fund new research, every day, for as long as the principal is held.',
  },
  {
    q: 'Can I give a recurring gift?',
    a: 'Yes. You can set up a monthly gift that automatically backs new, high-momentum proposals, so your impact compounds without you having to revisit the page each time.',
  },
  {
    q: 'Do I get to see the impact of my gift?',
    a: 'Yes. Every proposal you fund is open and preregistered, so you can follow the work from funded to published and reuse the results yourself.',
  },
  {
    q: 'Who can give?',
    a: 'Anyone. Individual donors, foundations, and institutions can all give on ResearchHub, and every contribution flows into the same open-science pipeline.',
  },
];

export function GiveFAQ() {
  const [open, setOpen] = useState(0);

  return (
    <section className="give-faq">
      <div className="give-faq-inner give-faq-head">
        <h2 className="give-faq-h2">
          Funding, <span className="give-faq-accent">explained.</span>
        </h2>
      </div>

      <div className="give-faq-inner">
        <div className="give-faq-list">
          {ITEMS.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`give-faq-item${isOpen ? ' give-faq-open' : ''}`}>
                <button
                  type="button"
                  className="give-faq-q"
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                >
                  <span>{item.q}</span>
                  <span className="give-faq-chev" aria-hidden>
                    <Plus className="w-4 h-4" strokeWidth={2.5} />
                  </span>
                </button>
                {isOpen && <div className="give-faq-a">{item.a}</div>}
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .give-faq {
          padding: 96px 28px;
          background: #fff;
        }
        .give-faq-inner {
          max-width: 1100px;
          margin: 0 auto;
        }
        .give-faq-head {
          text-align: center;
        }
        .give-faq-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 52px;
          line-height: 1.08;
          letter-spacing: -0.024em;
          color: #0b1530;
          text-wrap: balance;
          margin: 0 0 18px;
        }
        .give-faq-accent {
          background: linear-gradient(90deg, #3971ff, #4a7fff, #5b8dff);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .give-faq-list {
          margin-top: 40px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        @media (max-width: 1100px) {
          .give-faq-h2 {
            font-size: 38px;
          }
        }
      `}</style>
      <style jsx global>{`
        .give-faq-item {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          overflow: hidden;
          transition: all 0.2s;
        }
        .give-faq-item:hover {
          border-color: #bfdbfe;
        }
        .give-faq-open {
          border-color: #3971ff;
          box-shadow: 0 8px 24px -12px rgba(57, 113, 255, 0.25);
        }
        .give-faq-q {
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
        .give-faq-chev {
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
        .give-faq-open .give-faq-chev {
          background: #3971ff;
          color: #fff;
          transform: rotate(45deg);
        }
        .give-faq-a {
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
