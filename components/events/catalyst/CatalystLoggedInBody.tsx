'use client';

import { CATALYST_NYC_EVENT, formatCredit } from './constants';

const { footer, loggedIn, contact, creditAmount } = CATALYST_NYC_EVENT;

interface CatalystLoggedInBodyProps {
  email: string;
  variant: 'mobile' | 'desktop';
  onContinue: () => void;
  showFooter?: boolean;
}

export function CatalystLoggedInBody({
  email,
  variant,
  onContinue,
  showFooter = false,
}: CatalystLoggedInBodyProps) {
  const isMobile = variant === 'mobile';

  return (
    <>
      <h1 className={`title ${isMobile ? 'title--mobile' : 'title--desktop'}`}>{loggedIn.title}</h1>

      <p className={`body ${isMobile ? 'body--mobile' : 'body--desktop'}`}>
        You&apos;re signed in as <strong>{email}</strong>. {loggedIn.bodyPrefix} —{' '}
        {loggedIn.bodySuffix} {formatCredit(creditAmount)}.
      </p>

      <p className={`help ${isMobile ? 'help--mobile' : 'help--desktop'}`}>
        {loggedIn.mismatchPrefix}{' '}
        <strong>
          {contact.name} ({contact.role})
        </strong>{' '}
        at{' '}
        <a href={`mailto:${contact.email}`} className="contact-link">
          {contact.email}
        </a>
        .
      </p>

      <button
        className={`cta ${isMobile ? 'cta--mobile' : 'cta--desktop'}`}
        type="button"
        onClick={onContinue}
      >
        {loggedIn.continueLabel}
      </button>

      {showFooter && (
        <p className={`foot ${isMobile ? 'foot--mobile' : 'foot--desktop'}`}>{footer}</p>
      )}

      <style jsx>{`
        .title {
          font-weight: 600;
          letter-spacing: -0.03em;
          text-align: left;
          line-height: 1.05;
        }
        .title--mobile {
          font-size: 38px;
          margin-bottom: 24px;
          color: #fff;
        }
        .title--desktop {
          font-size: 32px;
          line-height: 1.1;
          margin: 24px 0 16px;
          color: #0c0720;
        }
        .body {
          font-size: 16px;
          line-height: 1.5;
          margin-bottom: 20px;
        }
        .body--mobile {
          color: rgba(255, 255, 255, 0.88);
          margin-bottom: 20px;
        }
        .body--mobile strong {
          color: #fff;
          font-weight: 600;
        }
        .body--desktop {
          color: #374151;
          margin-bottom: 16px;
        }
        .body--desktop strong {
          color: #111827;
          font-weight: 600;
        }
        .help {
          font-size: 14px;
          line-height: 1.5;
        }
        .help--mobile {
          color: rgba(255, 255, 255, 0.72);
          margin-bottom: 28px;
        }
        .help--mobile strong {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 600;
        }
        .help--desktop {
          color: #6b7280;
          margin-bottom: 24px;
        }
        .help--desktop strong {
          color: #374151;
          font-weight: 600;
        }
        .contact-link {
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .body--mobile .contact-link,
        .help--mobile .contact-link {
          color: #c8b6f2;
        }
        .body--mobile .contact-link:hover,
        .help--mobile .contact-link:hover {
          color: #fff;
        }
        .body--desktop .contact-link,
        .help--desktop .contact-link {
          color: #3971ff;
        }
        .body--desktop .contact-link:hover,
        .help--desktop .contact-link:hover {
          color: #2563eb;
        }
        .contact-link:focus-visible {
          outline: 2px solid #c8b6f2;
          outline-offset: 2px;
          border-radius: 2px;
        }
        .cta {
          width: 100%;
          border: none;
          background: #3971ff;
          color: #fff;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .cta--mobile {
          height: 56px;
          border-radius: 14px;
          box-shadow: 0 10px 26px -8px rgba(57, 113, 255, 0.7);
        }
        .cta--desktop {
          height: 48px;
          border-radius: 12px;
        }
        .cta:hover {
          background: #2563eb;
        }
        .cta:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 2px;
        }
        .foot {
          text-align: center;
          font-size: 12px;
        }
        .foot--mobile {
          margin-top: 0;
          color: rgba(255, 255, 255, 0.5);
        }
        .foot--desktop {
          margin-top: 20px;
          color: #9ca3af;
        }
      `}</style>
    </>
  );
}
